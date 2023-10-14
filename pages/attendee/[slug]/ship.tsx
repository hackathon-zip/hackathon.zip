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
import type {
  InferGetServerSidePropsType,
  GetServerSideProps,
  GetServerSidePropsContext,
  GetServerSidePropsResult
} from "next";
import prisma from "@/lib/prisma";
import { NextApiRequest } from "next";
import { NextServerOptions } from "next/dist/server/next";

import type { Hackathon, Attendee, Project } from "@prisma/client";
import React, { useState } from "react";
import type { ReactElement } from "react";
import Link from "next/link";
import AttendeeLayout from "@/components/layouts/attendee/AttendeeLayout";

import { useRouter } from "next/router";

export default function Attendee({
  hackathon,
  attendee
}: {
  hackathon: Hackathon | null;
  attendee: (Attendee & { project: Project | null }) | null;
}): any {
  if (!hackathon) {
    return (
      <>
        <div>404: Hackathon Not Found!</div>
      </>
    );
  }

  const [newProjectName, setNewProjectName] = React.useState("");
  const [newProjectLoading, setNewProjectLoading] = React.useState(false);

  const newProjectHandler = (e: any) => {
    setNewProjectName(e.target.value);
    console.log(e.target.value);
  };

  const [projectId, setProjectId] = React.useState("");
  const [projectIdLoading, setProjectIdLoading] = React.useState(false);

  const [project, setProject] = React.useState(attendee?.project);

  const projectIdHandler = (e: any) => {
    setProjectId(e.target.value);
    console.log(e.target.value);
  };

  const router = useRouter();
  const { setToast, removeAll } = useToasts();

  const transformAPIURL = (path: string) =>
    router.asPath.startsWith("/attendee/")
      ? `/api/attendee/${hackathon?.slug}${path}`
      : `/api/${path}`;

  return (
    <>
      <div>
        <h1>Ship</h1>
        {project && (
          <>
            <p>You're a member of the team working on {project.name}.</p>
            <p>
              No longer interested in this project?{" "}
              <Text
                span
                type="success"
                style={{ cursor: "pointer" }}
                onClick={async (data) => {
                  setToast({
                    text: "Loading...",
                    delay: 2000
                  });
                  let res = await fetch(transformAPIURL("/project/leave"), {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                      id: project.id
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
                    setNewProjectLoading(false);
                    return false;
                  } else {
                    removeAll();
                    setProject(null);
                    setToast({
                      text: "We've deleted this project.",
                      delay: 10000
                    });
                    setNewProjectName("");
                    setProjectId("");
                    return true;
                  }
                }}
              >
                Leave the team
              </Text>{" "}
              or{" "}
              <Text
                span
                type="success"
                style={{ cursor: "pointer" }}
                onClick={async (data) => {
                  setToast({
                    text: "Loading...",
                    delay: 2000
                  });
                  let res = await fetch(transformAPIURL("/project/delete"), {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                      id: project.id
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
                    setNewProjectLoading(false);
                    return false;
                  } else {
                    removeAll();
                    setProject(null);
                    setToast({
                      text: "We've deleted this project.",
                      delay: 10000
                    });
                    setNewProjectName("");
                    setProjectId("");
                    return true;
                  }
                }}
              >
                delete the project
              </Text>
              .
            </p>
          </>
        )}
        {!project && (
          <>
            You don't seem to have a project at the moment! Let's change that.
            <Grid.Container gap={1} justify="center" marginTop={1}>
              <Grid xs={24} md={12}>
                <Card style={{ width: "100%" }}>
                  <Text h4>Create a Project</Text>
                  <Input
                    crossOrigin={true}
                    value={newProjectName}
                    onChange={newProjectHandler}
                    placeholder="Project Name"
                    width="100%"
                  />
                  <Button
                    auto
                    type="secondary"
                    marginTop={1}
                    onClick={async (data) => {
                      setNewProjectLoading(true);
                      let res = await fetch(
                        transformAPIURL("/project/create"),
                        {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json"
                          },
                          body: JSON.stringify({
                            name: newProjectName
                          })
                        }
                      ).then((r) => r.json());
                      if (res.error) {
                        setToast({
                          text: `${res.error.name ?? "Error"}: ${
                            res.error.meta?.cause ?? "Unknown error."
                          }`,
                          delay: 2000,
                          type: "error"
                        });
                        setNewProjectLoading(false);
                        return false;
                      } else {
                        setProject(res.project);
                        setToast({
                          text: "We've created this project.",
                          delay: 10000
                        });
                        setNewProjectLoading(false);
                        return true;
                      }
                    }}
                    loading={newProjectLoading}
                  >
                    Create
                  </Button>
                </Card>
              </Grid>
              <Grid xs={24} md={12}>
                <Card style={{ width: "100%" }}>
                  <Text h4>Join a Pre-Existing Project</Text>
                  <Input
                    crossOrigin={true}
                    value={projectId}
                    onChange={projectIdHandler}
                    placeholder="Project ID"
                    width="100%"
                  />
                  <Button
                    auto
                    type="secondary"
                    marginTop={1}
                    onClick={async (data) => {
                      setProjectIdLoading(true);
                      let res = await fetch(transformAPIURL("/project/join"), {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                          id: projectId
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
                        setProjectIdLoading(false);
                        return false;
                      } else {
                        setProject(res.project);
                        setToast({
                          text: "You've joined the project.",
                          delay: 10000
                        });
                        setProjectIdLoading(false);
                        return true;
                      }
                    }}
                    loading={projectIdLoading}
                  >
                    Join The Project
                  </Button>
                </Card>
              </Grid>
            </Grid.Container>
          </>
        )}
      </div>
    </>
  );
}

Attendee.getLayout = function getLayout(
  page: ReactElement,
  props: { hackathon: Hackathon | null; attendee: Attendee | null }
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
    const hackathon = await prisma.hackathon.findFirst({
      where: {
        OR: [
          {
            slug: context.params?.slug.toString()
          },
          {
            customDomain: context.params?.slug.toString()
          }
        ]
      }
    });
    if (hackathon) {
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
            project: true
          }
        });
      }
      if (attendee) {
        return {
          props: {
            hackathon: hackathon,
            attendee: attendee
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
      destination: "/register",
      permanent: false
    }
  };
}) satisfies GetServerSideProps<{
  hackathon: Hackathon | null;
  attendee: Attendee | null;
}>;
