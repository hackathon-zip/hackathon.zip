import {
  Button,
  Card,
  Drawer,
  Fieldset,
  Grid,
  Input,
  Divider,
  Page,
  Text
} from "@geist-ui/core";
import ejs from "ejs";
import type {
  InferGetServerSidePropsType,
  GetServerSideProps,
  GetServerSidePropsContext,
  GetServerSidePropsResult
} from "next";
import prisma from "@/lib/prisma";
import { NextApiRequest } from "next";
import { NextServerOptions } from "next/dist/server/next";

import type {
  Hackathon,
  Attendee,
  CustomPage,
  CustomPageCard,
  AttendeeAttributeValue,
  AttendeeAttribute,
  CustomPageLink,
  Broadcast
} from "@prisma/client";
import React, { useState } from "react";
import type { ReactElement } from "react";
import Link from "next/link";
import Markdown from "@/components/Markdown";
import AttendeeLayout from "@/components/layouts/attendee/AttendeeLayout";
import { compile } from "@mdx-js/mdx";

export default function Attendee({
  hackathon,
  attendee,
  broadcasts
}: {
  hackathon:
    | (Hackathon & {
        broadcasts: Broadcast[];
        pages: (CustomPage & {
          cards: (CustomPageCard & {
            links: CustomPageLink[];
          })[];
          links: CustomPageLink[];
        })[];
        dashboard:
          | (CustomPage & {
              cards: (CustomPageCard & {
                links: CustomPageLink[];
              })[];
              links: CustomPageLink[];
            })
          | null;
      })
    | null;
  attendee: Attendee | null;
  broadcasts: {
    content: string;
    date: string;
    title: string | null;
  }[];
}): any {
  if (!hackathon) {
    return (
      <>
        <div>404: Hackathon Not Found!</div>
      </>
    );
  }

  return (
    <div style={{ width: "100%" }}>
      <div style={{ width: "100%" }}>
        <h1>{hackathon?.name}</h1>
      </div>
      {broadcasts.map((broadcast) => (
        <Card width="100%" mb={1}>
          <Card.Content>
            <Text b my={0}>
              {broadcast.date}
              {broadcast.title && `: ${broadcast.title}`}
            </Text>
          </Card.Content>
          <Divider h="1px" my={0} />
          <Card.Content>{broadcast.content}</Card.Content>
        </Card>
      ))}
    </div>
  );
}

Attendee.getLayout = function getLayout(
  page: ReactElement,
  props: {
    hackathon: Hackathon & { pages: CustomPage[] };
    attendee: Attendee | null;
  }
) {
  return (
    <AttendeeLayout hackathon={props.hackathon} attendee={props.attendee}>
      {page}
    </AttendeeLayout>
  );
};

export const getServerSideProps = (async (
  context: GetServerSidePropsContext
) => {
  if (context.params?.slug) {
    let hackathon = (await prisma.hackathon.findFirst({
      where: {
        OR: [
          {
            slug: context.params?.slug.toString()
          },
          {
            customDomain: context.params?.slug.toString()
          }
        ]
      },
      include: {
        broadcasts: true,
        pages: {
          include: {
            links: true,
            cards: {
              include: {
                links: true
              }
            }
          }
        }
      }
    })) as
      | (Hackathon & {
          broadcasts: Broadcast[];
          pages: (CustomPage & {
            cards: (CustomPageCard & {
              links: CustomPageLink[];
            })[];
            links: CustomPageLink[];
          })[];
          dashboard:
            | (CustomPage & {
                cards: (CustomPageCard & {
                  links: CustomPageLink[];
                })[];
                links: CustomPageLink[];
              })
            | null;
        })
      | null;

    if (hackathon) {
      hackathon.dashboard = hackathon?.pages.filter(
        (x) => x.slug == "dashboard"
      )[0];
      const token = context.req.cookies[hackathon?.slug as string];
      let attendee: any = null;
      if (token) {
        attendee = await prisma.attendee.findFirst({
          where: {
            hackathonId: hackathon.id,
            tokens: {
              some: {
                token: token
              }
            }
          },
          include: {
            attributeValues: {
              include: {
                formField: true
              }
            }
          }
        });
      }
      if (attendee) {
        let broadcasts: any[] = [];
        hackathon.broadcasts.map((broadcast) => {
          if (broadcast.emailHTMLTemplate) {
            let htmlTemplate = ejs.compile(broadcast.emailHTMLTemplate, {});
            broadcasts.push({
              title: broadcast.emailTitle,
              date: new Date(broadcast.createdAt).toLocaleDateString(),
              content: htmlTemplate({
                ...attendee,
                ...(attendee as any).attributeValues.reduce(
                  (
                    obj: any,
                    attribute: AttendeeAttributeValue & {
                      formField: AttendeeAttribute;
                    }
                  ) => ((obj[attribute.formField.name] = attribute.value), obj),
                  {}
                )
              })
            });
          } else if (broadcast.emailPlaintextTemplate) {
            let plainTextTemplate = ejs.compile(
              broadcast.emailPlaintextTemplate,
              {}
            );
            broadcasts.push({
              title: broadcast.emailTitle,
              date: new Date(broadcast.createdAt).toLocaleDateString(),
              content: plainTextTemplate({
                ...attendee,
                ...(attendee as any).attributeValues.reduce(
                  (
                    obj: any,
                    attribute: AttendeeAttributeValue & {
                      formField: AttendeeAttribute;
                    }
                  ) => ((obj[attribute.formField.name] = attribute.value), obj),
                  {}
                )
              })
            });
          } else if (broadcast.smsTemplate) {
            let smsTemplate = ejs.compile(broadcast.smsTemplate, {});
            broadcasts.push({
              date: new Date(broadcast.createdAt).toLocaleDateString(),
              content: smsTemplate({
                ...attendee,
                ...(attendee as any).attributeValues.reduce(
                  (
                    obj: any,
                    attribute: AttendeeAttributeValue & {
                      formField: AttendeeAttribute;
                    }
                  ) => ((obj[attribute.formField.name] = attribute.value), obj),
                  {}
                )
              })
            });
          }
        });
        return {
          props: {
            hackathon: hackathon,
            attendee: attendee,
            broadcasts: broadcasts
          }
        };
      }
    }
  }
  return {
    props: {
      hackathon: null,
      attendee: null
    },
    redirect: {
      destination:
        new URL(("https://example.com" + context.req.url) as string).pathname.replace("/broadcasts", "/register"),
      permanent: false
    }
  };
}) satisfies GetServerSideProps<{
  hackathon: Hackathon | null;
  attendee: Attendee | null;
}>;
