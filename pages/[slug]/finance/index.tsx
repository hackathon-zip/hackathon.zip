import {
    Input,
    Page,
    Text
} from "@geist-ui/core";
import { getServerSideProps as getServerSidePropsTemplate } from "../index";

import HackathonLayout from "@/components/layouts/organizer/OrganizerLayout";
import FeatureInfo from "@/components/organizer/FeatureInfo";
import { DollarSign } from "@geist-ui/react-icons";
import type { Hackathon } from "@prisma/client";
import { useRouter } from "next/router";
import type { ReactElement } from "react";
import { useState } from "react";
import useSWR from "swr";

export default function Hackathon({
  hackathon
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

  if (!hackathon.financeEnabled) {
    const [hcbSlug, setHcbSlug] = useState<string>("");

    return (
      <Page>
        <FeatureInfo
          beforeSubmit={async () => {
            const hcbData = await fetch(
              `https://hcb.hackclub.com/api/v3/organizations/${hcbSlug}`
            ).then((res) => res.json());

            return {
              hcbId: hcbData.id
            };
          }}
          featureKey="financeEnabled"
          featureName="Finances"
          featureDescription={
            <>
              Grow your understanding of your hackathon's finances by
              linking&nbsp;with&nbsp;HCB.
            </>
          }
          featureIcon={DollarSign}
          hackathonSlug={hackathon.slug}
        >
          <Input
            crossOrigin
            value={hcbSlug}
            onChange={(e) => setHcbSlug(e.target.value)}
            name="hcbSlug"
            label="hcb.hackclub.com/"
            placeholder={hackathon.slug}
            width="400px"
          >
            <Text h5>HCB Account</Text>
          </Input>
        </FeatureInfo>
      </Page>
    );
  }

  const { data, error, isLoading } = useSWR(
    `https://hcb.hackclub.com/api/v3/organizations/${hackathon.hcbId}`,
    {
      keepPreviousData: true
    }
  );

  return (
    <Page>
      <Text h1>Finances</Text>
      <Text>{hackathon.hcbId}</Text>
      <Text>{JSON.stringify(data)}</Text>
    </Page>
  );
}

Hackathon.getLayout = function getLayout(page: ReactElement) {
  return <HackathonLayout>{page}</HackathonLayout>;
};

export const getServerSideProps = getServerSidePropsTemplate