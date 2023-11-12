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
  Project,
  ProjectAttributeValue,
  ProjectAttribute
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
  project
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
  project: Project & {
    attributeValues: (ProjectAttributeValue & {
      attribute: ProjectAttribute;
    })[];
  };
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
        <h1>{project.name}</h1>
        {project.coverImage && (
          <img
            src={project.coverImage}
            style={{
              height: "200px",
              borderRadius: "4px",
              width: "100%",
              objectFit: "cover",
              objectPosition: "center"
            }}
          />
        )}
        {project.description && <Markdown code={project.description} />}
        {project.attributeValues.length > 0 && (
          <Card width="100%">
            <Text h4 my={0}>
              Additional Information
              {project.attributeValues.map((attribute) => (
                <p>
                  <b>{attribute.attribute.name}:</b> {attribute.value}
                </p>
              ))}
            </Text>
          </Card>
        )}
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
        projects: {
          include: {
            attributeValues: {
              include: {
                attribute: true
              }
            }
          }
        },
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
        let project = hackathon.projects.filter(
          (x) => x.id == context.params?.project
        )[0];
        return {
          props: {
            hackathon: hackathon,
            attendee: attendee,
            project
          }
        };
      }
    }
  }
  return {
    props: {
      hackathon: null,
      attendee: null,
      project: null
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
