import prisma from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { Button, Checkbox, Page, Table, Tooltip } from "@geist-ui/core";
import type { GetServerSideProps } from "next";

import Debug from "@/components/Debug";
import HackathonLayout from "@/components/layouts/organizer/OrganizerLayout";
import { HelpCircle } from "@geist-ui/react-icons";
import type {
  Attendee,
  AttendeeAttribute,
  AttendeeAttributeValue,
  Hackathon
} from "@prisma/client";
import { DEFAULT_COLUMN_TYPES } from "active-table/dist/enums/defaultColumnTypes";
import dynamic from "next/dynamic";
import type { ReactElement } from "react";
import React, { useRef, useState } from "react";

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

function fix<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

export type Column = {
  type: string;
  name: string;
  id: string;
  fromAttendee?: (attendee: Attendee) => string;
  readOnly?: boolean;
};

export function NewDataTable({
  attendees,
  attributes
}: {
  attendees: AttendeeWithAttributes[];
  attributes: AttendeeAttribute[];
}) {
  const ActiveTable = dynamic(
    () => import("active-table-react").then((mod) => mod.ActiveTable),
    {
      ssr: false
    }
  );

  const builtInAttributes: Column[] = [
    {
      type: "text",
      name: "ID",
      id: "built-in",
      fromAttendee: (attendee: Attendee) => attendee.id,
      readOnly: true
    },
    {
      type: "text",
      name: "Name",
      id: "built-in",
      fromAttendee: (attendee: Attendee) => attendee.name,
      readOnly: false
    },
    {
      type: "text",
      name: "Email",
      id: "built-in",
      fromAttendee: (attendee: Attendee) => attendee.email,
      readOnly: false
    },
    {
      type: "checkbox",
      name: "Checked In",
      id: "built-in",
      fromAttendee: (attendee: Attendee) =>
        attendee.checkedIn ? "true" : "false",
      readOnly: true
    }
  ]; // these are separated that way we can use them when setting column settings

  const defaultShape: Column[] = [
    ...builtInAttributes,
    ...attributes.map((attribute: AttendeeAttribute) => ({
      type: "text",
      name: attribute.name,
      id: attribute.id
    }))
  ];

  function getAttributeValue(
    { attributeValues }: AttendeeWithAttributes,
    value: string
  ) {
    const attributeId = attributes.find(
      (attribute: AttendeeAttribute) => attribute.name == value
    )?.id;

    const attendeeAttribute = attributeValues.find(
      (attributeValue: AttendeeAttributeValue) =>
        attributeValue.formFieldId == attributeId
    );

    return attendeeAttribute?.value;
  }

  const defaultContent = [
    defaultShape.map((s: Column) => s.name),
    ...attendees.map((attendee: AttendeeWithAttributes) => {
      const contentArray = [];

      for (const column of defaultShape) {
        if (column.fromAttendee)
          contentArray.push(column.fromAttendee(attendee));
        else contentArray.push(getAttributeValue(attendee, column.name));
      }

      return contentArray;
    })
  ];

  const lastSavedShapeRef = useRef(fix(defaultShape));
  const latestShapeRef = useRef(fix(defaultShape));

  const [shape, setShape] = useState(defaultShape);

  console.log("INITIAL SHAPE", shape);

  const [content, setContent] = useState([
    ...defaultContent.map((s: any) => [...s])
  ]);
  const contentRef = useRef([...defaultContent.map((s: any) => [...s])] as any);
  // (window as any).stringifiedContent = JSON.stringify(defaultContent)

  // useEffect(() => {
  //   contentRef.current = content;
  // }, [content]);

  return (
    <>
      <div className="activetable__wrapper">
        <style
          dangerouslySetInnerHTML={{
            __html: `
          .activetable__wrapper > * > table {
            width: 100vw;
            margin: -10px
          }
        `
          }}
        ></style>
        <ActiveTable
          tableStyle={{
            width: "100%"
          }}
          content={content as any}
          onContentUpdate={async (newContent) => {
            // return setContent(newContent as any);
            const oldHeaders = fix(contentRef.current[0] as string[]);
            const newHeaders = newContent[0] as string[];

            console.log("[event] content update", {
              newHeaders,
              oldHeaders,
              defaultContent,
              defaultShape,
              attributes
            });

            if (oldHeaders.length < newHeaders.length) {
              // a column was added

              for (let i = 0; i < newHeaders.length; i++) {
                const newHeader = newHeaders[i];
                if (!oldHeaders.includes(newHeader)) {
                  let tempShape = [...latestShapeRef.current];
                  tempShape.splice(i, 0, {
                    type: "text",
                    name: newHeader,
                    id: "to-create"
                  });
                  latestShapeRef.current = tempShape;
                  // setShape(tempShape);
                }
              }
            } else if (oldHeaders.length > newHeaders.length) {
              // a column was removed

              for (let i = 0; i < oldHeaders.length; i++) {
                const oldHeader = oldHeaders[i];
                if (!newHeaders.includes(oldHeader)) {
                  let tempShape = [...latestShapeRef.current];
                  delete tempShape[i];
                  latestShapeRef.current = tempShape;
                  // setShape(tempShape);
                }
              }
            } else if (oldHeaders.length == newHeaders.length) {
              let differences: {
                old: string;
                new: string;
                index: number;
              }[] = [];

              for (let i = 0; i < oldHeaders.length; i++) {
                if (oldHeaders[i] != newHeaders[i]) {
                  differences.push({
                    old: oldHeaders[i],
                    new: newHeaders[i],
                    index: i
                  });
                }
              }

              if (differences.length > 0) {
                console.log("[event] differences found", { differences });
              }

              if (differences.length == 1) {
                // a column was renamed

                let tempShape = [...latestShapeRef.current];
                tempShape[differences[0].index].name = differences[0].new;
                latestShapeRef.current = tempShape;
              } else if (differences.length == 2) {
                // a column was moved

                let tempShape = [...latestShapeRef.current];
                let tempColumn = { ...tempShape[differences[0].index] };
                tempShape[differences[0].index] ==
                  tempShape[differences[1].index];
                tempShape[differences[1].index] == tempColumn;
                latestShapeRef.current = tempShape;
              } else if (differences.length > 2) {
                // some goofy shit happened that we don't understand

                console.error("Long differences length found");
              } else {
                // table body updated

                console.log("[event] table body updated");
              }
            }

            setContent(newContent as any);

            contentRef.current = fix(newContent) as any;
          }}
          displayAddNewColumn={false}
          onColumnsUpdate={(newColumns) => {
            const oldShape = fix(lastSavedShapeRef.current);
            const newShape = latestShapeRef.current;

            const isNew = JSON.stringify(newShape) != JSON.stringify(oldShape);

            if (!isNew) return false;

            lastSavedShapeRef.current = fix(newShape);

            setShape(newShape);

            console.log("[event] columns changed", { newColumns });
          }}
          customColumnsSettings={shape.map((column: Column, i: number) => {
            console.log({ column });
            return {
              headerName: column.name,
              isHeaderTextEditable: i >= builtInAttributes.length,
              columnDropdown: {
                isSortAvailable: false,
                isDeleteAvailable: i >= builtInAttributes.length,
                isInsertLeftAvailable: i >= builtInAttributes.length,
                isInsertRightAvailable: i >= builtInAttributes.length - 1,
                isMoveAvailable: i >= builtInAttributes.length + 1
              },
              availableDefaultColumnTypes: (i < builtInAttributes.length
                ? [column.type || "text"]
                : undefined) as DEFAULT_COLUMN_TYPES[],
              defaultColumnTypeName: column.type || "text",
              isCellTextEditable: !column.readOnly
            };
          })}
          // customColumnsSettings={(content[0] as any).map((c: any, i: number) => ({
          //   headerName: c,
          //   isHeaderTextEditable: c != "Name" && c != "Email",
          //   columnDropdown: {
          //     isSortAvailable: false,
          //     isDeleteAvailable: true,
          //     isInsertLeftAvailable: c != "Name" && c != "Email",
          //     isInsertRightAvailable: i == (content[0] as any).length - 1,
          //     isMoveAvailable: c != "Name" && c != "Email",
          //   },
          // })) as any} // @sampoder lets change this to use the `shape` variable instead of content, since we'll have more control over the attributes
        />
      </div>
      <Debug data={{ shape }} />
    </>
  );
}

export function DataTableTwo({}) {}

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
