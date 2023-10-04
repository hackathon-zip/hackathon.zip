import {
  Button,
  Card,
  Checkbox,
  Code,
  Drawer,
  Fieldset,
  Grid,
  Input,
  Page,
  Snippet,
  Table,
  Text,
  Tooltip
} from "@geist-ui/core";
import { getAuth } from "@clerk/nextjs/server";
import type { InferGetServerSidePropsType, GetServerSideProps } from "next";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import prisma from "@/lib/prisma";
import { NextApiRequest } from "next";
import { NextServerOptions } from "next/dist/server/next";

import type {
  Attendee,
  Hackathon,
  AttendeeAttribute,
  AttendeeAttributeValue
} from "@prisma/client";
import { HelpCircle, PlusCircle } from "@geist-ui/react-icons";
import React, { useState } from "react";
import type { ReactElement } from "react";
import { Form } from "@/components/Form";
import { delay } from "@/lib/utils";
import Debug from "@/components/Debug";
import Link from "next/link";
import HackathonLayout from "@/components/layouts/organizer/OrganizerLayout";
import dynamic from "next/dynamic";

type AttendeeWithAttributes = Attendee & {
  attributeValues: AttendeeAttributeValue[];
};

type HackathonWithAttendees = Hackathon & {
  attendeeAttributes: AttendeeAttribute[];
  attendees: AttendeeWithAttributes[];
};

function DataTable({
  attendees,
  attributes
}: {
  attendees: AttendeeWithAttributes[];
  attributes: AttendeeAttribute[];
}) {
  const builtinColumns: {
    [key in keyof Attendee]?: {
      label: JSX.Element | string;
      render?: (value: any, rowData: any) => JSX.Element;
    };
  } = {
    name: {
      label: "Name"
    },
    email: {
      label: "Email"
    },
    checkedIn: {
      label: (
        <>
          Checked In
          <Tooltip
            text="This column cannot be modified. To check in an attendee, use the Check-In system."
            style={{
              scale: "0.8",
              marginLeft: "4px"
            }}
            scale={2 / 3}
          >
            <HelpCircle
              style={{
                scale: "0.2"
              }}
            />
          </Tooltip>
        </>
      ),
      render: (value: any, rowData: any) => {
        return (
          <span
            style={{
              pointerEvents: "none"
            }}
          >
            <Checkbox checked={value} scale={3 / 2} style={{}} />
          </span>
        );
      }
    }
  };
  const columns = [
    ...Object.entries(builtinColumns).map(([prop, { label, render }]) => ({
      label,
      prop,
      render
    })),
    ...attributes.map((attribute) => ({
      label: attribute.name,
      prop: attribute.id,
      render: (value: any, rowData: any) => {
        return value;
      }
    }))
  ];
  const dataSource = attendees.map((attendee) => {
    const row: any = {
      key: attendee.id
    };
    attendee.attributeValues.forEach(
      (attributeValue: AttendeeAttributeValue) => {
        row[attributeValue.formFieldId] = attributeValue.value;
      }
    );
    for (const prop in builtinColumns) {
      row[prop] = attendee[prop as keyof Attendee];
    }
    return row;
  });
  const [data, setData] = React.useState(dataSource);
  const renderAction = (value: any, rowData: any, rowIndex: any) => {
    const updateHandler = () => {
      setData((last) => {
        return last.map((item, dataIndex) => {
          if (dataIndex !== rowIndex) return item;
          return {
            ...item,
            property: Math.random().toString(16).slice(-5)
          };
        });
      });
    };
    return (
      <Button
        type="secondary"
        auto
        scale={1 / 3}
        font="12px"
        onClick={updateHandler}
      >
        Update
      </Button>
    );
  };
  return (
    <Table data={data} onChange={(value) => setData(value)}>
      {columns.map((column, index) => (
        <Table.Column key={index} {...(column as any)} />
      ))}
    </Table>
  );
}

export function NewDataTable ({ attendees, attributes }: { attendees: AttendeeWithAttributes[], attributes: AttendeeAttribute[] }) {
  const ActiveTable = dynamic(
    () => import("active-table-react").then((mod) => mod.ActiveTable),
    {
      ssr: false,
    }
  );

  const defaultContent: any = [
    ["Planet", "Diameter", "Mass", "Moons", "Density"],
    ["Earth", 12756, 5.97, 1, 5514],
    ["Mars", 6792, 0.642, 2, 3934],
    ["Jupiter", 142984, 1898, 79, 1326],
    ["Saturn", 120536, 568, 82, 687],
    ["Neptune", 49528, 102, 14, 1638]];

  const [content, setContent] = useState(defaultContent);


  return (
    <>
      <ActiveTable content={content} onContentUpdate={newContent => {
        console.log('content changed');
        console.log(newContent);
        setContent(newContent);
      }} displayAddNewColumn={false} customColumnsSettings={content[0].map((c: any) => ({
        headerName: c,
        isHeaderTextEditable: false,
        columnDropdown: {
          isSortAvailable: false,
          isDeleteAvailable: false,
          isInsertLeftAvailable: false,
          isInsertRightAvailable: false,
          isMoveAvailable: true
        }
      })) as any} />
    </>
  )
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

  console.log({ hackathon });

  return (
    <>
      <Page>
        <h1>Attendees</h1>

        <NewDataTable
          attendees={hackathon.attendees}
          attributes={hackathon.attendeeAttributes}
        />
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
      },
      include: {
        attendeeAttributes: true,
        attendees: {
          include: {
            attributeValues: true
          }
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
