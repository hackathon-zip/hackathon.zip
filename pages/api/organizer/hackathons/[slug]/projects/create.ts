import prisma from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import type { Project } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { getHackathon } from "..";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const hackathon = await getHackathon(req, res);
    if (!hackathon) return res.status(401).json({ error: "Unauthorized" });
    let project: Project = await prisma.project.create({
        data: {
            name: req.body.name,
            hackathon: {
                connect: {
                    slug: req.query.slug as string
                }
            }
        }
    });
    await prisma.$transaction(
        Object.keys(req.body)
            .filter((b) => b.startsWith("custom-"))
            .map((y) => {
                let id = y.replace("custom-", "");
                return prisma.projectAttributeValue.upsert({
                    create: {
                        id: `${id}-${project.id}`,
                        attributeId: id,
                        value: req.body[y],
                        projectId: project.id
                    },
                    update: {
                        value: req.body[y]
                    },
                    where: {
                        id: `${id}-${project.id}`,
                        attributeId: id,
                        projectId: project.id
                    }
                });
            })
    );
    project =
        (await prisma.project.findUnique({
            where: {
                id: project.id
            },
            include: {
                attributeValues: true
            }
        })) || project;
    res.json({ project });
}
