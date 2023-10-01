import { useHackathon, useMyHackathons } from "@/hooks/data/hackathons";
import useUrlState from "@/hooks/useUrlState";
import { fetcher } from "@/lib/fetcher";
import { ClerkLoaded, UserButton } from "@clerk/nextjs";
import {
  Breadcrumbs,
  Button,
  Popover,
  Select,
  Spinner,
  Tabs,
  Text,
} from "@geist-ui/core";
import { ChevronUpDown } from "@geist-ui/react-icons";
import HomeIcon from "@geist-ui/react-icons/home";
import { Hackathon } from "@prisma/client";
import Link from "next/link";
import { useRouter } from "next/router";
import { ReactElement, ReactNode } from "react";

type TypescriptIsWrong = any;

export default function Navbar({ breadcrumbs }: { breadcrumbs: any }) {
  const { hackathons, isLoading, isError } = useMyHackathons();

  const { hackathon: activeHackathonSlug, feature } = useUrlState([
    "hackathon",
    "feature",
  ]);
  const activeHackathon = hackathons.find(
    (h: Hackathon) => h.slug === activeHackathonSlug,
  );

  console.log({ activeHackathonSlug });

  const router = useRouter();

  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <nav
        style={{
          width: "100%",
          display: "flex",
          height: "54px",
          alignItems: "center",
          justifyContent: "space-between",
          boxSizing: "border-box",
          padding: "0px 12px",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "32px",
          }}
        >
          <Breadcrumbs>
            <Breadcrumbs.Item nextLink href="/dashboard">
              <HomeIcon />
            </Breadcrumbs.Item>
            {breadcrumbs}
            {/* <Breadcrumbs.Item href=""><Inbox /> Inbox</Breadcrumbs.Item>
                <Breadcrumbs.Item>Page</Breadcrumbs.Item> */}

            <Breadcrumbs.Item nextLink href={"/" + activeHackathonSlug}>
              {isLoading ? <Spinner /> : activeHackathon?.name}
            </Breadcrumbs.Item>

            <Popover
              content={
                (
                  <>
                    <Popover.Item title>
                      <span>{activeHackathon?.name}</span>
                    </Popover.Item>
                    {hackathons
                      .filter((h: Hackathon) => h.slug !== activeHackathonSlug)
                      .map((h: Hackathon) => (
                        <Popover.Item>
                          <Link href={`/${h.slug}`}>{h.name}</Link>
                        </Popover.Item>
                      ))}
                  </>
                ) as TypescriptIsWrong
              }
            >
              <Button icon={<ChevronUpDown />} auto scale={2 / 3} />
            </Popover>
          </Breadcrumbs>
        </div>
        <div>
          <ClerkLoaded>
            <UserButton
              signInUrl="/sign-in"
              userProfileMode="modal"
              afterSignOutUrl="/"
            />
          </ClerkLoaded>
        </div>
      </nav>

      <div
        style={{
          width: "100%",
        }}
      >
        <Tabs
          onChange={(value) => {
            router.push(`/${activeHackathonSlug}/${value == 'dashboard' ? '' : value}`);
          }}
          value={feature ?? 'dashboard'}
        >
          <Tabs.Tab label="Dashboard" value="dashboard" />
          <Tabs.Tab label="Attendees" value="data" />
          <Tabs.Tab label="Registration" value="register" />
          <Tabs.Tab label="Check-In" value="check-in" />
          <Tabs.Tab label="Broadcasts" value="broadcast" />
          <Tabs.Tab label="Schedule" value="schedule" />
          <Tabs.Tab label="Ship" value="ship" />
          <Tabs.Tab label="Integrations" value="integrate" />
          <Tabs.Tab label="Settings" value="settings" />
        </Tabs>
      </div>
    </div>
  );
}
