import prisma from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    switch (req.method) {
        case "DELETE": {
            const { slug } = req.query;
            const hackathon = await prisma.hackathon.delete({
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
