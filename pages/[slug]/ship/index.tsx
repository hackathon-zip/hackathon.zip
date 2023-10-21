import {
    Page
} from "@geist-ui/core";
import { getServerSideProps as getServerSidePropsTemplate } from "../index";

import HackathonLayout from "@/components/layouts/organizer/OrganizerLayout";
import FeatureInfo from "@/components/organizer/FeatureInfo";
import { Package } from "@geist-ui/react-icons";
import type { Hackathon } from "@prisma/client";
import type { ReactElement } from "react";

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

  if (!hackathon.shipEnabled)
    return (
      <Page>
        <FeatureInfo
          featureKey="shipEnabled"
          featureName="Ship"
          featureDescription={
            <>
              Gather project submissions from hackers and manage&nbsp;judging.
            </>
          }
          featureIcon={Package}
          hackathonSlug={hackathon.slug}
        />
      </Page>
    );

  return (
    <>
      <Page>
        <h1>Ship</h1>
        <h3>
          {hackathon.startDate &&
            new Date(hackathon.startDate).toLocaleString()}
          {" to "}
          {hackathon.endDate &&
            new Date(hackathon.endDate).toLocaleString()} at{" "}
          {hackathon?.location}
        </h3>
        <code>/{hackathon?.slug}</code>
      </Page>
    </>
  );
}

Hackathon.getLayout = function getLayout(page: ReactElement) {
  return <HackathonLayout>{page}</HackathonLayout>;
};

export const getServerSideProps = getServerSidePropsTemplate