import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { getHackathonSlug } from "@/lib/utils";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    try {
        const slug = await getHackathonSlug(req.query.slug as string);
        let attendee = await prisma.attendee.findFirst({
            where: {
                tokens: {
                    some: {
                        token: req.cookies[slug]
                    }
                }
            }
        });
        if (!attendee) {
            return res.status(400).json({
                error: "Attendee does not exist."
            });
        }
        await prisma.project.deleteMany({
            where: {
                id: req.body.id,
                collaborators: {
                    some: {
                        id: attendee.id
                    }
                }
            }
        });
        return res.json({
            deleted: true
        });
    } catch (e) {
        console.error(e);
        return res.status(400).json({
            error: "There was an unexpected error, please try again."
        });
    }
}
