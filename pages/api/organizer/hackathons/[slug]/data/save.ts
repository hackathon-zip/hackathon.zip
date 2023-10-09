// @ts-nocheck

import prisma from "@/lib/prisma";
import { Column } from "@/pages/[slug]/data";
import { getAuth } from "@clerk/nextjs/server";
import type { AttendeeAttributeValue } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { v4 as uuidv4 } from "uuid";

function c<T>(x: T): T {
    console.log(x);
    return x;
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    try {
        let newData = req.body as { shape: Column[]; content: string[][] };
        const { slug } = req.query;

        let hackathon = await prisma.hackathon.findUnique({
            where: {
                slug: slug as string
            }
        });

        if (hackathon == null) throw new Error("no hackathon!");

        const attendeeAttributes = await prisma.attendeeAttribute.findMany({
            where: {
                hackathon: {
                    slug: slug as string
                }
            }
        });

        const toCreateAttributes = newData.shape
            .map((column, i) => ({
                id: column.id,
                name: column.name,
                type: column.type,
                order: i,
                hackathonId: hackathon.id
            }))
            .filter((column) => column.id == "to-create")
            .map((x) => ({ ...x, id: undefined }));

        const toUpdateAttributes = newData.shape
            .map((column, i) => ({
                id: column.id,
                name: column.name,
                type: column.type,
                order: i
            }))
            .filter(
                (column) => column.id != "to-create" && column.id != "built-in"
            );

        const createManyAttendeeAttributes = await prisma.$transaction(
            toCreateAttributes.map((x) =>
                prisma.attendeeAttribute.create({
                    data: x
                })
            )
        );

        let k: number = 0;

        newData.shape.map((x) => {
            if (x.id == "to-create") {
                x.id = createManyAttendeeAttributes[k].id;
            }
            return x;
        });

        await prisma.$transaction(
            toUpdateAttributes.map((x) =>
                prisma.attendeeAttribute.update({
                    where: {
                        id: x.id
                    },
                    data: {
                        ...x
                    }
                })
            )
        );

        const currentAttendees = await prisma.attendee.findMany({
            where: {
                hackathonId: hackathon.id
            },
            include: {
                attributeValues: true
            }
        });

        let newAttendees: { [key: string]: string[] } = newData.content
            .slice(1)
            .reduce((a, v) => ({ ...a, [v[0]]: v }), {});

        let toUpdateAttendees: {
            id: string;
            email: string;
            name: string;
            attributes: { id: string; value: string }[];
        }[] = [];

        currentAttendees.map((attendee) => {
            let newAttendee = newAttendees[attendee.id];
            if (newAttendee == undefined) {
                return; // TO IMPLEMENT: DELETING
            }
            let oldAttributes: { [key: string]: AttendeeAttributeValue[] } =
                attendee.attributeValues.reduce(
                    (a, v) => ({ ...a, [v.formFieldId]: v }),
                    {}
                );
            let oldAttendee = [
                attendee.id,
                attendee.email,
                attendee.name,
                String(attendee.checkedIn),
                ...newData.shape
                    .slice(4)
                    .map((x) => oldAttributes[x.id] || "undefined")
            ];
            if (oldAttendee != newAttendee) {
                // this logic needs checking newAttendee !== oldAttendee
                toUpdateAttendees.push({
                    id: attendee.id,
                    email: newAttendee[2],
                    name: newAttendee[1],
                    attributes: newAttendee.slice(4).map((attribute, i) => ({
                        id: newData.shape[4 + i].id,
                        value: attribute
                    }))
                });
            }
            delete newAttendees[attendee.id];
        });

        console.log("TO UPDATE", toUpdateAttendees);

        let toCreateAttendees = Object.values(newAttendees).map((x) => ({
            email: x[2],
            name: x[1],
            attributes: x.slice(4).map((attribute, i) => ({
                id: newData.shape[4 + i].id,
                value: attribute
            })),
            id: uuidv4()
        }));

        await prisma.$transaction(
            toCreateAttendees.map((x) => {
                return prisma.attendee.create({
                    data: {
                        id: x.id,
                        email: x.email,
                        name: x.name,
                        hackathonId: hackathon.id,
                        attributeValues: {
                            create: x.attributes
                                .filter(
                                    (b) => b.value != null && b.id != "built-in"
                                )
                                .map((y) => ({
                                    id: `${y.id}-${x.id}`,
                                    formFieldId: y.id,
                                    value: y.value
                                }))
                        }
                    }
                });
            })
        );

        toUpdateAttendees.map((x) =>
            console.log({
                where: {
                    id: x.id
                },
                data: {
                    email: x.email,
                    name: x.name
                }
            })
        );

        await prisma.$transaction(
            toUpdateAttendees.map((x) =>
                prisma.attendee.update({
                    where: {
                        id: x.id
                    },
                    data: {
                        email: x.email,
                        name: x.name
                    }
                })
            )
        );

        console.log("FIRST TO UPDATE:");
        console.log(
            toUpdateAttendees[0].attributes.filter(
                (b) => b.value != null && b.id != "built-in"
            )
        );

        await prisma.$transaction(
            toUpdateAttendees
                .map((x) => {
                    return x.attributes
                        .filter((b) => b.value != null && b.id != "built-in")
                        .map((y) => {
                            return prisma.attendeeAttributeValue.upsert({
                                create: {
                                    id: `${y.id}-${x.id}`,
                                    formFieldId: y.id,
                                    value: y.value,
                                    attendeeId: x.id
                                },
                                update: {
                                    value: y.value
                                },
                                where: {
                                    id: `${y.id}-${x.id}`,
                                    formFieldId: y.id,
                                    attendeeId: x.id
                                }
                            });
                        });
                })
                .flat()
                .filter((x) => x != null)
        );

        hackathon = await prisma.hackathon.findUnique({
            where: {
                slug: slug as string
            },
            include: {
                attendeeAttributes: true,
                attendees: {
                    include: {
                        attributeValues: true
                    }
                }
            }
        });

        res.json({
            attendeeAttributes: hackathon.attendeeAttributes,
            attendees: hackathon.attendees
        });

        res.redirect(`/${slug}/data`);
    } catch (error) {
        console.error(error);
        return res.status(400).json({ error });
    }
}
