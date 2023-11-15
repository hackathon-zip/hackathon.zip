import { useScrollPosition } from "@/hooks/useScrollPosition";
import { useTheme } from "@/hooks/useTheme";
import useUrlState from "@/hooks/useUrlState";
import { ClerkLoaded, UserButton } from "@clerk/nextjs";
import { Breadcrumbs, Input, Select, Tabs } from "@geist-ui/core";
import { Moon, Search, Sun, Users } from "@geist-ui/react-icons";
import HomeIcon from "@geist-ui/react-icons/home";
import Link from "next/link";
import { useRouter } from "next/router";
import { ReactNode, useRef, useState } from "react";

type TypescriptIsWrong = any;

function SearchBar() {
  const inputRef = useRef<any>(null);
  const [query, setQuery] = useState<string>("");

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "500px",
        cursor: "text"
      }}
      onClick={() => {
        inputRef.current.focus();
      }}
    >
      <Input
        ref={inputRef}
        crossOrigin
        name="input"
        icon={<Search />}
        placeholder="Search..."
        width="100%"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
        }}
      />
    </div>
  );
}

export const NavbarTabs = [
  {
    label: "Dashboard",
    value: "dashboard"
  },
  {
    label: "Attendees",
    value: "data"
  },
  {
    label: "Registration",
    value: "register"
  },
  {
    label: "Check-In",
    value: "check-in"
  },
  {
    label: "Broadcasts",
    value: "broadcast"
  },
  {
    label: "Schedule",
    value: "schedule"
  },
  {
    label: "Ship",
    value: "ship"
  },
  /*{
    label: "Sponsors",
    value: "sponsors"
  },
  {
    label: "Leads",
    value: "leads"
  },*/
  {
    label: "Integrations",
    value: "integrate"
  },
  /*{
    label: "Finances",
    value: "finance"
  },*/
  {
    label: "Settings",
    value: "settings"
  }
];

export default function Navbar({
  breadcrumbs,
  showTabs = true
}: {
  showTabs?: boolean;
  breadcrumbs?: { value: ReactNode; href?: string }[];
}) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  const { hackathon: activeHackathonSlug, feature } = useUrlState([
    "hackathon",
    "feature"
  ]);

  const { scrollY } = useScrollPosition();

  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        position: "sticky",
        top: 0,
        left: 0,
        zIndex: 999,
        borderBottom: !showTabs ? "1px solid #eaeaea" : undefined
      }}
    >
      <nav
        style={{
          width: "100%",
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          height: "54px",
          alignItems: "center",
          justifyContent: "space-between",
          boxSizing: "border-box",
          padding: "0px 12px",
          background: theme === "dark" ? "#131313" : "#ffffff"
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "32px"
          }}
        >
          <Breadcrumbs>
            <Breadcrumbs.Item nextLink href="/dashboard">
              <HomeIcon />
            </Breadcrumbs.Item>
            {breadcrumbs?.map((b) => (
              <Breadcrumbs.Item nextLink={!!b.href} href={b.href}>
                {b.value}
              </Breadcrumbs.Item>
            ))}
            {/* <Breadcrumbs.Item href=""><Inbox /> Inbox</Breadcrumbs.Item>
                <Breadcrumbs.Item>Page</Breadcrumbs.Item> */}
          </Breadcrumbs>
          {activeHackathonSlug != "dashboard" && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer"
              }}
            >
              <Link
                href={`/${activeHackathonSlug}/team`}
                style={{
                  color: "unset",
                  textDecoration: "none",
                  display: "flex"
                }}
              >
                <Users
                  color={theme == "light" ? "#888888" : "#cfcfcf"}
                  size={20}
                />
              </Link>
            </div>
          )}
        </div>
        <div
          style={{
            display: "flex",
            gap: "16px",
            alignItems: "center",
            justifyContent: "center",
            width: "100%"
          }}
        >
          <SearchBar />
        </div>
        <div
          style={{
            display: "flex",
            gap: "16px",
            alignItems: "center",
            justifyContent: "flex-end"
          }}
        >
          <Select
            h="28px"
            pure
            onChange={(value) => {
              setTheme(value as "light" | "dark");
            }}
            value={theme}
            title="Switch Theme"
            style={{
              minWidth: "85px"
            }}
          >
            <Select.Option value="light">
              <span className="select-content">
                <Sun size={14} /> Light
              </span>
            </Select.Option>
            <Select.Option value="dark">
              <span className="select-content">
                <Moon size={14} /> Dark
              </span>
            </Select.Option>
          </Select>
          <ClerkLoaded>
            <UserButton
              signInUrl="/sign-in"
              userProfileMode="modal"
              afterSignOutUrl="/"
            />
          </ClerkLoaded>
        </div>
      </nav>

      {showTabs && (
        <div
          style={{
            width: "100%"
          }}
        >
          <Tabs
            onChange={(value) => {
              router.push(
                `/${activeHackathonSlug}/${value == "dashboard" ? "" : value}`
              );
            }}
            style={{
              background: theme === "dark" ? "#131313" : "#ffffff"
            }}
            value={feature ?? "dashboard"}
          >
            {NavbarTabs.map((tab) => (
              <Tabs.Item label={tab.label} value={tab.value} />
            ))}
          </Tabs>
          <style
            dangerouslySetInnerHTML={{
              __html: `
              .tab-styles-locator {
                display: none;
              }
  
              :has(> .tab-styles-locator) {
                display: none;
              }

              .tabs > .content {
                padding-top: 0px !important;
              }
  
              .select-content {
                width: auto;
                height: 18px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                gap: 4px;
              }
            `
            }}
          />
        </div>
      )}
    </div>
  );
}
