import prisma from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { Page, Text, Card, Grid, Link, Badge } from "@geist-ui/core";

import HackathonLayout from "@/components/layouts/organizer/OrganizerLayout";
import type { Hackathon, Attendee } from "@prisma/client";
import type { ReactElement } from "react";
import { css } from "@/components/CSS";

import type {
  InferGetServerSidePropsType,
  GetServerSideProps,
  GetServerSidePropsContext,
  GetServerSidePropsResult
} from "next";

import { NavbarTabs } from "@/components/layouts/organizer/Navbar";

type DataPoint = {};

type HackathonWithAttendees = Hackathon & {
  attendees: Attendee[];
};

export default function Hackathon({
  hackathon
}: {
  hackathon: HackathonWithAttendees | null;
}): any {
  if (!hackathon) {
    return (
      <>
        <Page>404: Not Found!</Page>
      </>
    );
  }

  const daysToGo = Math.floor(
    (new Date(hackathon.endDate as any).getTime() - new Date().getTime()) /
      (1000 * 60 * 60 * 24)
  );

  const badges: any = {
    data: hackathon.attendees.length
  };

  return (
    <>
      <div
        style={{
          minHeight: "220px",
          height: "fit-content",
          width: "100%",
          backgroundImage:
            "linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0.6)), url(https://pbs.twimg.com/media/FZmKOGwUcAApTR7.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          color: "white",
          padding: "24px 0px",
          paddingBottom: "16px"
        }}
      >
        <Page className="header" style={{ minHeight: "220px" }}>
          <h1 style={{ marginBottom: "0px" }}>{hackathon?.name}</h1>
          <h3>
            {hackathon.startDate &&
              new Date(hackathon.startDate).toLocaleDateString("en-US", {
                timeZone: hackathon.timezone ?? undefined
              })}
            {" to "}
            {hackathon.endDate &&
              new Date(hackathon.endDate).toLocaleDateString("en-US", {
                timeZone: hackathon.timezone ?? undefined
              })}{" "}
          </h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              maxWidth: "200px"
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
                  <Text small>Days {daysToGo > 0 ? "To Go" : "Ago"}</Text>
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
        </Page>
      </div>
      <Page style={{ minHeight: "220px" }}>
        <Grid.Container gap={1}>
          {NavbarTabs.filter((x) => x.value != "dashboard").map((tab) => (
            <Grid xs={24} sm={12} md={8} lg={6} xl={4}>
              <Link
                style={{ width: "100%" }}
                href={`/${hackathon.slug}/${tab.value}`}
              >
                <Card
                  hoverable
                  style={{
                    width: "100%",
                    border: "1px solid #d1d1d1!important"
                  }}
                  className="project-card"
                >
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <div style={{ flexGrow: 1, fontWeight: 600 }}>
                      {tab.label}
                    </div>
                    {badges[tab.value] && (
                      <Badge type="success">{badges[tab.value]}</Badge>
                    )}
                  </div>
                </Card>
              </Link>
            </Grid>
          ))}
        </Grid.Container>
      </Page>
      {css`
        .header > main {
          padding-top: 0px !important;
        }
      `}
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
        attendees: true
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
