import prisma from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { Card, Drawer, Fieldset, Grid, Page, Text } from "@geist-ui/core";
import type { GetServerSideProps } from "next";

import { Form } from "@/components/Form";
import DashboardLayout from "@/components/layouts/organizer/DashboardLayout";
import { PlusCircle } from "@geist-ui/react-icons";
import Image from "next/image";
import Link from "next/link";
import { ReactElement, useState } from "react";

import type { HackathonWithAttendees } from "@/lib/dbTypes";

export default function Index({
  hackathons
}: {
  hackathons: HackathonWithAttendees[];
}): any {
  const [drawerState, setDrawerState] = useState(false);
  const [data, setData] = useState({});

  return (
    <>
      <Page>
        <Page.Header>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "32px"
            }}
          >
            <Image
              src="/wordmark-light.svg"
              alt="Hackathon.zip"
              height={40}
              width={350}
              style={{
                margin: "0px"
              }}
            />
            <div style={{ flexGrow: 1 }} />
            <h5
              style={{
                background: "#eee",
                borderRadius: "99px",
                width: "fit-content",
                padding: "8px 16px",
                marginBottom: "0px"
              }}
            >
              All your hackathon needs, zipped.
            </h5>
          </div>
        </Page.Header>

        <style>{`
          body {
            overflow-y: hidden;
          }

          .project-card {
              cursor: pointer;
          }

          .project-card:hover {
              border-color: white!important;
          }
        `}</style>

        <Drawer
          visible={drawerState}
          onClose={() => setDrawerState(false)}
          placement="right"
          style={{
            textAlign: "left",
            maxWidth: "600px",
            width: "calc(100vw - 64px)"
          }}
        >
          <h2 style={{ marginBottom: "0px" }}>Create a Hackathon</h2>
          <p style={{ marginTop: "16px" }}>
            Let's get you set up on Hackathon.zip.
          </p>
          <Drawer.Content>
            <Form
              schema={{
                elements: [
                  {
                    type: "text",
                    label: "Hackathon Name",
                    name: "name",
                    placeholder: "Thing Hacks 2023",
                    required: true
                  },
                  {
                    type: "text",
                    label: "Venue & Location",
                    name: "location",
                    placeholder: "Things HQ in San Francisco",
                    required: true
                  },
                  {
                    type: "tuple",
                    label: "Dates",
                    inputs: [
                      {
                        type: "datetime-local",
                        inlineLabel: "Start",
                        name: "startDate"
                      },
                      {
                        type: "datetime-local",
                        inlineLabel: "End",
                        name: "endDate"
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
                    placeholder: "America/Los_Angeles"
                  }
                ]
              }}
              submission={{
                type: "request",
                method: "POST",
                action: "/api/hackathons/create"
              }}
            />
          </Drawer.Content>
        </Drawer>

        <Grid.Container gap={3} className="hackathons">
          {hackathons.map((hackathon) => {
            const daysToGo = Math.floor(
              (new Date(hackathon.endDate as any).getTime() -
                new Date().getTime()) /
                (1000 * 60 * 60 * 24)
            );
            return (
              <Grid xs={24} sm={12} md={8} lg={6} xl={4}>
                <Link style={{ width: "100%" }} href={`/${hackathon.slug}`}>
                  <Card
                    hoverable
                    style={{
                      width: "100%",
                      border: "1px solid #d1d1d1!important"
                    }}
                    className="project-card"
                  >
                    <Fieldset.Title>{hackathon.name}</Fieldset.Title>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr"
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column"
                        }}
                      >
                        <Text h3 mb={0}>
                          {hackathon.attendees.length}
                        </Text>
                        <Text small>
                          Attendee{hackathon.attendees.length == 1 ? "" : "s"}
                        </Text>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column"
                        }}
                      >
                        {daysToGo != 0 ? (
                          <>
                            <Text h3 mb={0}>
                              {Math.abs(daysToGo)}
                            </Text>
                            <Text small>
                              Days {daysToGo > 0 ? "To Go" : "Ago"}
                            </Text>
                          </>
                        ) : (
                          <>
                            <Text h3 mb={0}>
                              Today
                            </Text>
                            <Text small>Good luck!</Text>
                          </>
                        )}
                      </div>
                    </div>
                  </Card>
                </Link>
              </Grid>
            );
          })}
          <Grid xs={24} sm={12} md={8} lg={6} xl={4}>
            <Card
              hoverable
              style={{ width: "100%", border: "1px solid #d1d1d1!important" }}
              className="project-card"
              onClick={() => setDrawerState(true)}
            >
              <Card.Content
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                  margin: "0px",
                  height: "100%"
                }}
              >
                <PlusCircle size={32} />
                <Text margin={0}>Create Hackathon</Text>
              </Card.Content>
            </Card>
          </Grid>
        </Grid.Container>
      </Page>
    </>
  );
}

Index.getLayout = function getLayout(page: ReactElement) {
  return <DashboardLayout>{page}</DashboardLayout>;
};

export const getServerSideProps = (async (context) => {
  const { userId } = getAuth(context.req);

  const hackathons = await prisma.hackathon.findMany({
    where: {
      ownerId: userId ?? undefined
    },
    include: {
      attendees: true
    }
  });

  return {
    props: {
      hackathons
    }
  };
}) satisfies GetServerSideProps<{
  hackathons: HackathonWithAttendees[];
}>;
