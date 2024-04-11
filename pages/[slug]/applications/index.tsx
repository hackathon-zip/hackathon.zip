import { Button, Card, Link, Page, Text, Textarea } from "@geist-ui/core";

import HackathonLayout from "@/components/layouts/organizer/OrganizerLayout";
import FeatureInfo from "@/components/organizer/FeatureInfo";
import { CheckSquare } from "@geist-ui/react-icons";
import type { Hackathon } from "@prisma/client";

import { css } from "@/components/CSS";
import { useDomId } from "@/hooks/useDomId";
import { useState } from "react";
import { getServerSideProps as getServerSidePropsTemplate } from "../index";

export default function Hackathon({
  hackathon
}: {
  hackathon: Hackathon | null;
}): any {
  if (!hackathon) {
    return (
      <>
        <Page>404: Not Found!</Page>
      </>
    );
  }

  if (!hackathon.applicationsEnabled)
    return (
      <Page>
        <FeatureInfo
          featureKey="applicationsEnabled"
          featureName="Applications"
          featureDescription={
            <>
              Accept hackers to your hackathon.
            </>
          }
          featureIcon={CheckSquare}
          hackathonSlug={hackathon.slug}
        />
      </Page>
    );

  return (
    <>
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          flexDirection: "row"
        }}
      >
        We need to build this!
      </div>
    </>
  );
}

Hackathon.getLayout = function getLayout(page: JSX.Element) {
  return <HackathonLayout>{page}</HackathonLayout>;
};

export const getServerSideProps = getServerSidePropsTemplate;
