import prisma from "@/lib/prisma";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { getAuth } from "@clerk/nextjs/server";
import {
    Button,
    Page
} from "@geist-ui/core";
import type { GetServerSideProps } from "next";

import type { Hackathon } from "@prisma/client";
import Link from "next/link";

export default function Index({
  hackathons
}: {
  hackathons: Hackathon[];
}): any {
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
    }
  };
}) satisfies GetServerSideProps<{
  hackathons: Hackathon[];
}>;
