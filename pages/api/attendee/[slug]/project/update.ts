import prisma from "@/lib/prisma";
import { getHackathonSlug } from "@/lib/utils";
import { getAuth } from "@clerk/nextjs/server";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    try {
        const { name, id } = req.body;

        let slug = req.query.slug as string;

        slug = await getHackathonSlug(slug);
        
        let attendee = await prisma.attendee.findFirst({
            where: {
                tokens: {
                    some: {
                        token: req.cookies[slug]
                    }
                },
                project: {
                    id
                }
            }
        });
        if (!attendee){
            return res.status(400).json({
                error: "Attendee does not exist or is not a member of this project."
            });
        }

        let project = await prisma.project.update({
            where: {
                id
            },
            data: {
                name
            }
        });

        delete req.body.name;
        delete req.body.id;

        await prisma.$transaction(
            Object.keys(req.body).map((attribute) =>
                prisma.projectAttributeValue.upsert({
                    where: {
                        id: `${attribute}-${project.id}`,
                        attributeId: attribute,
                        projectId: project.id
                    },
                    create: {
                        id: `${attribute}-${project.id}`,
                        value: req.body[attribute],
                        projectId: project.id,
                        attributeId: attribute
                    },
                    update: {
                        value: req.body[attribute]
                    }
                })
            )
        );

        project = (await prisma.project.findUnique({
            where: {
                id
            }
        })) as any;

        res.json({ project });
    } catch (error) {
        console.error(error);
        return res.status(400).json({ error });
    }
}
