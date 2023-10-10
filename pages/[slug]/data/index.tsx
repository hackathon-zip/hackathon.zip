import { css } from "@/components/CSS";
import type { GetServerSideProps } from "next";

import Debug from "@/components/Debug";
import EditableValue from "@/components/EditableValue";
import { Form } from "@/components/Form";
import HackathonLayout from "@/components/layouts/organizer/OrganizerLayout";
import useViewport from "@/hooks/useViewport";
import prisma from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { Button, Card, Drawer, Grid, Page, Table, Text, useToasts } from "@geist-ui/core";
import { Edit3, Plus } from "@geist-ui/react-icons";
import type {
  Attendee,
  AttendeeAttribute,
  AttendeeAttributeValue,
  Hackathon
} from "@prisma/client";
import { useRouter } from "next/router";
import type { ReactElement } from "react";
import { useState } from "react";

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

class DrawerData {
  #setIsOpen: (isOpen: boolean) => void;
  #setAttendee: (attendee: AttendeeWithAttributes) => void;
  isOpen: boolean;
  attendee?: AttendeeWithAttributes | undefined;

  constructor({
    isOpen,
    attendee,
    setIsOpen,
    setAttendee
  }: {
    isOpen: boolean;
    attendee: AttendeeWithAttributes | undefined;
    setIsOpen: (isOpen: boolean) => void;
    setAttendee: (attendee: AttendeeWithAttributes) => void;
  }) {
    this.isOpen = isOpen;
    this.attendee = attendee;

    this.#setIsOpen = setIsOpen;
    this.#setAttendee = setAttendee;
  }

  open () {
    this.#setIsOpen(true);
  }

  close () {
    this.#setIsOpen(false);
  }

  setAttendee (attendee: AttendeeWithAttributes) {
    this.#setAttendee(attendee);
  }

  clearAttendee () {
    this.#setAttendee(undefined as any);
  }
}

function useDrawer(): DrawerData {
  const [isOpen, setIsOpen] = useState(false);
  const [attendee, setAttendee] = useState<AttendeeWithAttributes | undefined>(undefined);

  return new DrawerData({
    isOpen,
    attendee,
    setIsOpen,
    setAttendee
  });
}

