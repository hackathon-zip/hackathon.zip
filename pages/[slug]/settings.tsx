import prisma from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import {
  Card,
  Code,
  Dot,
  Modal,
  Page,
  Tag,
  Text,
  useModal
} from "@geist-ui/core";
import type { GetServerSideProps } from "next";

import { Form } from "@/components/Form";
import HackathonLayout from "@/components/layouts/organizer/OrganizerLayout";
import { DomainResponse, getDomainResponse } from "@/lib/domains";
import { delay } from "@/lib/utils";
import type { Hackathon } from "@prisma/client";
import { useRouter } from "next/router";
import type { ReactElement } from "react";

type HackathonWithDomainResponse = Hackathon & {
  domainResponse?: DomainResponse;
};

export default function Hackathon({
  hackathon
}: {
  hackathon: HackathonWithDomainResponse | null;
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
                },
                {
                  type: "text",
                  label: "Custom Domain",
                  name: "customDomain",
                  defaultValue:
                    hackathon.customDomain ?? `${hackathon.slug}.hackathon.zip`,
                  inlineLabel: "https://",
                  validate(value) {
                    // allow only apex domains or subdomains, no paths or protocols
                    const regex =
                      /^((?!-)[A-Za-z0-9-]{1,63}(?<!-)\.)+[A-Za-z]{2,6}$/;
                    return value == "" || regex.test(value);
                  },
                  description: () => {
                    const { visible, setVisible, bindings } = useModal();
                    return (
                      <>
                        {hackathon.domainResponse?.verified ? (
                          <Tag type="success">
                            <Dot type="success">Verified</Dot>
                          </Tag>
                        ) : (
                          <>
                            <Tag
                              type="warning"
                              style={{ cursor: "pointer" }}
                              onClick={() => setVisible(true)}
                            >
                              <Dot type="warning">Unverified</Dot>
                            </Tag>
                            <Modal {...bindings}>
                              <Modal.Title>Verify Domain</Modal.Title>
                              <Modal.Content>
                                <Code block>{hackathon.domainResponse}</Code>
                              </Modal.Content>
                              <Modal.Action
                                passive
                                onClick={() => setVisible(false)}
                              >
                                Cancel
                              </Modal.Action>
                              <Modal.Action>Check</Modal.Action>
                            </Modal>
                          </>
                        )}
                      </>
                    );
                  }
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
    const h = await prisma.hackathon.findUnique({
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

    if (!h) return { props: { hackathon: null } };

    if (h.customDomain) {
      const domainResponse = await getDomainResponse(h.customDomain);

      const hackathon: HackathonWithDomainResponse = {
        ...h,
        domainResponse
      };
    }

    return {
      props: {
        hackathon: h
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
  hackathon: HackathonWithDomainResponse | null;
}>;
