import { useHackathon, useMyHackathons } from "@/hooks/data/hackathons";
import useUrlState from "@/hooks/useUrlState";
import { fetcher } from "@/lib/fetcher";
import { ClerkLoaded, UserButton } from "@clerk/nextjs"
import { Breadcrumbs, Button, Popover, Select, Tabs, Text } from "@geist-ui/core"
import { ChevronUpDown } from "@geist-ui/react-icons";
import HomeIcon from "@geist-ui/react-icons/home"
import { Hackathon } from "@prisma/client";
import { ReactElement, ReactNode } from "react";

import useSWR from "swr"

type TypescriptIsWrong = any;

export default function Navbar ({ breadcrumbs }: { breadcrumbs: any }) {
    const { hackathons, isLoading, isError } = useMyHackathons();

    const { hackathon: activeHackathon } = useUrlState(['hackathon']);

    return (
      <nav style={{
        width: '100%',
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxSizing: 'border-box',
        padding: '0px 32px',
        boxShadow: 'inset 0 -1px 0 0 hsla(0,0%,0%,.1)'
      }}>
  
        <Breadcrumbs>
          <Breadcrumbs.Item nextLink href="/dashboard"><HomeIcon /></Breadcrumbs.Item>
          {breadcrumbs}
          {/* <Breadcrumbs.Item href=""><Inbox /> Inbox</Breadcrumbs.Item>
          <Breadcrumbs.Item>Page</Breadcrumbs.Item> */}



            <Popover content={<>
                <Popover.Item title>
                    <span>User Settings</span>
                </Popover.Item>
                <Popover.Item>
                </Popover.Item>
                <Popover.Item>
                </Popover.Item>
                <Popover.Item line />
                <Popover.Item>
                    <span>Command-Line</span>
                </Popover.Item>
            </> as TypescriptIsWrong}>
                <Tabs hideDivider hideBorder margin={0} style={{

                }}>
                    <Tabs.Item value="1" label={<span style={{
                        margin: '0px -8px'
                    }}>
                        <ChevronUpDown />
                    </span>} style={{ textTransform: 'uppercase' }} margin={1} />
                </Tabs>
            </Popover>
        </Breadcrumbs>
        <div>
            
        </div>
        <div>
          <ClerkLoaded>
            <UserButton signInUrl="/sign-in" userProfileMode="modal" afterSignOutUrl="/" />
          </ClerkLoaded>
        </div>
  
      </nav>
    )
}