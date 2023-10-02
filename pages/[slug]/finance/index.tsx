import {
    Button,
    Card,
    Display,
    Drawer,
    Fieldset,
    Grid,
    Input,
    Page,
    Text,
  } from "@geist-ui/core";
  import { getAuth } from "@clerk/nextjs/server";
  import type { InferGetServerSidePropsType, GetServerSideProps } from "next";
  import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
  import prisma from "@/lib/prisma";
  import { NextApiRequest } from "next";
  import { NextServerOptions } from "next/dist/server/next";
  
  import type { Hackathon } from "@prisma/client";
  import { DollarSign, PlusCircle } from "@geist-ui/react-icons";
  import React, { useState } from "react";
  import type { ReactElement } from "react";
  import { Form } from "@/components/Form";
  import { delay } from "@/lib/utils";
  import Debug from "@/components/Debug";
  import Link from "next/link";
  import HackathonLayout from "@/components/layouts/organizer/OrganizerLayout";
  import { useRouter } from "next/router";
import FeatureInfo from "@/components/organizer/FeatureInfo";
  
  export default function Hackathon({
    hackathon,
  }: {
    hackathon: Hackathon | null;
  }): any {
    const router = useRouter();
  
    if (!hackathon) {
      return (
        <>
          <Page>404: Not Found!</Page>
        </>
      );
    }
  
    if (!hackathon.financeEnabled) return (
      <Page>
        <FeatureInfo featureName="Finances" featureDescription={<>
          Grow your understanding of your hackathon's finances by linking&nbsp;with&nbsp;HCB.
        </>} featureIcon={DollarSign}>
          <Input crossOrigin name="hcbSlug" label="hcb.hackclub.com/" placeholder={hackathon.slug} width="400px">
              <Text h5>
                  HCB Account
              </Text>
          </Input>
        </FeatureInfo>
      </Page>
    );

    return (
      <Page>
        <Text h1>Finances</Text>
      </Page>
    )
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
              ownerId: userId ?? undefined,
            },
            {
              collaboratorIds: {
                has: userId,
              },
            },
          ],
        },
      });
      return {
        props: {
          hackathon,
        },
      };
    } else {
      return {
        props: {
          hackathon: null,
        },
      };
    }
  }) satisfies GetServerSideProps<{
    hackathon: Hackathon | null;
  }>;
  