// import prisma from "@/lib/prisma";
// import { NextApiRequest, NextApiResponse } from "next";

// export default async function handler (req: NextApiRequest, res: NextApiResponse) {
//     let device = await prisma.device.findUnique({
//         where: {
//             id: req.query.id as string
//         }
//     });

//     if (!device) {
//         device = await prisma.device.create({
//             data: {
//                 id: req.query.id as string
//             }
//         })
//     }

//     device.
//     return res.send({
//         code: "XZYEBP"
//     });
// }
