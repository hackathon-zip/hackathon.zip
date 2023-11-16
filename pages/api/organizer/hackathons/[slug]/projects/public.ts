import prisma from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { NextApiRequest, NextApiResponse } from "next";
import { getHackathon } from "..";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const hackathon = await getHackathon(req, res);
    if (!hackathon) return res.status(401).json({ error: "Unauthorized" });

    await prisma.hackathon.update({
        data: {
            projectsPublicized: !hackathon.projectsPublicized
        },
        where: {
            slug: hackathon.slug
        }
    });

    res.redirect(`/${hackathon.slug}/ship`)
}
