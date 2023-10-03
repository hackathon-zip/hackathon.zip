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
import { getAuth } from "@clerk/nextjs/server";
import type { InferGetServerSidePropsType, GetServerSideProps } from "next";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import prisma from "@/lib/prisma";
import { NextApiRequest } from "next";
import { NextServerOptions } from "next/dist/server/next";

import type { Hackathon } from "@prisma/client";
import { PlusCircle } from "@geist-ui/react-icons";
import React, { useState } from "react";
import type { ReactElement } from "react";
import { Form } from "@/components/Form";
import { delay } from "@/lib/utils";
import Debug from "@/components/Debug";
import Link from "next/link";
import HackathonLayout from "@/components/layouts/organizer/OrganizerLayout";
import { useRouter } from "next/router";

export default function Hackathon({
  hackathon
}: {
  hackathon: Hackathon | null;
}): any {
  const router = useRouter();

  if (!hackathon) {
    return (
      <>
        <Page>404: Not Found!</Page>
      </>
    );
  }

  return (
    <>
      <Page>
        <Text h1>Settings</Text>
        <Text h3>General</Text>
        <Card>
          <Form
            schema={{
              elements: [
                {
                  type: "text",
                  validate: (value) =>
                    value ==
                    (value || "").toLowerCase().replace(/[^a-z0-9]{1,}/g, "-"),
                  name: "slug",
                  label: "Slug",
                  defaultValue: hackathon.slug
                }
              ],
              submitText: "Save"
            }}
            submission={{
              type: "controlled",
              onSubmit: async (data) => {
                fetch(`/api/hackathons/${hackathon.slug}/update`, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json"
                  },
                  body: JSON.stringify({
                    ...data
                  })
                });
                await delay(1000);

                if (data.slug !== hackathon.slug)
                  router.push(`/${data.slug}/settings`);
              }
            }}
            style={{
              maxWidth: "400px"
            }}
          />
        </Card>
        <code>/{hackathon?.slug}</code>
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
