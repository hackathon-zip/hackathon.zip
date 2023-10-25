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
    try {
        switch (req.method) {
            case "GET":
                return res.status(501).json({ error: "Not implemented" });
            case "POST": {
                const newLead = req.body;
                const { slug } = req.query;

                const lead = await prisma.lead.create({
                    data: {
                        ...newLead,
                        hackathon: {
                            connect: {
                                slug: slug as string
                            }
                        }
                    }
                });

                return res.json(lead);
            }
        }
    } catch (error) {
        console.error(error);
        return res.status(400).json({ error });
    }
}
