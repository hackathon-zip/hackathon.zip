import { Button, Card, Drawer, Fieldset, Grid, Input, Page, Text } from "@geist-ui/core"
import { getAuth } from "@clerk/nextjs/server";
import type { InferGetServerSidePropsType, GetServerSideProps } from 'next'
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import prisma from "@/lib/prisma";
import { NextApiRequest } from "next";
import { NextServerOptions } from "next/dist/server/next";
 
import type { Hackathon } from "@prisma/client";
import { PlusCircle } from "@geist-ui/react-icons";
import { useState } from "react";
import { Form } from "@/components/Form";
import { delay } from "@/lib/utils";
import Debug from "@/components/Debug";
import Link from "next/link";

export default function Hackathon({ hackathon }: { hackathon: Hackathon | null }): any {
  if (!hackathon){
    return (
      <>
        <Page>
          404: Not Found!
        </Page>
      </>
    );
  }

  return (
    <>
			<Page>
        <h1>{hackathon?.name}</h1>
        <h3>
          {hackathon.startDate && new Date(hackathon.startDate).toLocaleString()}{' to '}
          {hackathon.endDate && new Date(hackathon.endDate).toLocaleString()} at {hackathon?.location}
        </h3>
        <code>/{hackathon?.slug}</code>
      </Page>
    </>
  );
}

export const getServerSideProps = (async (context) => {
  const { userId } = getAuth(context.req);
  if(context.params?.slug){
    const hackathon = await prisma.hackathon.findUnique({
      where: {
        slug: context.params?.slug.toString() // this is very jank because Next.js types
      }
    });
    return {
      props: {
        hackathon
      },
    };
  }
  else {
    return {
      props: {
        hackathon: null
      },
    };
  }

  
}) satisfies GetServerSideProps<{
  hackathon: Hackathon | null
}>;