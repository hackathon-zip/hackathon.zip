import prisma from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { Button, Checkbox, Page, Table, Tooltip } from "@geist-ui/core";
import type { GetServerSideProps } from "next";

import HackathonLayout from "@/components/layouts/organizer/OrganizerLayout";
import { delay } from "@/lib/utils";
import { HelpCircle } from "@geist-ui/react-icons";
import type {
  Attendee,
  AttendeeAttribute,
  AttendeeAttributeValue,
  Hackathon,
} from "@prisma/client";
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
  attributes,
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
      label: "Name",
    },
    email: {
      label: "Email",
    },
    checkedIn: {
      label: (
        <>
          Checked In
          <Tooltip
            text="This column cannot be modified. To check in an attendee, use the Check-In system."
            style={{
              scale: "0.8",
              marginLeft: "4px",
            }}
            scale={2 / 3}
          >
            <HelpCircle
              style={{
                scale: "0.2",
              }}
            />
          </Tooltip>
        </>
      ),
      render: (value: any, rowData: any) => {
        return (
          <span
            style={{
              pointerEvents: "none",
            }}
          >
            <Checkbox checked={value} scale={3 / 2} style={{}} />
          </span>
        );
      },
    },
  };
  const columns = [
    ...Object.entries(builtinColumns).map(([prop, { label, render }]) => ({
      label,
      prop,
      render,
    })),
    ...attributes.map((attribute) => ({
      label: attribute.name,
      prop: attribute.id,
      render: (value: any, rowData: any) => {
        return value;
      },
    })),
  ];
  const dataSource = attendees.map((attendee) => {
    const row: any = {
      key: attendee.id,
    };
    attendee.attributeValues.forEach(
      (attributeValue: AttendeeAttributeValue) => {
        row[attributeValue.formFieldId] = attributeValue.value;
      },
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
            property: Math.random().toString(16).slice(-5),
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

export function NewDataTable(
  { attendees, attributes }: {
    attendees: AttendeeWithAttributes[];
    attributes: AttendeeAttribute[];
  },
) {
  const ActiveTable = dynamic(
    () => import("active-table-react").then((mod) => mod.ActiveTable),
    {
      ssr: false,
    },
  );

  type Column = {
    type: string;
    name: string;
    fromAttendee?: (attendee: Attendee) => string;
  }

  const defaultShape: Column[] = [
    {
      type: 'text',
      name: 'Name',
      fromAttendee: (attendee: Attendee) => attendee.name
    },
    {
      type: 'text',
      name: 'Email',
      fromAttendee: (attendee: Attendee) => attendee.email
    },
    ...attributes.map((attribute: AttendeeAttribute) => ({
      type: 'text',
      name: attribute.name
    }))
  ];

  function getAttributeValue ({ attributeValues }: AttendeeWithAttributes, value: string) {
    const attributeId = attributes.find((attribute: AttendeeAttribute) => attribute.name == value)?.id;

    const attendeeAttribute = attributeValues.find((attributeValue: AttendeeAttributeValue) => attributeValue.formFieldId == attributeId);

    return attendeeAttribute?.value;
  }
  
  // const defaultContent = [defaultShape.map((s: Column) => s.name), ...attendees.map((attendee: AttendeeWithAttributes) => {
  //   const contentArray = [];

  //   for (const column of defaultShape) {
  //     if (column.fromAttendee)
  //       contentArray.push(column.fromAttendee(attendee));
  //     else
  //       contentArray.push(getAttributeValue(attendee, column.name));
  //   }

  //   return contentArray;
  // })];

  const defaultContent = [
    [
        "Name",
        "Email",
        "Favorite Color"
    ],
    [
        "Ian Madden",
        "ian@hackclub.com",
        "Pink"
    ],
    [
        "Sam Poder",
        "test@hackclub.com",
        null
    ],
    [
        "Sam Poder",
        "sam@hackclub.com",
        "Green"
    ],
    [
        "Sam Poder",
        "sampoder@hackclub.com",
        "Blue"
    ],
    [
        "Sam Poder",
        "poder@hackclub.com",
        "Purple"
    ],
    [
        "Sam Poder",
        "sam.r.poder@gmail.com",
        "Purple"
    ],
    [
        "Sam Poder",
        "sam.r.poder+1@gmail.com",
        "Purple"
    ],
    [
        "Sam Poder",
        "sampoder@berkeley.edu",
        "Pink"
    ],
    [
        "Sam Poder",
        "test@sampoder.com",
        "Red"
    ],
    [
        "Test",
        "test@test.test",
        "Test"
    ],
    [
        "Manu Gurudath ",
        "manusvathgurudath@gmail.com",
        "black"
    ],
    [
        "Sam Poder",
        "sam+1222@hackclub.com",
        "Green"
    ],
    [
        "sam",
        "tesss@sampoder.com",
        "green"
    ],
    [
        "Sam Poder",
        "tesssssssss@sampoder.com",
        "Green"
    ],
    [
        "rest in peace",
        "restinpeace@sampoder.com",
        "green"
    ]
]

  console.log('RENDER', defaultContent);


  const shapeRef = useRef(defaultShape);

  const [content, setContent] = useState([...defaultContent.map((s: any) => [...s])]);
  const contentRef = useRef([...defaultContent.map((s: any) => [...s])] as any);
  // (window as any).stringifiedContent = JSON.stringify(defaultContent)

  // useEffect(() => {
  //   contentRef.current = content;
  // }, [content]);
    
  return (
    <>
      <ActiveTable
        content={content as any}
        onContentUpdate={async (newContent) => {
          // return setContent(newContent as any);
          const oldHeaders = JSON.parse(JSON.stringify(contentRef.current[0] as string[]));
          const newHeaders = newContent[0] as string[];

          console.log({
            newHeaders,
            oldHeaders,
            defaultContent,
            defaultShape,
            attributes
          })

          if (oldHeaders.length < newHeaders.length) {
            // a column was added

            for (let i = 0; i < newHeaders.length; i++) {
              const newHeader = newHeaders[i];
              if (!oldHeaders.includes(newHeader)) {
                let tempShape = [...shapeRef.current];
                tempShape.splice(i, 0, {
                  type: 'text',
                  name: newHeader
                })
                // setShape(tempShape);
              }
            }
          } else if (oldHeaders.length > newHeaders.length) {
            // a column was removed

            for (let i = 0; i < oldHeaders.length; i++) {
              const oldHeader = oldHeaders[i];
              if (!newHeaders.includes(oldHeader)) {
                let tempShape = [...shapeRef.current];
                delete tempShape[i];
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

            if(differences.length > 0){
              console.log("we have a difference.")
            }

            if (differences.length == 1) {
              // a column was renamed

              let tempShape = [...shapeRef.current];
              tempShape[differences[0].index].name = differences[0].new;
              // setShape(tempShape);

            } else if (differences.length == 2) {
              // a column was moved

              let tempShape = [...shapeRef.current];
              let tempColumn = {...tempShape[differences[0].index]};
              tempShape[differences[0].index] == tempShape[differences[1].index];
              tempShape[differences[1].index] == tempColumn;
              // setShape(tempShape);

            } else if (differences.length > 2) {
              // some goofy shit happened that we don't understand
              
              console.log("Good luck!");
            } else {
              // table body updated
              
              console.log('Table body updated, hooray!');
            }
          }
          console.log("content changed");
          setContent(newContent as any);
          console.log('fuck react :)');
          await delay(3000);
          console.log('fuck react even more :)');
          await delay(3000);
          console.log("SETTING REF", newContent)
          contentRef.current = JSON.parse(JSON.stringify(newContent)) as any;
          // (window as any).stringifiedContent = JSON.stringify(newContent)
          // setContent(newContent as any);
        }}
        displayAddNewColumn={false}
        onColumnsUpdate={(newColumns) => {
          console.log("columns changed");
          console.log(newColumns);
        }}
        customColumnsSettings={(content[0] as any).map((c: any, i: number) => ({
          headerName: c,
          isHeaderTextEditable: c != "Name" && c != "Email",
          columnDropdown: {
            isSortAvailable: false,
            isDeleteAvailable: true,
            isInsertLeftAvailable: c != "Name" && c != "Email",
            isInsertRightAvailable: i == (content[0] as any).length - 1,
            isMoveAvailable: c != "Name" && c != "Email",
          },
        })) as any}
      />
      {JSON.stringify(content)}
    </>
  );
}

export function DataTableTwo({}) {
}

export default function Hackathon({
  hackathon,
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
            ownerId: userId ?? undefined,
          },
          {
            collaboratorIds: {
              has: userId,
            },
          },
        ],
      },
      include: {
        attendeeAttributes: true,
        attendees: {
          include: {
            attributeValues: true,
          },
        },
      },
    });
    return {
      props: {
        hackathon,
      },
    };
  } else {
    return {
      props: {
        hackathon: null,
      },
    };
  }
}) satisfies GetServerSideProps<{
  hackathon: null | HackathonWithAttendees;
}>;
