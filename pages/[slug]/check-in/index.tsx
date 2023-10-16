import {
  Button,
  Card,
  Drawer,
  Fieldset,
  Grid,
  Input,
  Page,
  Text,
  Table,
  Checkbox,
  useToasts
} from "@geist-ui/core";
import { getAuth } from "@clerk/nextjs/server";
import type { InferGetServerSidePropsType, GetServerSideProps } from "next";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import prisma from "@/lib/prisma";
import { NextApiRequest } from "next";
import { NextServerOptions } from "next/dist/server/next";
import type { Attendee, Hackathon } from "@prisma/client";
import { CheckSquare, Key, PlusCircle } from "@geist-ui/react-icons";
import React, { useState } from "react";
import type { ReactElement } from "react";
import { Form } from "@/components/Form";
import { delay } from "@/lib/utils";
import Debug from "@/components/Debug";
import Link from "next/link";
import HackathonLayout from "@/components/layouts/organizer/OrganizerLayout";
import FeatureInfo from "@/components/organizer/FeatureInfo";
import { css } from "@/components/CSS";
import EditableValue, { EditableHeader } from "@/components/EditableValue";
import useViewport from "@/hooks/useViewport";
import { orderedSort, sl } from "@/lib/utils";
import { Plus, Trash2 } from "@geist-ui/react-icons";
import md5 from "md5";
import { useRouter } from "next/router";
import { v4 as uuidv4 } from "uuid";

type HackathonWithAttendees = Hackathon & {
  attendees: Attendee[];
};

export type Column = {
  type: string;
  name: string;
  id: string;
  readOnly?: boolean;
};

export type BuiltInColumn = Column & {
  fromAttendee: (attendee: Attendee) => string;
  customRender?: (
    value: string,
    attendee?: Attendee
  ) => JSX.Element | string;
};

 // these are separated that way we can use them when setting column settings

function Data({
  hackathon,
  attendees: defaultAttendees
}: {
  hackathon: HackathonWithAttendees;
  attendees: Attendee[];
}) {
  const { width } = useViewport(false);
  const sliceNum = Math.ceil((Math.max(width || 100_000, 1000) - 1000) / 350);
  const { setToast } = useToasts();

  const [attendees, setAttendees] = useState(defaultAttendees);

  const sortedAttendees = orderedSort(
    attendees,
    (a: Attendee, b: Attendee) => {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    },
    (a: Attendee, b: Attendee) => {
      return a.name.localeCompare(b.name);
    },
    (a: Attendee, b: Attendee) => {
      return a.email.localeCompare(b.email);
    },
    (a: Attendee, b: Attendee) => {
      const md5A = md5(JSON.stringify(a));
      const md5B = md5(JSON.stringify(b));

      return md5A.localeCompare(md5B);
    }
  );
  
  const builtInAttributes: BuiltInColumn[] = [
    {
      type: "text",
      name: "Name",
      id: "name",
      fromAttendee: (attendee: Attendee) => attendee.name,
      readOnly: false
    },
    {
      type: "text",
      name: "Email",
      id: "email",
      fromAttendee: (attendee: Attendee) => attendee.email,
      readOnly: false
    },
    {
      type: "checkbox",
      name: "Checked In",
      id: "built-in",
      fromAttendee: (attendee: Attendee) =>
        attendee.checkedIn ? "true" : "false",
      customRender: (value: string, attendee?: Attendee) => (
        <Checkbox checked={value == "true"} onClick={async (e) => {
          let res = await fetch(
            `/api/hackathons/${hackathon.slug}/check-in/${attendee?.id}`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json"
              }
            }
          ).then((r) => r.json());
        }} />
      ),
      readOnly: true
    }
  ];

  const tableData = sortedAttendees.map(
    (attendee: Attendee, i: number) => {
      const output: any = {
        $i: i,
        $attendee: attendee
      };

      for (const { name, fromAttendee } of builtInAttributes) {
        output[name] = fromAttendee(attendee);
      }

      return output;
    }
  );
  return (
    width && (
      <>
        {css`
          .attendees-data-table {
            --table-font-size: calc(1 * 11pt) !important;
          }
          .attendees-data-table-row {
            cursor: pointer;
          }
          .attendees-data-table-row:has(.staged-button) {
            background-color: #ec899355;
          }
          .attendees-data-table-row:hover:has(.staged-button) {
            background-color: #ec899369 !important;
          }
          .attendees-data-table-row > td > div.cell {
            min-height: calc(2.525 * var(--table-font-size));
          }
        `}
        <Table
          className="attendees-data-table"
          data={tableData}
          rowClassName={() => "attendees-data-table-row"}
        >
          {builtInAttributes.map((column: BuiltInColumn) => (
            <Table.Column
              prop={column.name}
              label={column.name}
              render={
                column.customRender
                  ? (((value: string, _: unknown, index: number) => {
                      return column.customRender?.(value, attendees[index]);
                    }) as any)
                  : undefined
              }
            />
          ))}
        </Table>
      </>
    )
  );
}

export default function Hackathon({
  hackathon
}: {
  hackathon: null | HackathonWithAttendees;
}): any {
  if (!hackathon) {
    return (
      <>
        <Page>404: Not Found!</Page>
      </>
    );
  }
  
  if (!hackathon.checkInEnabled)
  return (
    <Page>
      <FeatureInfo
        featureKey="checkInEnabled"
        featureName="Check-In"
        featureDescription={
          <>
            Check-in your hackers and track their attendance with&nbsp;ease.
          </>
        }
        featureIcon={CheckSquare}
        hackathonSlug={hackathon.slug}
      />
    </Page>
  );

  return (
    <>
      <Page>
        <Grid.Container justify="space-between" alignItems="center" mb={1}>
          <h1>Check-In</h1>
        </Grid.Container>
        <Card
          style={{
            margin: "-16px"
          }}
        >
          <Data
            hackathon={hackathon}
            attendees={hackathon.attendees}
          />
        </Card>
      </Page>
      {css`
        .select.multiple .icon {
          display: none;
        }
        .select.multiple.active {
          border: 1px solid #eaeaea !important;
        }
        .select.multiple {
          cursor: default !important;
        }
        .select.multiple .option {
          cursor: default !important;
          color: black !important;
        }
        .select-dropdown {
          border: 1px solid black !important;
          padding: 0 !important;
        }
      `}
    </>
  );
}

Hackathon.getLayout = function getLayout(page: ReactElement) {
  return <HackathonLayout>{page}</HackathonLayout>;
};

export const getServerSideProps = (async (context) => {
  const { userId } = getAuth(context.req);

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
      },
      include: {
        attendees: {
          orderBy: [
            {
              createdAt: "desc"
            }
          ]
        }
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
  hackathon: null | HackathonWithAttendees;
}>;
