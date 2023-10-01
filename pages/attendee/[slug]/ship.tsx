import { Button, Card, Drawer, Fieldset, Grid, Input, Page, Text } from "@geist-ui/core"
import type { InferGetServerSidePropsType, GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import prisma from "@/lib/prisma";
import { NextApiRequest } from "next";
import { NextServerOptions } from "next/dist/server/next";
 
import type { Hackathon, Attendee } from "@prisma/client";
import React, { useState } from "react";
import type { ReactElement } from "react";
import Link from "next/link";
import AttendeeLayout from "@/components/layouts/attendee/AttendeeLayout";

export default function Attendee({ hackathon }: { hackathon: Hackathon | null }): any {
  if (!hackathon){
    return (
      <>
        <div>
          404: Hackathon Not Found!
        </div>
      </>
    );
  }

  return (
    <>
      <div>
        <h1>Ship</h1>
      </div>
    </>
  );
}

Attendee.getLayout = function getLayout(page: ReactElement, props: { hackathon: Hackathon | null, attendee: Attendee | null }) {
  return (
    <AttendeeLayout hackathon={props.hackathon} attendee={props.attendee}>
      {page}
    </AttendeeLayout>
  )
}
  
export const getServerSideProps = (async (context: GetServerSidePropsContext) => {
  if (context.params?.slug) {
    const hackathon = await prisma.hackathon.findUnique({
      where: {
        slug: context.params?.slug.toString(),
      },
    });
    if(hackathon){
      const token = context.req.cookies[hackathon?.slug as string]
      let attendee = null
      if(token){
        attendee = await prisma.attendee.findFirst({
          where: {
            hackathonId: hackathon.id,
            tokens: {
              some: {
                token: token
              }
            }
          },
        });
      }
      return {
        props: {
          hackathon: hackathon,
          attendee: attendee
        },
      };
    }
    
  }
  return {
    props: {
      hackathon: null,
      attendee: null
    },
  };
}) satisfies GetServerSideProps<{
  hackathon: Hackathon | null;
  attendee: Attendee | null;
}>;