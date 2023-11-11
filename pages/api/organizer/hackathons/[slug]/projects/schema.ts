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
    let attributes: {
        [key: string]: { name?: string; type?: string; options?: string[] };
    } = {};
    Object.keys(req.body).map((key) => {
        let attributeId = key.split("_")[0];
        let property = key.split("_")[1];
        if (property == "add-option") return;
        if (!attributes[attributeId]) {
            attributes[attributeId] = {};
        } // @ts-ignore
        attributes[attributeId][property] = req.body[key];
    });
    await prisma.$transaction([
        ...Object.keys(attributes)
            .filter((key) => attributes[key].name != "deleted")
            .map((key) => {
                return prisma.projectAttribute.upsert({
                    where: {
                        id: key
                    },
                    create: {
                        id: key,
                        name: attributes[key].name as string,
                        type: attributes[key].type as string,
                        order: 1,
                        hackathon: {
                            connect: {
                                slug: req.query.slug as string
                            }
                        },
                        options: attributes[key].options
                    },
                    update: {
                        name: attributes[key].name,
                        type: attributes[key].type,
                        options: attributes[key].options
                    }
                });
            }),
        ...Object.keys(attributes)
            .filter((key) => attributes[key].name == "deleted")
            .map((key) => {
                return prisma.projectAttribute.delete({
                    where: {
                        id: key
                    }
                });
            })
    ]);
    let updatedAttributes = await prisma.projectAttribute.findMany({
        where: {
            hackathon: {
                slug: req.query.slug as string
            }
        }
    });
    res.json({ body: req.body });
}
