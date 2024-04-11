import {
  Button,
  Card,
  Drawer,
  Fieldset,
  Grid,
  Input,
  Page,
  Text,
  useToasts
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
import { Form } from "@/components/Form";
import type { FormElement } from "@/components/Form";
import { useRouter } from "next/router";

import type {
  Hackathon,
  Attendee,
  CustomPage,
  CustomPageCard,
  AttendeeAttributeValue,
  AttendeeAttribute,
  CustomPageLink,
  Broadcast,
  SignupFormField
} from "@prisma/client";
import React, { useState } from "react";
import type { ReactElement } from "react";
import Link from "next/link";
import Markdown from "@/components/Markdown";
import AttendeeLayout from "@/components/layouts/attendee/AttendeeLayout";
import { compile } from "@mdx-js/mdx";

type DashboardProps = {
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
}

export function AttendeeView({ hackathon, attendee, broadcast}: DashboardProps): any {
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
        {hackathon?.broadcasts.filter((x : Broadcast) => x.smsTemplate).length > 0 && (
          <Card type={"dark"} width="100%" mb={1}>
            {new Date(hackathon?.broadcasts[0].createdAt).toLocaleDateString()}:{" "}
            {broadcast}
          </Card>
        )}
        <Grid.Container gap={2}>
          {hackathon?.dashboard?.links.map((link: CustomPageLink) => (
            <Grid>
              <Link href={link.url}>
                <Button type="success">{link.text}</Button>
              </Link>
            </Grid>
          ))}
        </Grid.Container>
        <Grid.Container gap={1.5} my={1}>
          {hackathon?.dashboard?.cards.map((card : CustomPageCard) => (
            <Grid xs={12}>
              <Card width="100%">
                <Text h4 my={0}>
                  {card.header}
                </Text>
                <Text>{card.text}</Text>
                {card.links.map((link : CustomPageLink) => (
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

export function ApplicationView({ hackathon, attendee}: DashboardProps): any {
  if (!hackathon) {
    return (
      <>
        <div>404: Hackathon Not Found!</div>
      </>
    );
  }

  const { setToast } = useToasts();
  const router = useRouter();
  const transformAPIURL = (path: string) =>
    router.asPath.startsWith("/attendee/")
      ? `/api/attendee/${hackathon?.slug}${path}`
      : `/api/${path}`;
  console.log(attendee)
  return (
    <>
      <div>
        <h1>Apply to {hackathon.name}</h1>
        <Form
          style={{ width: "70vw" }}
          schema={{
            submitText: "Save For Later",
            secondarySubmitText: "Apply",
            elements: [
              {
                type: "text",
                label: "Name",
                name: "name",
                placeholder: "Fiona Hackworth",
                required: true,
                defaultValue: attendee.name
              },
              {
                type: "email",
                label: "Email",
                name: "email",
                placeholder: "fiona@hackathon.zip",
                required: true,
                defaultValue: attendee.email
              },
              {
                type: "text",
                label: "Applied",
                name: "applied",
                defaultValue: "false",
                visible: () => false
              },
              ...(hackathon.signupForm?.fields?.map((x: SignupFormField) => ({
                  ...x.attribute,
                  ...x,
                  label: x.label,
                  placeholder: x.plaecholder,
                  description: x.description,
                  name: x.attribute.id,
                  type: x.attribute.type,
                  defaultValue: attendee.attributeValues.filter((a: AttendeeAttributeValue) => a.formFieldId == x.attributeId)[0]?.value
                }) as FormElement
              ) || [])
            ]
          }}
          clearValuesOnSuccesfulSubmit={false}
          submission={{
            type: "controlled",
            onSubmit: async (data) => {
              let res = await fetch(transformAPIURL("/update"), {
                method: "POST",
                headers: {
                  "Content-Type": "application/json"
                },
                body: JSON.stringify({
                  ...data
                })
              }).then((r) => r.json());
              if (res.error) {
                setToast({
                  text: `${res.error.name ?? "Error"}: ${
                    res.error.meta?.cause ?? "Unknown error."
                  }`,
                  delay: 2000,
                  type: "error"
                });
                return false;
              } else {
                setToast({
                  text: "We've updated your information, thanks.",
                  delay: 10000
                });
                router.reload();
                return true;
              }
            }
          }}
        />
      </div>
    </>
  );
}

export default function Index({ hackathon, attendee, broadcast}: DashboardProps) {
  switch (attendee.status) {
    case 'Pending':
      return <ApplicationView hackathon={hackathon} attendee={attendee} broadcast={broadcast} />
      break;
    case 'Accepted':
      return <AttendeeView hackathon={hackathon} attendee={attendee} broadcast={broadcast} />
      break;
    case 'Rejected':
      return <>Rejected, sorry.</>
      break;
    default:
      return <>You are waiting to hear back.</>
      break;
  }
}

Index.getLayout = function getLayout(
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
        signupForm: {
          include: {
            fields: {
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
        (x: CustomPage) => x.slug == "dashboard"
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
            .sort((a : Broadcast, b : Broadcast) => (a.createdAt > b.createdAt ? 1 : -1))
            .filter((x : Broadcast) => x.smsTemplate).length > 0
        ) {
          let smsTemplate = ejs.compile(
            hackathon?.broadcasts.filter((x : Broadcast) => x.smsTemplate)[0]
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
