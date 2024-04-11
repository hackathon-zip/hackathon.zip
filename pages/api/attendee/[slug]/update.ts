import prisma from "@/lib/prisma";
import { getHackathonSlug } from "@/lib/utils";
import { NextApiRequest, NextApiResponse } from "next";
import { permitParams } from "@/lib/utils";
import { Attendee, AttendeeAttributeValue } from "@prisma/client";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    try {
        const { name, email } = req.body;

        let slug = req.query.slug as string;

        slug = await getHackathonSlug(slug);
        
        let attendee = await prisma.attendee.findFirst({
            where: {
                tokens: {
                    some: {
                        token: req.cookies[slug]
                    }
                }
            },
            include: {
                attributeValues: true
            }
        });
        
        if (!attendee) {
            return res.status(400).json({
                error: "Attendee does not exist."
            });
        }
        
        let attendeeAttributeIds = Object.fromEntries(attendee.attributeValues.map((a : AttendeeAttributeValue) => [a.formFieldId, a.id]))
        
        console.log(attendeeAttributeIds)
        
        console.log(attendee)

        if (!attendee) {
            return res.status(400).json({
                error: "Attendee does not exist."
            });
        }
        
        await prisma.attendee.updateMany({
            where: {
                tokens: {
                    some: {
                        token: req.cookies[slug]
                    }
                }
            },
            data: {
                ...permitParams<Attendee>(["email", "name"], req.body),
                ...(req.body.applied ? {status: "Applied"} : [])
            }
        })
        
        console.log(attendee)
        
        delete req.body.name;
        delete req.body.email;
        delete req.body.applied;
        
        await prisma.$transaction(Object.keys(req.body).map((attribute) => {
            return prisma.attendeeAttributeValue.upsert({
                where: {
                    formField: {
                        id: attribute
                    },
                    attendee: {
                        id: attendee?.id
                    },
                    id: attendeeAttributeIds[attribute] || "none"
                },
                create: {
                    value: req.body[attribute], // @ts-ignore
                    attendeeId: attendee.id,
                    formFieldId: attribute
                },
                update: {
                    value: req.body[attribute]
                }
            });
        }))

        res.json(attendee);
    } catch (error) {
        console.error(error);
        return res.status(400).json({ error });
    }
}
