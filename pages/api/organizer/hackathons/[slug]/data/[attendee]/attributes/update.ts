import prisma from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { attributeId, attendeeId, value } = req.body;

    const id = `${attributeId}-${req.query.attendee as string}`;

    console.log('updating', id, value)

    await prisma.attendeeAttributeValue.update({
        data: {
            value
        },
        where: {
            id,
            formFieldId: attributeId,
            attendeeId: attendeeId
        }
    });

    return res.json({ ok: true });
}
