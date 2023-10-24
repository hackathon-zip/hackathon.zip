import prisma from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { NextApiRequest, NextApiResponse } from "next";
import { getHackathon } from "..";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const hackathon = await getHackathon(req, res)
    if (!hackathon) return res.status(401).json({ error: "Unauthorized" });

    const { attendee, slug } = req.query;

    await prisma.$queryRaw`update "Attendee" set "checkedIn" = not "checkedIn" where "id" = ${
        attendee as string
    } returning *`;

    const attendees = await prisma.attendee.findMany({
        where: {
            hackathon: {
                slug: slug as string
            }
        }
    });

    res.json({ attendees });
}
