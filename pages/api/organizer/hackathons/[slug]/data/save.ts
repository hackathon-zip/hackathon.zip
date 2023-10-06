import prisma from "@/lib/prisma";
import { Column } from "@/pages/[slug]/data";
import { getAuth } from "@clerk/nextjs/server";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { userId } = getAuth(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  try {
    const newData = req.body as { shape: Column[], content: string[][] };
    const { slug } = req.query;

    const hackathon = await prisma.hackathon.findUnique({
      where: {
        slug: slug as string,
      },
    });

    if(hackathon == null) throw new Error("no hackathon!")

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
    })).filter(column => column.id != "to-create" && column.id != "built-in")

    const createMany = await prisma.attendeeAttribute.createMany({
      data: toCreate
    })

    await prisma.$transaction(toUpdate.map(x=> prisma.attendeeAttribute.update({
      where: {
        id: x.id
      },
      data: {
        ...x
      }
    })))   
    
    const currentAttendees = await prisma.attendee.findMany({
      where: {
        hackathonId: hackathon.id
      },
      include: {
        attributeValues: true
      }
    })
    
    let newAttendees: {[key: string]: string[]} = newData.content.reduce((a, v) => ({ ...a, [v[0]]: v}), {}) 

    currentAttendees.map(attendee => {
      let now = newAttendees[attendee.id]
      if(now[1] != attendee.email){

      }
      if(now[2] != attendee.email){
        
      }
    })

    res.redirect(`/${slug}/dara`);
  } catch (error) {
    console.error(error);
    return res.status(400).json({ error });
  }
}
