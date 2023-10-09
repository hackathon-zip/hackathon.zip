import { css } from "@/components/CSS";
import Debug from "@/components/Debug";
import prisma from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import {
  Button,
  Card,
  Drawer,
  Page,
  Table,
  Text,
  useToasts,
  Grid
} from "@geist-ui/core";
import type { GetServerSideProps } from "next";
import { useState } from "react";

import { Form } from "@/components/Form";
import HackathonLayout from "@/components/layouts/organizer/OrganizerLayout";
import useViewport from "@/hooks/useViewport";
import { Plus } from "@geist-ui/react-icons";
import type {
  Attendee,
  AttendeeAttribute,
  AttendeeAttributeValue,
  Hackathon
} from "@prisma/client";
import type { ReactElement } from "react";

type AttendeeWithAttributes = Attendee & {
  attributeValues: AttendeeAttributeValue[];
};

type HackathonWithAttendees = Hackathon & {
  attendeeAttributes: AttendeeAttribute[];
  attendees: AttendeeWithAttributes[];
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
    attendee?: Attendee | AttendeeWithAttributes
  ) => JSX.Element | string;
};

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
    type: "Date m-d-y",
    name: "Registered At",
    id: "built-in",
    fromAttendee: (attendee: Attendee) =>
      new Date(attendee.createdAt).toLocaleDateString().split("/").join("-"),
    readOnly: true
  }
  /*{
    type: "checkbox",
    name: "Checked In",
    id: "built-in",
    fromAttendee: (attendee: Attendee) =>
      attendee.checkedIn ? "true" : "false",
    customRender: (value: string) => value,
    readOnly: true
  }*/
]; // these are separated that way we can use them when setting column settings