function EditDrawer({
  drawer,
  attendeeAttributes,
  hackathon,
  setStatefulData,
  generateData,
  attendees
}: {
  drawer: DrawerData;
  attendeeAttributes: AttendeeAttribute[];
  hackathon: Hackathon | HackathonWithAttendees;
  setStatefulData: (data: any) => void;
  generateData: (attendees: AttendeeWithAttributes[]) => any;
  attendees: AttendeeWithAttributes[];
}) {
  const { attendee, isOpen } = drawer;
  const { setToast } = useToasts();

  const router = useRouter();

  return (

    <Drawer
    visible={isOpen}
    onClose={() =>
      drawer.close()
    }
    placement="right"
    style={{ maxWidth: "500px" }}
  >
    <Drawer.Content>
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '16px',
      }}>
        <Text h3 my={0}>
          {attendee?.id == "create" ? "New Attendee" : attendee?.name}
        </Text>
        <a style={{
          cursor: 'pointer',
          color: '#666',
          display: 'flex',
        }}>
          <Edit3 />
        </a>
      </div>



      <Grid.Container gap={2} mb={1} justify="space-between">
        {builtInAttributes.filter(x => x.id != "built-in" && x.name !== "Name").map(attribute => (
          <Grid xs={12}>
            <EditableValue name={attribute.name} initialValue={attendee ? (attendee as any)[attribute.id] : ""} save={async value => {
            }} />
          </Grid>
        ))}
      </Grid.Container>

      <Grid.Container gap={2} mb={1} justify="space-between">
        {attendeeAttributes.map(attribute => (
          <Grid xs={12}>
            <EditableValue name={attribute.name} initialValue={attendee?.attributeValues.filter(x => x.formFieldId == attribute.id)[0]?.value || ""} save={async value => {
              const { id } = attribute;

              const response = await fetch(
              `/api/hackathons/${hackathon.slug}/data/${attendee?.id}/attributes/update`,
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json"
                  },
                  body: JSON.stringify({
                    attributeId: id,
                    attendeeId: attendee?.id,
                    value
                  })
                }
              ).then((r) => r.json());

              const newAttendee = {
                ...drawer.attendee as any,
                attributeValues: [
                  ...drawer.attendee?.attributeValues.filter(x => x.formFieldId != id) || [],
                  {
                    attendeeId: attendee?.id,
                    formFieldId: id,
                    value
                  }
                ]
              };

              drawer.setAttendee(newAttendee);
              
              router.reload(); // Temporary
              // TODO: Remove this and store updates in state
            }} />
          </Grid>
        ))}
      </Grid.Container>

      <Form
        schema={{
          elements: [
            ...(builtInAttributes
              .filter((x) => x.id != "built-in")
              .map((attribute) => ({
                type: "text",
                label: attribute.name,
                name: attribute.id,
                defaultValue: attendee
                  ? (attendee as any)[attribute.id]
                  : ""
              })) as any),
            ...(attendeeAttributes.map((attribute) => ({
              type: "text",
              label: attribute.name,
              name: `custom-${attribute.id}`,
              defaultValue:
                attendee?.attributeValues.filter(
                  (x) => x.formFieldId == attribute.id
                )[0]?.value || ""
            })) as any)
          ],
          submitText:
            attendee?.id == "create"
              ? `Create New Attendee`
              : `Update ${attendee?.name}'s Record`
        }}
        submission={{
          type: "controlled",
          onSubmit: async (data) => {
            let res = await fetch(
              attendee?.id == "create"
                ? `/api/hackathons/${hackathon.slug}/data/create`
                : `/api/hackathons/${hackathon.slug}/data/${attendee?.id}/update`,
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
                text: `Succesfully ${attendee?.id == "create" ? "created" : "updated"
                  } ${res.attendee.name}'s record.`,
                delay: 2000
              });
              // setStatefulData(
              //   generateData([
              //     ...attendees.map((a) =>
              //       a.id != res.attendee.id ? a : res.attendee
              //     )
              //   ])
              // );
              drawer.setAttendee(attendee as any);
              drawer.close();
            }
          }
        }}
      />
      <Debug data={{ attendee }} />
    </Drawer.Content>
  </Drawer>
  )
}


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

  const drawer = useDrawer();

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
        <EditDrawer drawer={drawer} attendeeAttributes={attributes} hackathon={hackathon} {...{
          generateData,
          setStatefulData,
          attendees
        }} />
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
            if (e.$i === undefined) {
              drawer.open();
              drawer.setAttendee({
                id: "create",
                name: "",
                email: "",
                hackathonId: "",
                checkedIn: false,
                createdAt: new Date(),
                checkInKey: "",
                attributeValues: []
              });
            }
            const attendee = attendees[e.$i];

            drawer.open();
            drawer.setAttendee(attendee);
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
  
  const properties = (attribute: AttendeeAttribute) => {
    return [
      {
        type: "text",
        miniLabel: "Property Name:",
        label: attribute.name, // @ts-ignore
        name: `custom-${attribute.id}-name`,
        mt: 2,
        mb: 0.5,
        defaultValue: attribute["name"]
      },
      {
        type: "select",
        options: ["text", "select"],
        miniLabel: "Property Type:",
        name: `custom-${attribute.id}-type`,
        mb: 0.3, // @ts-ignore
        defaultValue: attribute["type"]
      },
      {
        type: "select",
        multipleSelect: true,
        options: [],
        miniLabel: "Available Options:",
        name: `custom-${attribute.id}-options`,
        disabled: true,
        useValuesAsOptions: true,
        mt: 0.5,
        mb: 0.1, // @ts-ignore
        defaultValue: [...attribute["options"]],
        visible: (data: { [key: string]: { value: string } }) => {
          return data[`custom-${attribute.id}-type`].value === "select"
        }
      },
      {
        type: "text",
        name: `custom-${attribute.id}-add-option`,
        mb: 0.5, // @ts-ignore
        visible: (data: { [key: string]: { value: string } }) => {
          return data[`custom-${attribute.id}-type`].value === "select"
        },
        placeholder: "Add an option...",
        onKeyup: (event: any, updateValue: any, getValue: any) => {
          if (event.key === "Enter") {
            event.preventDefault();
            let toAdd = getValue(`custom-${attribute.id}-add-option`)
            updateValue(
              `custom-${attribute.id}-options`, 
              [...getValue(`custom-${attribute.id}-options`).filter((x: any) => x != toAdd), toAdd]
            )
            updateValue(
              `custom-${attribute.id}-add-option`, 
              ``
            )
          }
        }
      }
    ]
  }
  
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
          style={{ width: "500px" }}
        >
          <Drawer.Content>
            <Text h3>Edit Schema</Text>
            <Form
              schema={{
                elements: [
                  ...(hackathon.attendeeAttributes.map((attribute) => properties(attribute)).flat())
                ] as any,
                submitText: `Edit Schema`
              }}
              gap={1}
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
      {css`
          .select.multiple .icon{
            display: none;
          }
          .select.multiple.active {
            border: 1px solid #eaeaea!important;
          }
          .select.multiple {
            cursor: default!important;
          }
          .select.multiple .option {
            cursor: default!important;
            color: black!important;
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
