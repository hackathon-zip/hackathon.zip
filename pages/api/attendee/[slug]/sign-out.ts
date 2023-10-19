import { getHackathonSlug } from "@/lib/utils";
import type { NextApiRequest, NextApiResponse } from "next";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND);

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const slug = await getHackathonSlug(req.query.slug as string);
    res.setHeader(
        "set-cookie",
        `${slug}=deleted; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
    );
    res.redirect("/");
}
