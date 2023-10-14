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
        let project = await prisma.project.delete({
            where: {
                id: req.body.id
            }
        });
        console.log(project);
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
