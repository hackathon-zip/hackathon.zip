import prisma from "@/lib/prisma";
import { Column } from "@/pages/[slug]/data";
import { getAuth } from "@clerk/nextjs/server";
import type { AttendeeAttributeValue } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

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

        const hackathon = await prisma.hackathon.findUnique({
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

    
        let newAttendees: { [key: string]: string[] } = newData.content.slice(1).reduce(
            (a, v) => ({ ...a, [v[0]]: v }),
            {}
        );


        let toUpdateAttendees: {
            id: string;
            email: string;
            name: string;
            attributes: { id: string; value: string }[];
        }[] = [];

        currentAttendees.map((attendee) => {
            let newAttendee = newAttendees[attendee.id];
            if(newAttendee == undefined){
                return // TO IMPLEMENT: DELETING
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
                    email: newAttendee[3],
                    name: newAttendee[2],
                    attributes: newAttendee.slice(4).map((attribute, i) => ({
                        id: newData.shape[4 + i].id,
                        value: attribute
                    }))
                });
            }
            delete newAttendees[attendee.id];
        });

        console.log("TO UPDATE", toUpdateAttendees)

        let toCreateAttendees = Object.values(newAttendees).map((x) => ({
            email: x[1],
            name: x[2],
            attributes: x.slice(4).map((attribute, i) => ({
                id: newData.shape[4 + i].id,
                value: attribute
            }))
        }));

        await prisma.attendee.createMany({
            data: toCreateAttendees.map((x) => ({
                email: x.email,
                name: x.name,
                hackathonId: hackathon.id
            }))
        });

        console.log(toCreateAttendees)

        await prisma.$transaction(
            toCreateAttendees
                .map((x) => {
                    return x.attributes.map((y) => {
                        return prisma.attendeeAttributeValue.create({
                            data: {
                                formField: {
                                    connect: {
                                        id: y.id
                                    }
                                },
                                value: y.value,
                                attendee: {
                                    connect: {
                                        email: x.email
                                    }
                                }
                            }
                        });
                    });
                })
                .flat()
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
            )

        console.log(toUpdateAttendees)

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

        await prisma.$transaction(
            toUpdateAttendees
                .map((x) => {
                    return x.attributes.filter(b => b.value != null).map((y) => {
                        return prisma.attendeeAttributeValue.create({
                            data: {
                                formField: {
                                    connect: {
                                        id: y.id
                                    }
                                },
                                value: y.value,
                                attendee: {
                                    connect: {
                                        email: x.email
                                    }
                                }
                            }
                        });
                    });
                })
                .flat()
                .filter(x => x != null)
        );

        res.redirect(`/${slug}/data`);
    } catch (error) {
        console.error(error);
        return res.status(400).json({ error });
    }
}
