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

export default function Index({ hackathons }: { hackathons: Hackathon[] }): any {

  return (
    <>
			<Page>
        <Page.Header>
          <UserButton afterSignOutUrl="/" />
        </Page.Header>
        <h2>Hackathon Thing</h2>
        <SignedIn>
          <Link href="/dashboard">
            <Button>Dashboard</Button>
          </Link>
        </SignedIn>
        <SignedOut>
          <Link href="/sign-in/">
            <Button>Sign In</Button>
          </Link>
        </SignedOut>
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