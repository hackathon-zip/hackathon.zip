import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { EmailTemplate } from "@/emails/sign-in";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND);

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    try {
        let attendee = await prisma.attendee.findUnique({
            where: {
                email: req.body.email,
                hackathon: {
                    slug: req.query.slug as string,
                },
            },
            include: {
                hackathon: true,
            },
        });
        if (attendee) {
            let loginToken = await prisma.token.create({
                data: {
                    attendee: {
                        connect: {
                            email: req.body.email,
                            hackathon: {
                                slug: req.query.slug as string,
                            },
                        },
                    },
                },
                include: {
                    attendee: true,
                },
            });
            const email = await resend.emails.send({
                from: `${attendee.hackathon.name} <${attendee.hackathon.slug ?? 'login'}.noreply@hackathon.zip>`,
                to: ["ian@hackclub.com"], // [attendee.email],
                subject: `Sign in to ${attendee.hackathon.name}'s portal`,
                react: EmailTemplate({
                    name: attendee.name,
                    url: `https://${attendee.hackathon.slug}.hackathon.zip/sign-in/${loginToken.magicKey}`,
                }),
                text: `Welcome, ${attendee.name}! https://${attendee.hackathon.slug}.hackathon.zip/sign-in/${loginToken.magicKey}`,
            });
            return res.status(200).json(email);
        }
        return res
            .status(400)
            .json({
                error: "Attendee does not exist, please register for this event.",
            });
    } catch (e) {
        console.error(e);
        return res
            .status(400)
            .json({
                error: "There was an unexpected error, please try again.",
            });
    }
}
