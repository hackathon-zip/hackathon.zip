import prisma from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { Card, Drawer, Fieldset, Grid, Page, Text } from "@geist-ui/core";

import { Form } from "@/components/Form";
import DashboardLayout from "@/components/layouts/organizer/DashboardLayout";
import { PlusCircle } from "@geist-ui/react-icons";
import type { Attendee, Hackathon } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { ReactElement, useState } from "react";

type HackathonWithAttendees = Hackathon & {
  attendees: Attendee[];
};

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
          <div className="flex items-center mb-8">
            <Image
              src="/wordmark-light.svg"
              alt="Hackathon.zip"
              height={40}
              width={350}
              className="m-0"
            />
            <div className="flex-grow" />
            <h5 className="bg-[#eee] rounded-full w-fit px-2 py-4 mb-0">
              All your hackathon needs, zipped.
            </h5>
          </div>
        </Page.Header>

        <Drawer
          visible={drawerState}
          onClose={() => setDrawerState(false)}
          placement="right"
          className="text-left max-w-[600px] w-[calc(100vw-64px)]"
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
              <Grid xs={24} sm={12} md={8} lg={6} xl={4} className="w-full">
                <Link className="w-full" href={`/${hackathon.slug}`}>
                  <Card
                    hoverable
                    className="cursor-pointer hover:border-white w-full border border-solid border-[#d1d1d1]"
                  >
                    <Fieldset.Title>{hackathon.name}</Fieldset.Title>
                    <Grid.Container gap={1}>
                      <Grid xs={24} className="flex flex-col">
                        <Text h3 mb={0}>
                          {hackathon.attendees.length}
                        </Text>
                        <Text small>
                          Attendee{hackathon.attendees.length == 1 ? "" : "s"}
                        </Text>
                      </Grid>
                      <Grid xs={24} className="flex flex-col">
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
                      </Grid>
                    </Grid.Container>
                  </Card>
                </Link>
              </Grid>
            );
          })}
          <Grid xs={24} sm={12} md={8} lg={6} xl={4} className="w-full">
            <Card
              hoverable
              className="cursor-pointer hover:border-white !w-full border border-solid border-[#d1d1d1]"
              onClick={() => setDrawerState(true)}
            >
              <Card.Content className="flex flex-col align-center justify-center gap-[10px] m-0 h-full">
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