function Data({
  hackathon,
  attendees,
  attributes
}: {
  hackathon: HackathonWithAttendees;
  attendees: AttendeeWithAttributes[];
  attributes: AttendeeAttribute[];
}) {
  const { width } = useViewport(false);
  const sliceNum = Math.ceil((Math.max(width || 100_000, 1000) - 1000) / 350);
  const { setToast } = useToasts();

  const generateData = (attendees: AttendeeWithAttributes[]) =>
    attendees
      .sort(
        (a: AttendeeWithAttributes, b: AttendeeWithAttributes) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      )
      .map((attendee: AttendeeWithAttributes, i: number) => {
        const output: any = {
          $i: i,
          $attendee: attendee
        };

        for (const { name, fromAttendee } of builtInAttributes) {
          output[name] = fromAttendee(attendee);
        }

        for (const attribute of attributes) {
          const attributeId = attributes.find(
            (attribute_: AttendeeAttribute) => attribute_.name == attribute.name
          )?.id;

          const attendeeAttribute = attendee.attributeValues.find(
            (attributeValue: AttendeeAttributeValue) =>
              attributeValue.formFieldId == attributeId
          );

          output[attribute.name] = attendeeAttribute?.value || "";
        }

        return output;
      });

  const data = generateData(attendees);
  let createNew = (() => {
    const output: any = {};

    let first = true;

    for (const { name, fromAttendee } of builtInAttributes) {
      output[name] = first ? (
        <span
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}
        >
          <Plus size={20} />
          Create New Attendee
        </span>
      ) : (
        ""
      );
      first = false;
    }

    for (const attribute of attributes) {
      output[attribute.name] = "";
    }

    return output;
  })();

  type DrawerAttendeeTuple = [boolean, AttendeeWithAttributes | null];

  const [[drawerOpen, drawerAttendee], setDrawerAttendee] =
    useState<DrawerAttendeeTuple>([false, null]);

  const [statefulData_, setStatefulData] = useState(data);
  console.log({ statefulData_ });
  const statefulData = statefulData_.sort(
    (a: any, b: any) =>
      new Date(a.$attendee.createdAt).getTime() -
      new Date(b.$attendee.createdAt).getTime()
  );
  // const statefulData = statefulData_.sort((a: any, b: any)x => a.$attendee.createdAt - b.$attendee.createdAt);

  const renderActions = (value: any, rowData: any, rowIndex: any) => {
    const [loading, setLoading] = useState(false);
    return (
      <>
        {rowIndex != statefulData.length && (
          <Button
            type="error"
            loading={loading}
            auto
            scale={1 / 3}
            font="12px"
            onClick={async (event) => {
              event.stopPropagation();
              setLoading(true);
              let res = await fetch(
                `/api/hackathons/${hackathon.slug}/data/${rowData.Email}/delete`,
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json"
                  }
                }
              ).then((r) => r.json());
              setLoading(false);
              if (res.error) {
                setToast({ text: res.error, delay: 2000 });
              } else {
                setToast({
                  text: `Succesfully deleted ${rowData.Name}'s record.`,
                  delay: 2000
                });
                setStatefulData(
                  generateData([
                    ...attendees.filter((a) => a.email != rowData.Email)
                  ])
                );
              }
            }}
          >
            Delete
          </Button>
        )}
      </>
    );
  };

  return (
    width && (
      <>
        <Drawer
          visible={drawerOpen}
          onClose={() =>
            setDrawerAttendee(([_, attendee]: DrawerAttendeeTuple) => [
              false,
              attendee
            ])
          }
          placement="right"
          style={{ maxWidth: "500px" }}
        >
          <Drawer.Content>
            {drawerAttendee?.id == "create" && <Text h3>New Attendee</Text>}
            <Form
              schema={{
                elements: [
                  ...(builtInAttributes
                    .filter((x) => x.id != "built-in")
                    .map((attribute) => ({
                      type: "text",
                      label: attribute.name,
                      name: attribute.id,
                      defaultValue: drawerAttendee
                        ? (drawerAttendee as any)[attribute.id]
                        : ""
                    })) as any),
                  ...(attributes.map((attribute) => ({
                    type: "text",
                    label: attribute.name,
                    name: `custom-${attribute.id}`,
                    defaultValue:
                      drawerAttendee?.attributeValues.filter(
                        (x) => x.formFieldId == attribute.id
                      )[0]?.value || ""
                  })) as any)
                ],
                submitText:
                  drawerAttendee?.id == "create"
                    ? `Create New Attendee`
                    : `Update ${drawerAttendee?.name}'s Record`
              }}
              submission={{
                type: "controlled",
                onSubmit: async (data) => {
                  let res = await fetch(
                    drawerAttendee?.id == "create"
                      ? `/api/hackathons/${hackathon.slug}/data/create`
                      : `/api/hackathons/${hackathon.slug}/data/${drawerAttendee?.id}/update`,
                    {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json"
                      },
                      body: JSON.stringify({
                        ...data
                      })
                    }
                  ).then((r) => r.json());
                  if (res.error) {
                    setToast({ text: res.error, delay: 2000 });
                  } else {
                    setToast({
                      text: `Succesfully ${
                        drawerAttendee?.id == "create" ? "created" : "updated"
                      } ${res.attendee.name}'s record.`,
                      delay: 2000
                    });
                    setStatefulData(
                      generateData([
                        ...attendees.map((a) =>
                          a.id != res.attendee.id ? a : res.attendee
                        )
                      ])
                    );
                    setDrawerAttendee(([_, attendee]: DrawerAttendeeTuple) => [
                      false,
                      attendee
                    ]);
                  }
                }
              }}
            />
            <Debug data={{ drawerAttendee }} />
          </Drawer.Content>
        </Drawer>
        {css`
          .attendees-data-table {
            --table-font-size: calc(1 * 11pt) !important;
          }
          .attendees-data-table-row {
            cursor: pointer;
          }
          .attendees-data-table-row > td > div.cell {
            min-height: calc(2.525 * var(--table-font-size));
          }
        `}
        <Table
          className="attendees-data-table"
          data={[...statefulData, createNew]}
          rowClassName={() => "attendees-data-table-row"}
          onRow={(e) => {
            console.log(e, "@");
            if (e.$i === undefined)
              return setDrawerAttendee([
                true,
                {
                  id: "create",
                  name: "",
                  email: "",
                  hackathonId: "",
                  checkedIn: false,
                  createdAt: new Date(),
                  checkInKey: "",
                  attributeValues: []
                }
              ]);
            const attendee = attendees[e.$i];
            setDrawerAttendee([true, attendee]);
          }}
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
          {attributes
            .slice(0, sliceNum)
            .map((attribute: AttendeeAttribute, i: number) => (
              <Table.Column
                prop={attribute.name}
                label={attribute.name}
                key={attribute.name}
                className={`attendees-data-table-column-custom-${i}`}
              />
            ))}
          <Table.Column
            prop="operation"
            label="danger zone"
            render={renderActions}
            width={100}
          />
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
  const [drawerOpen, setDrawerOpen] = useState(false);
  return (
    <>
      <Page>
        <Grid.Container justify="space-between" alignItems="center" mb={1}>
          <h1>Attendees</h1>
          <Button type="success" onClick={() => setDrawerOpen(true)}>
            Edit Schema
          </Button>
        </Grid.Container>
        <Card
          style={{
            margin: "-16px"
          }}
        >
          <Data
            hackathon={hackathon}
            attendees={hackathon.attendees}
            attributes={hackathon.attendeeAttributes}
          />
        </Card>
        <Drawer
          visible={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          placement="right"
          style={{ maxWidth: "500px" }}
        >
          <Drawer.Content>
            <Text h3>Edit Schema</Text>
            <Form
              schema={{
                elements: [
                  ...(hackathon.attendeeAttributes.map((attribute) => ({
                    type: "text",
                    label: attribute.name,
                    name: `custom-${attribute.id}`,
                    defaultValue: ""
                  })) as any)
                ],
                submitText: `Edit Schema`
              }}
              submission={{
                type: "controlled",
                onSubmit: async (data) => {
                  return null;
                }
              }}
            />
          </Drawer.Content>
        </Drawer>
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
          },
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
