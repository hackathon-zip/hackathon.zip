import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

const isWithin15Minutes = (dateToCheck: Date) =>
    new Date().getTime() - dateToCheck.getTime() <= 15 * 60 * 1000;

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    try {
        let token = await prisma.token.findUnique({
            where: {
                magicKey: req.query.magicKey as string,
            },
            include: {
                attendee: {
                    include: {
                        hackathon: true,
                    },
                },
            },
        });

        if (token && isWithin15Minutes(token.createdAt)) {
            await prisma.token.update({
                where: {
                    magicKey: req.query.magicKey as string,
                },
                data: {
                    magicKey: null,
                },
            });
            res.setHeader(
                "set-cookie",
                `${token.attendee.hackathon.slug}=${token.token}; Max-Age=604800; Path=/`,
            );
            if (process.env.NODE_ENV == "development") {
                return res.redirect(
                    `/attendee/${token.attendee.hackathon.slug}/`,
                );
            }
            return res.redirect("/");
        }
        return res.status(400).json({
            error: "Invalid magic link, please request a new one.",
        });
    } catch (e) {
        console.error(e);
        return res.status(400).json({
            error: "There was an unexpected error, please try again.",
        });
    }
}
