import prisma from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { Page } from "@geist-ui/core";
import type { GetServerSideProps } from "next";

import HackathonLayout from "@/components/layouts/organizer/OrganizerLayout";
import FeatureInfo from "@/components/organizer/FeatureInfo";
import { Link } from "@geist-ui/react-icons";
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

  if (!hackathon.leadsEnabled)
    return (
      <Page>
        <FeatureInfo
          featureKey="leadsEnabled"
          featureName="Leads"
          featureDescription={
            <>
              Manage leads for venues, sponsorships, and other
              hackathon&nbsp;resources.
            </>
          }
          featureIcon={Link}
          hackathonSlug={hackathon.slug}
        />
      </Page>
    );

  return (
    <>
      <Page>
        <h1>Leads</h1>
      </Page>
    </>
  );
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
            ownerId: userId ?? undefined
          },
          {
            collaboratorIds: {
              has: userId
            }
          }
        ]
      }
    });
    return {
      props: {
        hackathon
      }
    };
  } else {
    return {
      props: {
        hackathon: null
      }
    };
  }
}) satisfies GetServerSideProps<{
  hackathon: Hackathon | null;
}>;
