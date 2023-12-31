import {
  Button,
  Card,
  Drawer,
  Fieldset,
  Grid,
  Input,
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
  broadcast
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
  broadcast: string | null;
}): any {
  if (!hackathon) {
    return (
      <>
        <div>404: Hackathon Not Found!</div>
      </>
    );
  }

  return (
    <>
      <div style={{ width: "100%" }}>
        <h1>{hackathon?.name}</h1>
        {hackathon?.broadcasts.filter((x) => x.smsTemplate).length > 0 && (
          <Card type={"dark"} width="100%" mb={1}>
            {new Date(hackathon?.broadcasts[0].createdAt).toLocaleDateString()}:{" "}
            {broadcast}
          </Card>
        )}
        <Grid.Container gap={2}>
          {hackathon?.dashboard?.links.map((link) => (
            <Grid>
              <Link href={link.url}>
                <Button type="success">{link.text}</Button>
              </Link>
            </Grid>
          ))}
        </Grid.Container>
        <Grid.Container gap={1.5} my={1}>
          {hackathon?.dashboard?.cards.map((card) => (
            <Grid xs={12}>
              <Card width="100%">
                <Text h4 my={0}>
                  {card.header}
                </Text>
                <Text>{card.text}</Text>
                {card.links.map((link) => (
                  <Link href={link.url}>
                    <Button>{link.text}</Button>
                  </Link>
                ))}
              </Card>
            </Grid>
          ))}
        </Grid.Container>
        {hackathon?.dashboard && <Markdown code={hackathon?.dashboard?.body} />}
      </div>
    </>
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
      let attendee = null;
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
        let broadcast = null;
        if (
          hackathon?.broadcasts
            .sort((a, b) => (a.createdAt > b.createdAt ? 1 : -1))
            .filter((x) => x.smsTemplate).length > 0
        ) {
          let smsTemplate = ejs.compile(
            hackathon?.broadcasts.filter((x) => x.smsTemplate)[0]
              .smsTemplate as string,
            {}
          );
          broadcast = smsTemplate({
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
          });
        }
        return {
          props: {
            hackathon: hackathon,
            attendee: attendee,
            broadcast: broadcast
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
        new URL(("https://example.com" + context.req.url) as string).pathname +
        "/register",
      permanent: false
    }
  };
}) satisfies GetServerSideProps<{
  hackathon: Hackathon | null;
  attendee: Attendee | null;
}>;
