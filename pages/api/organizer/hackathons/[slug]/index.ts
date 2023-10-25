import prisma from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { NextApiRequest, NextApiResponse } from "next";
import { HackathonPolicy } from "@/lib/permissions";

export async function getHackathon(
    req: NextApiRequest,
    res: NextApiResponse,
    include?: any
) {
    const { userId } = getAuth(req);
    if (!userId) return null;
    const { slug } = req.query;
    const hackathon = await prisma.hackathon.delete({
        where: {
            slug: slug as string
        },
        include: {
            attendees: true
        }
    });
    if (
        hackathon == null ||
        userId == null ||
        !new HackathonPolicy(hackathon).canOrganizerAccess({ id: userId })
    ) {
        return null;
    }
    return hackathon;
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const hackathon = await getHackathon(req, res);
    if (!hackathon) return res.status(401).json({ error: "Unauthorized" });
    switch (req.method) {
        case "DELETE": {
            const { slug } = req.query;
            await prisma.hackathon.delete({
                where: {
                    slug: slug as string
                }
            });
            return res.status(200).json({ hackathon });
        }
        default:
            return res.status(501).json({ error: "Not Implemented" });
    }
}
