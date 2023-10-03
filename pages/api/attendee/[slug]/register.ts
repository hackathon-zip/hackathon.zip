import prisma from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    try {
        const { name, email } = req.body;
        const attendee = await prisma.attendee.create({
            data: {
                name,
                email,
                hackathon: {
                    connect: {
                        slug: req.query.slug as string,
                    },
                },
            },
        });

        delete req.body.name;
        delete req.body.email;

        const attributes = await prisma.attendeeAttributeValue.createMany({
            data: Object.keys(req.body).map((attribute) => ({
                value: req.body[attribute],
                attendeeId: attendee.id,
                formFieldId: attribute,
            })),
        });

        res.redirect(`/api/attendee/${req.query.slug}/sign-in`);
    } catch (error) {
        console.error(error);
        return res.status(400).json({ error });
    }
}
