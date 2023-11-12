import prisma from "@/lib/prisma";
import { permitParams } from "@/lib/utils";
import { getAuth } from "@clerk/nextjs/server";
import { Project } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    let attendee = await prisma.project.update({
        where: {
            id: req.query.project as string
        },
        data: {
            ...permitParams<Project>(
                ["name", "coverImage", "description"],
                req.body
            )
        },
        include: {
            attributeValues: true
        }
    });
    res.json({ attendee });
}
