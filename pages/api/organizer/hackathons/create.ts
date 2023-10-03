import prisma from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { userId } = getAuth(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  try {
    const { name, location, startDate, endDate } = req.body;
    const slug =
      (name || "").toLowerCase().replace(/[^a-z0-9]{1,}/g, "-") +
      "-" +
      Math.random().toString(36).substring(2, 7);

    const hackathon = await prisma.hackathon.create({
      data: {
        name,
        slug,
        location,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        ownerId: userId
      }
    });

    console.log({ hackathon });

    res.redirect(`/${hackathon.slug}`);
  } catch (error) {
    console.error(error);
    return res.status(400).json({ error });
  }
}
