import prisma from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
		req: NextApiRequest,
		res: NextApiResponse
) {
		const { userId } = getAuth(req);
		if (!userId) return res.status(401).json({ error: "Unauthorized" });

		const { attendee } = req.query;
		
		prisma.$queryRaw`update "Attendee" set "checkedIn" = not "checkedIn" where "userId" = ${attendee as string} returning *`

		res.json({ complete: true });
}
