import prisma from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import type { Attendee } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    let attendee: Attendee = await prisma.attendee.create({
        data: {
            email: req.body.email,
            name: req.body.name,
            hackathon: {
                connect: {
                    slug: req.query.slug as string
                }
            }
        }
    });
    await prisma.$transaction(
        Object.keys(req.body)
            .filter((b) => b.startsWith("custom-"))
            .map((y) => {
                let id = y.replace("custom-", "");
                return prisma.attendeeAttributeValue.upsert({
                    create: {
                        id: `${id}-${attendee.id}`,
                        formFieldId: id,
                        value: req.body[y],
                        attendeeId: attendee.id
                    },
                    update: {
                        value: req.body[y]
                    },
                    where: {
                        id: `${id}-${attendee.id}`,
                        formFieldId: id,
                        attendeeId: attendee.id
                    }
                });
            })
    );
    attendee =
        (await prisma.attendee.findUnique({
            where: {
                id: attendee.id
            },
            include: {
                attributeValues: true
            }
        })) || attendee;
    res.json({ attendee });
}
