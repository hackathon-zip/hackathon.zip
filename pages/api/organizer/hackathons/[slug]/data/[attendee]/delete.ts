import prisma from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    let attendee = await prisma.attendee.delete({
        where: {
            email: req.query.attendee as string,
            hackathon: {
                slug: req.query.slug as string
            }
        }
    });
    res.json({ deleted: true });
}
