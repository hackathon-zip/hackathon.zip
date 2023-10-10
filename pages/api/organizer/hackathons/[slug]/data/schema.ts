import prisma from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import type { Attendee } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
		req: NextApiRequest,
		res: NextApiResponse
) {
		const { userId } = getAuth(req);
		if (!userId) return res.status(401).json({ error: "Unauthorized" });
		console.log(req.body)
		res.json({ body: req.body });
}
