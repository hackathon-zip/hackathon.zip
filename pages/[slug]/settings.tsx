import prisma from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import {
  Button,
  Fieldset,
  Grid,
  Modal,
  Page,
  Spacer,
  Text,
  useModal,
  useTheme
} from "@geist-ui/core";
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

  const colorTheme = useTheme();

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
        <Fieldset>
          <Fieldset.Title>General</Fieldset.Title>

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
                                timeZone: hackathon.timezone || undefined
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
                                timeZone: hackathon.timezone || undefined
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
                  defaultValue: hackathon.timezone || undefined
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
        </Fieldset>

        <Spacer />

        <Fieldset
          style={{
            border: "1px solid " + colorTheme.palette.error
          }}
        >
          <Fieldset.Title>Danger Zone</Fieldset.Title>
          <Fieldset.Subtitle>
            Don't be like Kenny Loggins. These actions are irreversible.
          </Fieldset.Subtitle>

          <Grid.Container gap={2} justify="center">
            <Grid
              xs={24}
              md={12}
              style={{
                display: "flex",
                flexWrap: "wrap"
              }}
            >
              <Text h5 w="100%" my={0}>
                Delete Hackathon
              </Text>
              <Text font="14px" w="100%" my={0}>
                This will delete your hackathon and all associated data. This
                action is irreversible.
              </Text>
            </Grid>

            <Grid
              xs={24}
              md={12}
              style={{
                display: "flex",
                justifyContent: "end"
              }}
            >
              <DeleteHackathon hackathon={hackathon} />
            </Grid>
          </Grid.Container>
        </Fieldset>
      </Page>
    </>
  );
}

function DeleteHackathon({ hackathon }: { hackathon: Hackathon }) {
  const { visible, setVisible, bindings } = useModal();
  const router = useRouter();

  return (
    <>
      <Button type="error" ghost onClick={() => setVisible(true)}>
        Delete Hackathon
      </Button>
      <Modal {...bindings}>
        <Modal.Title>Confirm</Modal.Title>
        <Modal.Subtitle>
          Are you sure you want to delete this hackathon?
        </Modal.Subtitle>
        <Modal.Content>
          <Text h5>Delete Hackathon</Text>
          <Text font="14px">
            This will delete your hackathon and all associated data. This action
            is irreversible.
          </Text>
          <Form
            submitDisabledUntilValid
            submitButtonType="error"
            schema={{
              elements: [
                {
                  type: "text",
                  name: "confirm",
                  label: "Type the name of your hackathon to confirm",
                  validate: (value) => value === hackathon.name
                }
              ],
              submitText: "Delete Hackathon"
            }}
            submission={{
              type: "controlled",
              onSubmit: async (data) => {
                if (data.confirm === hackathon.name) {
                  await fetch(`/api/hackathons/${hackathon.slug}`, {
                    method: "DELETE",
                    headers: {
                      "Content-Type": "application/json"
                    }
                  });
                  setVisible(false);
                  router.push("/dashboard");
                }
              }
            }}
            style={{
              maxWidth: "400px"
            }}
            additionalButtons={
              <>
                <Button
                  auto
                  type="abort"
                  onClick={() => {
                    setVisible(false);
                  }}
                >
                  Cancel
                </Button>
              </>
            }
          />
        </Modal.Content>
      </Modal>
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
