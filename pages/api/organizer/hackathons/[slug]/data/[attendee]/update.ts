import prisma from "@/lib/prisma";
import { permitParams } from "@/lib/utils";
import { getAuth } from "@clerk/nextjs/server";
import { Attendee } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    console.log(req.body)
    let attendee = await prisma.attendee.update({
        where: {
            id: req.query.attendee as string
        },
        data: {
            ...permitParams<Attendee>(["email", "name", "status"], req.body)
        },
        include: {
            attributeValues: true
        }
    });
    res.json({ attendee });
}
