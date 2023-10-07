import prisma from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { Card, Page, Text } from "@geist-ui/core";
import type { GetServerSideProps } from "next";

import { Form } from "@/components/Form";
import HackathonLayout from "@/components/layouts/organizer/OrganizerLayout";
import { delay } from "@/lib/utils";
import type { Hackathon } from "@prisma/client";
import { useRouter } from "next/router";
import type { ReactElement } from "react";

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
                  name: "name",
                  label: "Event Name",
                  defaultValue: hackathon.name
                },
                {
                  type: "text",
                  validate: (value) =>
                    value ==
                    (value || "").toLowerCase().replace(/[^a-z0-9]{1,}/g, "-"),
                  name: "slug",
                  label: "Slug",
                  defaultValue: hackathon.slug
                },
                {
                  type: "tuple",
                  label: "Dates",
                  inputs: [
                    {
                      type: "datetime-local",
                      inlineLabel: "Start",
                      name: "startDate",
                      defaultValue: hackathon.startDate
                        ? new Date(
                            new Date(hackathon.startDate).toLocaleString(
                              "en-US",
                              {
                                timeZone: hackathon.timezone ?? undefined
                              }
                            )
                          )
                            .toISOString()
                            .slice(0, 16)
                        : undefined
                    },
                    {
                      type: "datetime-local",
                      inlineLabel: "End",
                      name: "endDate",
                      defaultValue: hackathon.endDate
                        ? new Date(
                            new Date(hackathon.endDate).toLocaleString(
                              "en-US",
                              {
                                timeZone: hackathon.timezone ?? undefined
                              }
                            )
                          )
                            .toISOString()
                            .slice(0, 16)
                        : undefined
                    }
                  ]
                },
                {
                  type: "autocomplete",
                  label: "Timezone",
                  name: "timezone",
                  options: Intl.supportedValuesOf("timeZone").map((t) => ({
                    label: t,
                    value: t
                  })),
                  placeholder: "America/Los_Angeles",
                  defaultValue: hackathon.timezone ?? undefined
                },
                {
                  type: "text",
                  label: "Venue & Location",
                  name: "location",
                  defaultValue: hackathon.location
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
