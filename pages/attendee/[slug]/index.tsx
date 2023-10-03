import {
  Button,
  Card,
  Drawer,
  Fieldset,
  Grid,
  Link,
  Input,
  Page,
  Text,
} from "@geist-ui/core";
import type {
  InferGetServerSidePropsType,
  GetServerSideProps,
  GetServerSidePropsContext,
  GetServerSidePropsResult,
} from "next";
import prisma from "@/lib/prisma";
import { NextApiRequest } from "next";
import { NextServerOptions } from "next/dist/server/next";

import type {
  Hackathon,
  Attendee,
  AttendeeDashboard,
  AttendeeDashboardCard,
  AttendeeDashboardLink,
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
}: {
  hackathon:
    | (Hackathon & {
        dashboard:
          | (AttendeeDashboard & {
              cards: (AttendeeDashboardCard & {
                links: AttendeeDashboardLink[];
              })[];
              links: AttendeeDashboardLink[];
            })
          | null;
      })
    | null;
  attendee: Attendee | null;
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
      <div>
        <h1>{hackathon?.name}</h1>
        <h3>
          {hackathon.startDate &&
            new Date(hackathon.startDate).toLocaleString()}
          {" to "}
          {hackathon.endDate &&
            new Date(hackathon.endDate).toLocaleString()} at{" "}
          {hackathon?.location}
        </h3>
        <code>/{hackathon?.slug}</code>
        <Grid.Container gap={2}>
          {hackathon?.dashboard?.links.map((link) => (
            <Link href={link.url}>
              <Button>{link.text}</Button>
            </Link>
          ))}
        </Grid.Container>
        <Grid.Container gap={1.5}>
          {hackathon?.dashboard?.cards.map((card) => (
            <Grid xs={12} justify="center">
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
  props: { hackathon: Hackathon | null; attendee: Attendee | null },
) {
  return (
    <AttendeeLayout hackathon={props.hackathon} attendee={props.attendee}>
      {page}
    </AttendeeLayout>
  );
};

export const getServerSideProps = (async (
  context: GetServerSidePropsContext,
) => {
  if (context.params?.slug) {
    const hackathon = await prisma.hackathon.findFirst({
      where: {
        OR: [
          {
            slug: context.params?.slug.toString(),
          },
          {
            customDomain: context.params?.slug.toString(),
          },
        ],
      },
      include: {
        dashboard: {
          include: {
            links: true,
            cards: {
              include: {
                links: true,
              },
            },
          },
        },
      },
    });
    if (hackathon) {
      const token = context.req.cookies[hackathon?.slug as string];
      let attendee = null;
      if (token) {
        attendee = await prisma.attendee.findFirst({
          where: {
            hackathonId: hackathon.id,
            tokens: {
              some: {
                token: token,
              },
            },
          },
        });
      }
      if (attendee) {
        return {
          props: {
            hackathon: hackathon,
            attendee: attendee,
          },
        };
      }
    }
  }
  context.res.setHeader(
    "location",
    context.resolvedUrl.replace(/\/$/, "") + "/register",
  );
  context.res.statusCode = 302;
  context.res.end();
  return;
}) satisfies GetServerSideProps<{
  hackathon: Hackathon | null;
  attendee: Attendee | null;
}>;
