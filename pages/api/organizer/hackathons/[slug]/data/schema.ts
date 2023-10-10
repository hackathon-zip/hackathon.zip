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
		let attributes: { [key: string]: { name?: string; type?: string; options?: string[]} } = {};
		Object.keys(req.body).map(key => {
			let attributeId = key.split("_")[0]
			let property = key.split("_")[1]
			if(property == "add-option") return
			if(!attributes[attributeId]){
				attributes[attributeId] = {}
			} // @ts-ignore
			attributes[attributeId][property] = req.body[key]
		})
		await prisma.$transaction(
			Object.keys(attributes).map(key => {
				return prisma.attendeeAttribute.upsert({
				where: {
					id: key
				},
				create: {
					id: key,
					name: attributes[key].name as string,
					type: attributes[key].type as string,
					order: 1,
					hackathon: {
						connect: {
							slug: req.query.slug as string
						}
					},
					options: attributes[key].options
				},
				update: {
					name: attributes[key].name,
					type: attributes[key].type,
					options: attributes[key].options
				}
			})})
		)
		res.json({ body: req.body, attributes });
}
