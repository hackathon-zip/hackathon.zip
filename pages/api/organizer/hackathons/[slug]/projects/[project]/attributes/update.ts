import prisma from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { attributeId, projectId, value } = req.body;

    const id = `${projectId}-${req.query.project as string}`;

    console.log("updating", id, value);

    await prisma.projectAttributeValue.update({
        data: {
            value
        },
        where: {
            id,
            attributeId: attributeId,
            projectId: projectId
        }
    });

    return res.json({ ok: true });
}
