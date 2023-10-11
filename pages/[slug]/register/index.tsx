import {
  Button,
  Card,
  Drawer,
  Fieldset,
  Grid,
  Input,
  Page,
  Text,
  Textarea
} from "@geist-ui/core";
import { getAuth } from "@clerk/nextjs/server";
import type { InferGetServerSidePropsType, GetServerSideProps } from "next";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import prisma from "@/lib/prisma";
import { NextApiRequest } from "next";
import { NextServerOptions } from "next/dist/server/next";

import type { Hackathon, AttendeeAttribute } from "@prisma/client";
import { PlusCircle } from "@geist-ui/react-icons";
import React, { useState } from "react";
import type { ReactElement } from "react";
import { Form } from "@/components/Form";
import { delay } from "@/lib/utils";
import Debug from "@/components/Debug";
import Link from "next/link";
import HackathonLayout from "@/components/layouts/organizer/OrganizerLayout";
import type { FormSchema } from "@/components/Form";

type HackathonWithAttributes = Hackathon & {
  attendeeAttributes: AttendeeAttribute[];
};

export default function Hackathon({
  hackathon
}: {
  hackathon: HackathonWithAttributes | null;
}): any {
  const defaultValue: FormSchema = {
    elements: [
      {
        type: "text",
        required: false,
        name: "name",
        label: "Hello"
      }
    ]
  };
  const [formJSON, setFormJSON] = useState<any>(defaultValue);

  if (!hackathon) {
    return (
      <>
        <Page>404: Not Found!</Page>
      </>
    );
  }

  const properties = (attribute: AttendeeAttribute, i: number) => {
    return [
      {
        type: "checkbox",
        options: ["Display on form?"],
        label: attribute.name,
        name: `${attribute.id}_enabled_on_form`
      },
      {
        type: "text",
        miniLabel: "Label:",
        name: `${attribute.id}_label`,
        mt: 1,
        mb: 0.5,
        defaultValue: attribute["name"],
        visible: (data: { [key: string]: { value: string[] } }) => {
          return data[`${attribute.id}_enabled_on_form`].value.includes(
            "Display on form?"
          );
        },
        required: true
      },
      {
        type: "textarea",
        miniLabel: "Description:",
        name: `${attribute.id}_description`,
        mt: 1,
        mb: 0.5,
        defaultValue: attribute["name"],
        visible: (data: { [key: string]: { value: string[] } }) => {
          return data[`${attribute.id}_enabled_on_form`].value.includes(
            "Display on form?"
          );
        }
      },
      {
        type: "text",
        miniLabel: "Placeholder:",
        name: `${attribute.id}_placeholder`,
        mt: 1,
        mb: 0.5,
        defaultValue: attribute["name"],
        visible: (data: { [key: string]: { value: string[] } }) => {
          return data[`${attribute.id}_enabled_on_form`].value.includes(
            "Display on form?"
          );
        }
      }
    ];
  };

  return (
    <>
      <Page>
        <h2>Configure Your Registration Form</h2>
        <Grid.Container gap={2} justify="center">
          <Grid xs={12}>
            <Form
              submission={{
                onSubmit: () => null,
                type: "controlled"
              }}
              buttonMt={16}
              schema={{
                elements: hackathon.attendeeAttributes
                  .map((attribute, i) => properties(attribute, i))
                  .flat() as any
              }}
            />
          </Grid>
          <Grid xs={12}>
            <iframe
              src={`/${hackathon?.slug}/register/form-preview/${encodeURIComponent(
                JSON.stringify({
                  elements: [
                    {
                      type: "text",
                      required: false,
                      name: "name",
                      label: "Hello"
                    }
                  ]
                })
              )}`}
              width="100%"
              height="1000px"
              style={{
                border: "1px solid #333",
                borderRadius: "8px",
                padding: "16px",
                background: "#fff",
                marginTop: "24px"
              }}
            />
          </Grid>
        </Grid.Container>
        <Debug data={{ formJSON }} />
      </Page>
    </>
  );
}

Hackathon.getLayout = function getLayout(page: ReactElement) {
  return <HackathonLayout>{page}</HackathonLayout>;
};

export const getServerSideProps = (async (context) => {
  const { userId } = getAuth(context.req);

  console.log({ userId });

  if (context.params?.slug) {
    const hackathon = await prisma.hackathon.findUnique({
      where: {
        slug: context.params?.slug.toString(),
        OR: [
          {
            ownerId: userId ?? undefined
          },
          {
            collaboratorIds: {
              has: userId
            }
          }
        ]
      },
      include: {
        attendeeAttributes: true
      }
    });
    return {
      props: {
        hackathon
      }
    };
  } else {
    return {
      props: {
        hackathon: null
      }
    };
  }
}) satisfies GetServerSideProps<{
  hackathon: Hackathon | null;
}>;
