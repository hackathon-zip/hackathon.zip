import {
  Button,
  Card,
  Drawer,
  Fieldset,
  Grid,
  Input,
  Image,
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
import { css } from "@/components/CSS";
import type {
  Hackathon,
  Attendee,
  CustomPage,
  CustomPageCard,
  AttendeeAttributeValue,
  AttendeeAttribute,
  CustomPageLink,
  Broadcast,
  Project
} from "@prisma/client";
import React, { useState } from "react";
import type { ReactElement } from "react";
import Link from "next/link";
import Markdown from "@/components/Markdown";
import AttendeeLayout from "@/components/layouts/attendee/AttendeeLayout";
import { compile } from "@mdx-js/mdx";
import { useRouter } from "next/router";

export default function Attendee({
  hackathon,
  attendee,
  broadcast
}: {
  hackathon:
    | (Hackathon & {
        broadcasts: Broadcast[];
        projects: Project[];
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
  const router = useRouter();
  const transformURL = (path: string) =>
    router.asPath.startsWith("/attendee/")
      ? `/attendee/${hackathon?.slug}${path}`
      : path;
  const transformAPIURL = (path: string) =>
    router.asPath.startsWith("/attendee/")
      ? `/api/attendee/${hackathon?.slug}${path}`
      : `/api/${path}`;
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
        <h1>Project Gallery</h1>
        <Grid.Container gap={1.5} my={1} style={{ width: "100%" }}>
          {hackathon?.projects
            ?.filter((x) => x.coverImage && x.description)
            .map((project) => (
              <Grid xs={24}>
                <Link href={transformURL(`/gallery/${project.id}`)}>
                  <Card
                    width="100%"
                    className="projectImage"
                    hoverable
                    style={{ cursor: "pointer!important" }}
                  >
                    <Image
                      src={project.coverImage as string}
                      style={{ objectFit: "cover" }}
                      height="200px"
                      width="100%"
                      draggable={false}
                    />
                    <Text h4 my={0}>
                      {project.name}
                    </Text>
                    <Text>{project.description}</Text>
                  </Card>
                </Link>
              </Grid>
            ))}
          {css`
            .attendees-data-table {
              --table-font-size: calc(1 * 11pt) !important;
            }
            .attendees-data-table-row {
              cursor: pointer;
            }
            .attendees-data-table-row:has(.staged-button) {
              background-color: #ec899355;
            }
            .attendees-data-table-row:hover:has(.staged-button) {
              background-color: #ec899369 !important;
            }
            .attendees-data-table-row > td > div.cell {
              min-height: calc(2.525 * var(--table-font-size));
            }
          `}
        </Grid.Container>
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
        projects: true,
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
          projects: Project[];
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
        return {
          props: {
            hackathon: hackathon,
            attendee: attendee
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
