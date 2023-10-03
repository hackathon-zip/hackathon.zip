import prisma from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { userId } = getAuth(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const hackathons = await prisma.hackathon.findMany({
    where: {
      ownerId: userId ?? undefined
    }
  });

  return res.status(200).json(hackathons);
}
