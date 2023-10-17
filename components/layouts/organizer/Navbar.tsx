import { useScrollPosition } from "@/hooks/useScrollPosition";
import { useTheme } from "@/hooks/useTheme";
import useUrlState from "@/hooks/useUrlState";
import { ClerkLoaded, UserButton } from "@clerk/nextjs";
import { Breadcrumbs, Input, Select, Tabs } from "@geist-ui/core";
import { Moon, Search, Sun } from "@geist-ui/react-icons";
import HomeIcon from "@geist-ui/react-icons/home";
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
  {
    label: "Sponsors",
    value: "sponsors"
  },
  {
    label: "Leads",
    value: "leads"
  },
  {
    label: "Integrations",
    value: "integrate"
  },
  {
    label: "Finances",
    value: "finance"
  },
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
      className={`w-full flex flex-col sticky top-0 left-0 z-50 ${
        !showTabs && "border-b border-solid border-[#eaeaea]"
      }`}
    >
      <nav
        className={`${
          theme === "dark" ? "bg-slate-950" : "bg-slate-50"
        } w-full grid grid-cols-3 h-14 items-center justify-between box-border py-3`}
      >
        <div className="flex gap-8">
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
        </div>
        <div className="flex items-center justify-center w-full gap-4">
          <SearchBar />
        </div>
        <div className="flex items-center justify-end gap-4">
          <Select
            h="28px"
            pure
            onChange={(value) => {
              setTheme(value as "light" | "dark");
            }}
            value={theme}
            title="Switch Theme"
            className="min-w-[85px]"
          >
            <Select.Option value="light">
              <span className="w-auto h-[18px] flex justify-between items-center gap-1">
                <Sun size={14} /> Light
              </span>
            </Select.Option>
            <Select.Option value="dark">
              <span className="w-auto h-[18px] flex justify-between items-center gap-1">
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
            className={`${theme === "dark" ? "bg-slate-950" : "bg-slate-50"}`}
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
            `
            }}
          />
        </div>
      )}
    </div>
  );
}
