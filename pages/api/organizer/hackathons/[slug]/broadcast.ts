import { AttendeeAttribute, AttendeeAttributeValue } from "@prisma/client";
import ejs from "ejs";
import MarkdownIt from "markdown-it";
import { NextApiRequest, NextApiResponse } from "next";
import { getHackathon } from ".";
import prisma from "@/lib/prisma";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const hackathon = await getHackathon(req, res, {
        attendees: { attributeValues: { formField: true } }
    });
    if (!hackathon) return res.status(401).json({ error: "Unauthorized" });
    let { emailMarkdown, emailPlaintext, emailTitle, sms } = req.body;
    let emailHTML = emailMarkdown
        ? new MarkdownIt().render(emailMarkdown)
        : null;
    let emailHTMLTemplate = emailHTML ? ejs.compile(emailHTML, {}) : null;
    let emailPlaintextTemplate = emailPlaintext
        ? ejs.compile(emailPlaintext, {})
        : null;
    let smsTemplate = sms ? ejs.compile(sms, {}) : null;
    let emailsToSend: any = [];
    let smsToSend: any = [];
    hackathon.attendees.map((attendee) => {
        if (emailHTMLTemplate && emailPlaintextTemplate && emailTitle) {
            emailsToSend.push({
                to: attendee.email,
                title: emailTitle,
                html: emailHTMLTemplate({
                    ...attendee,
                    ...(attendee as any).attributeValues.reduce(
                        (
                            obj: any,
                            attribute: AttendeeAttributeValue & {
                                formField: AttendeeAttribute;
                            }
                        ) => (
                            (obj[attribute.formField.name] = attribute.value),
                            obj
                        ),
                        {}
                    )
                }),
                attendeeId: attendee.id
            });
        }
        if (smsTemplate) {
            smsToSend.push({
                to: attendee.phone,
                text: smsTemplate({
                    ...attendee,
                    ...(attendee as any).attributeValues.reduce(
                        (
                            obj: any,
                            attribute: AttendeeAttributeValue & {
                                formField: AttendeeAttribute;
                            }
                        ) => (
                            (obj[attribute.formField.name] = attribute.value),
                            obj
                        ),
                        {}
                    )
                }),
                attendeeId: attendee.id
            });
        }
    });
    await prisma.broadcast.create({
        data: {
            emailHTMLTemplate: emailHTML,
            emailPlaintextTemplate: emailPlaintext,
            smsTemplate: sms,
            emailTitle: emailTitle,
            hackathon: {
                connect: {
                    slug: req.query.slug as string
                }
            },
            sent: {
                create: Array.from(
                    new Set(
                        [...emailsToSend, ...smsToSend].map((x) => x.attendeeId)
                    )
                ).map((attendeeId) => ({
                    attendeeId
                }))
            }
        }
    });
    res.json({ emailsToSend, smsToSend });
}
