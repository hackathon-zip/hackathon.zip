import prisma from "@/lib/prisma";
import { permitParams } from "@/lib/utils";
import { getAuth } from "@clerk/nextjs/server";
import { Hackathon } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    try {
        const newData = req.body;
        const { slug } = req.query;

        const hackathon = await prisma.hackathon.update({
            data: {
                ...permitParams<Hackathon>(
                    [
                        "name",
                        "location",
                        "startDate",
                        "endDate",
                        "slug",
                        "bannerUrl",
                        "broadcastEnabled",
                        "checkInEnabled",
                        "financeEnabled",
                        "hcbId",
                        "integrateEnabled",
                        "logoUrl",
                        "registerEnabled",
                        "scheduleEnabled",
                        "shipEnabled",
                        "website",
                        "leadsEnabled",
                        "sponsorsEnabled",
                        "customDomain"
                    ],
                    newData
                )
            },
            where: {
                slug: slug as string
            }
        });

        console.log({ hackathon });

        res.redirect(`/${hackathon.slug}`);
    } catch (error) {
        console.error(error);
        return res.status(400).json({ error });
    }
}
