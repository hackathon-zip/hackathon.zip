import prisma from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { Hackathon } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { Column } from "@/pages/[slug]/data";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { userId } = getAuth(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  try {
    const newData = req.body as { shape: Column[] };
    const { slug } = req.query;

    const hackathon = await prisma.hackathon.findUnique({
      where: {
        slug: slug as string,
      },
    });

    const attendeeAttributes = await prisma.attendeeAttribute.findMany({
      where: {
        hackathon: {
          slug: slug as string
        }
      },
    });

    const toCreate =  newData.shape.map((column, i) => ({
      id: column.id,
      name: column.name,
      type: column.type,
      order: i,
      hackathonId: hackathon.id
    })).filter(column => column.id == "to-create").map(x => ({...x, id: undefined}))

    const toUpdate =  newData.shape.map((column, i) => ({
      id: column.id,
      name: column.name,
      type: column.type,
      order: i
    })).filter(column => column.id != "to-create")

    const createMany = await prisma.attendeeAttribute.createMany({
      data: toCreate
    })
    
    res.redirect(`/${slug}`);
  } catch (error) {
    console.error(error);
    return res.status(400).json({ error });
  }
}
