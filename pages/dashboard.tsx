import { Button, Card, Drawer, Fieldset, Grid, Input, Page, Text } from "@geist-ui/core"
import { getAuth } from "@clerk/nextjs/server";
import type { InferGetServerSidePropsType, GetServerSideProps } from 'next'
import { ClerkLoaded, UserButton } from "@clerk/nextjs";
import prisma from "@/lib/prisma";
import { NextApiRequest } from "next";
import { NextServerOptions } from "next/dist/server/next";
 
import type { Hackathon } from "@prisma/client";
import { PlusCircle } from "@geist-ui/react-icons";
import { useState } from "react";
import { Form } from "@/components/Form";
import { delay } from "@/lib/utils";
import Debug from "@/components/Debug";
import Navbar from "@/components/Navbar";

export default function Index({ hackathons }: { hackathons: Hackathon[] }): any {
  const [drawerState, setDrawerState] = useState(false);
  const [data, setData] = useState({});

  return (
    <>
			<Page>
        <Page.Header>
        <h2>Hackathon Thing</h2>
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

        <Drawer visible={drawerState} onClose={() => setDrawerState(false)} placement="right" style={{
                textAlign: 'left',
                maxWidth: '600px',
                width: 'calc(100vw - 64px)'
            }}>
                <h2 style={{ marginBottom: '0px' }}>Create a Hackathon</h2>
                <p style={{ marginTop: '16px' }}>Let's get you set up on Hackathon Thing.</p>
                <Drawer.Content>
                  <Form schema={{
                    elements: [
                      { type: 'text', label: 'Hackathon Name', name: 'name', placeholder: 'Thing Hacks 2023', required: true },
                      { type: 'text', label: 'Venue & Location', name: 'location', placeholder: 'Things HQ in San Francisco', required: true },
                      { type: 'tuple', label: 'Dates', inputs: [
                        { type: 'date', inlineLabel: 'Start Date', name: 'startDate' },
                        { type: 'date', inlineLabel: 'End Date', name: 'endDate' }
                      ] }
                    ],
                  }} submission={{
                    type: 'request',
                    method: "POST",
                    action: "/api/hackathons/create",
                  }} />
                    
                </Drawer.Content>
            </Drawer>

            <Grid.Container gap={3} className="hackathons">
                {hackathons.map(hackathon => (
                    <Grid xs={24} sm={12} md={8} lg={6} xl={4}>
                        <a style={{ width: '100%' }} href={`/${hackathon.slug}`}>
                            <Card hoverable style={{ width: '100%', border: '1px solid #343434' }} className="project-card">
                                <Fieldset.Title>{hackathon.name}</Fieldset.Title>
                                <Fieldset.Subtitle>{hackathon.slug}</Fieldset.Subtitle>
                            </Card>
                        </a>
                    </Grid>
                ))}
                <Grid xs={24} sm={12} md={8} lg={6} xl={4}>
                    <Card hoverable style={{ width: '100%', border: '1px solid #343434' }} className="project-card" onClick={() => setDrawerState(true)}>
                        <Card.Content style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, margin: '0px', height: '100%' }}>
                            <PlusCircle size={32} />
                            <Text margin={0}>Create Hackathon</Text>
                        </Card.Content>
                    </Card>
                </Grid>
            </Grid.Container>
            <Debug data={{ data }} />
      </Page>
    </>
  );
}

export const getServerSideProps = (async (context) => {
  const { userId } = getAuth(context.req);

  const hackathons = await prisma.hackathon.findMany({
    where: {
      ownerId: userId ?? undefined
    }
  });

  return {
    props: {
      hackathons
    },
  };
}) satisfies GetServerSideProps<{
  hackathons: Hackathon[]
}>;