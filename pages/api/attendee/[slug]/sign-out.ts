import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { EmailTemplate } from "@/emails/sign-in";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND);

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    res.setHeader(
        "set-cookie",
        `${token.attendee.hackathon.slug}=deleted; Max-Age=604800; Path=/`
    );
    res.redirect("/")
}
