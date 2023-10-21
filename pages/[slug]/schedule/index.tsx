import {
    Page
} from "@geist-ui/core";

import { getServerSideProps as getServerSidePropsTemplate } from "../index";

import HackathonLayout from "@/components/layouts/organizer/OrganizerLayout";
import FeatureInfo from "@/components/organizer/FeatureInfo";
import { Calendar } from "@geist-ui/react-icons";
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

  if (!hackathon.scheduleEnabled)
    return (
      <Page>
        <FeatureInfo
          featureKey="scheduleEnabled"
          featureName="Schedule"
          featureDescription={
            <>
              Effortlessly manage and distribute your hackathon's&nbsp;schedule.
            </>
          }
          featureIcon={Calendar}
          hackathonSlug={hackathon.slug}
        />
      </Page>
    );

  return (
    <>
      <Page>
        <h1>Schedule</h1>
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