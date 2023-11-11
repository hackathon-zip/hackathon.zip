import { css } from "@/components/CSS";
import EditableValue, { EditableHeader } from "@/components/EditableValue";
import { Form } from "@/components/Form";
import HackathonLayout from "@/components/layouts/organizer/OrganizerLayout";
import FeatureInfo from "@/components/organizer/FeatureInfo";
import { Package } from "@geist-ui/react-icons";
import useViewport from "@/hooks/useViewport";
import { orderedSort, sl } from "@/lib/utils";
import {
  Button,
  Card,
  Drawer,
  Grid,
  Page,
  Table,
  Text,
  useToasts
} from "@geist-ui/core";
import { Plus, Trash2 } from "@geist-ui/react-icons";
import type {
  Project,
  ProjectAttribute,
  ProjectAttributeValue,
  Hackathon
} from "@prisma/client";
import md5 from "md5";
import { useRouter } from "next/router";
import type { ReactElement } from "react";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { getServerSideProps as getServerSidePropsTemplate } from "../index";

import type {
  ProjectWithAttributes,
  HackathonWithProjectsAndAttributes
} from "@/lib/dbTypes";

export type Column = {
  type: string;
  name: string;
  id: string;
  readOnly?: boolean;
};

export type BuiltInColumn = Column & {
  fromProject: (attendee: Project) => string;
  customRender?: (
    value: string,
    attendee?: Project | ProjectWithAttributes
  ) => JSX.Element | string;
};

const builtInAttributes: BuiltInColumn[] = [
  {
    type: "text",
    name: "Name",
    id: "name",
    fromProject: (project: Project) => project.name,
    readOnly: false
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
  #setProject: (project: ProjectWithAttributes) => void;
  isOpen: boolean;
  project?: ProjectWithAttributes | undefined;

  constructor({
    isOpen,
    project,
    setIsOpen,
    setProject
  }: {
    isOpen: boolean;
    project: ProjectWithAttributes | undefined;
    setIsOpen: (isOpen: boolean) => void;
    setProject: (project: ProjectWithAttributes) => void;
  }) {
    this.isOpen = isOpen;
    this.project = project;

    this.#setIsOpen = setIsOpen;
    this.#setProject = setProject;
  }

  open() {
    this.#setIsOpen(true);
  }

  close() {
    this.#setIsOpen(false);
  }

  setProject(attendee: ProjectWithAttributes) {
    this.#setProject(attendee);
  }

  clearAttendee() {
    this.#setProject(undefined as any);
  }
}

function useDrawer(): DrawerData {
  const [isOpen, setIsOpen] = useState(false);
  const [project, setProject] = useState<ProjectWithAttributes | undefined>(
    undefined
  );

  return new DrawerData({
    isOpen,
    project,
    setIsOpen,
    setProject
  });
}

function EditDrawer({
  drawer,
  projectAttributes,
  hackathon,
  setProjects,
  projects
}: {
  drawer: DrawerData;
  projectAttributes: ProjectAttribute[];
  hackathon: Hackathon | HackathonWithProjectsAndAttributes;
  setProjects: (projects: ProjectWithAttributes[]) => void;
  projects: ProjectWithAttributes[];
}) {
  const { project, isOpen } = drawer;
  const { setToast } = useToasts();

  const router = useRouter();

  return (
    <Drawer
      visible={isOpen}
      onClose={() => drawer.close()}
      placement="right"
      style={{ width: "min(500px, calc(100vw - 64px))" }}
    >
      <Drawer.Content>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: "12px",
            marginBottom: "16px"
          }}
        >
          <EditableHeader
            name="Name"
            initialValue={project?.name || ""}
            save={async (value) => {
              await fetch(
                `/api/hackathons/${hackathon.slug}/projects/${project?.id}/update`,
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json"
                  },
                  body: JSON.stringify({
                    name: value
                  })
                }
              );

              const newProject = {
                ...(drawer.project as any),
                name: value
              };

              drawer.setProject(newProject);

              setProjects([
                ...projects.filter((x) => x.id != project?.id),
                newProject
              ]);
            }}
          />
        </div>

        <Grid.Container gap={2} mb={1} justify="space-between">
          {builtInAttributes
            .filter((x) => x.id != "built-in" && x.name !== "Name")
            .map((attribute) => (
              <Grid xs={12}>
                <EditableValue
                  name={attribute.name}
                  initialValue={project ? (project as any)[attribute.id] : ""}
                  save={async (value) => {
                    await fetch(
                      `/api/hackathons/${hackathon.slug}/projects/${project?.id}/update`,
                      {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                          email: value
                        })
                      }
                    );

                    const newProject = {
                      ...(drawer.project as any)
                    };

                    drawer.setProject(newProject);

                    setProjects([
                      ...projects.filter((x) => x.id != project?.id),
                      newProject
                    ]);
                  }}
                />
              </Grid>
            ))}
        </Grid.Container>

        <Grid.Container gap={2} mb={1} justify="space-between">
          {projectAttributes.map((attribute) => (
            <Grid xs={12}>
              <EditableValue
                name={attribute.name}
                initialValue={
                  project?.attributeValues.filter(
                    (x) => x.attributeId == attribute.id
                  )[0]?.value || ""
                }
                save={async (value) => {
                  const { id } = attribute;

                  const response = await fetch(
                    `/api/hackathons/${hackathon.slug}/projects/${project?.id}/attributes/update`,
                    {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json"
                      },
                      body: JSON.stringify({
                        attributeId: id,
                        attendeeId: project?.id,
                        value
                      })
                    }
                  ).then((r) => r.json());

                  const newProject = {
                    ...(drawer.project as any),
                    attributeValues: [
                      ...(drawer.project?.attributeValues.filter(
                        (x) => x.attributeId != id
                      ) || []),
                      {
                        projectId: project?.id,
                        attributeId: id,
                        value
                      }
                    ]
                  };

                  drawer.setProject(newProject);

                  setProjects([
                    ...projects.filter((x) => x.id != project?.id),
                    newProject
                  ]);
                }}
              />
            </Grid>
          ))}
        </Grid.Container>
      </Drawer.Content>
    </Drawer>
  );
}

function Data({
  hackathon,
  projects: defaultProjects,
  attributes
}: {
  hackathon: HackathonWithProjectsAndAttributes;
  projects: ProjectWithAttributes[];
  attributes: ProjectAttribute[];
}) {
  const { width } = useViewport(false);
  const sliceNum = Math.ceil((Math.max(width || 100_000, 1000) - 1000) / 350);
  const { setToast } = useToasts();

  const [projects, setProjects] = useState(defaultProjects);

  console.log("Data table rendered!", { projects, attributes });

  const drawer = useDrawer();

  const sortedProjects = orderedSort(
    projects,
    (a: ProjectWithAttributes, b: ProjectWithAttributes) => {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    },
    (a: ProjectWithAttributes, b: ProjectWithAttributes) => {
      return a.name.localeCompare(b.name);
    },
    (a: ProjectWithAttributes, b: ProjectWithAttributes) => {
      const md5A = md5(JSON.stringify(a));
      const md5B = md5(JSON.stringify(b));

      return md5A.localeCompare(md5B);
    }
  );

  const tableData = sortedProjects.map(
    (project: ProjectWithAttributes, i: number) => {
      const output: any = {
        $i: i,
        $project: project
      };

      for (const { name, fromProject } of builtInAttributes) {
        output[name] = fromProject(project);
      }

      for (const attribute of attributes) {
        const attributeId = attributes.find(
          (attribute_: ProjectAttribute) => attribute_.name == attribute.name
        )?.id;

        const projectAttribute = project.attributeValues.find(
          (attributeValue: ProjectAttributeValue) =>
            attributeValue.attributeId == attributeId
        );

        output[attribute.name] = projectAttribute?.value || "";
      }

      return output;
    }
  );

  let createNew = (() => {
    const output: any = {};

    let first = true;

    for (const { name, fromProject } of builtInAttributes) {
      output[name] = first ? (
        <span
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}
        >
          <Plus size={20} />
          Create New Project
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

  const [stagedForDeletion, setStagedForDeletion] = useState<[string][]>([]);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const renderActions = (value: any, rowData: any, rowIndex: any) => {
    const [loading, setLoading] = useState(false);
    return (
      <>
        {rowIndex == tableData.length ? (
          stagedForDeletion.length > 0 && (
            <Button
              type="error"
              auto
              scale={1 / 3}
              font="12px"
              onClick={async (event) => {
                event.stopPropagation();

                setDeleteLoading(true);
                let res = await fetch(
                  `/api/hackathons/${hackathon.slug}/projects/delete`,
                  {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                      ids: stagedForDeletion
                    })
                  }
                ).then((r) => r.json());
                setDeleteLoading(false);
                if (res.error) {
                  setToast({ text: res.error, delay: 2000 });
                } else {
                  setToast({
                    text: `Succesfully deleted ${
                      stagedForDeletion.length
                    } record${stagedForDeletion.length == 1 ? "" : "s"}.`,
                    delay: 2000
                  });
                  // setStatefulData(
                  //   generateData([
                  //     ...attendees.filter((a) => a.email != rowData.Email)
                  //   ])
                  // );
                  setStagedForDeletion([]);
                  setProjects((a) =>
                    a.filter((x) => !stagedForDeletion.includes((x as any).id))
                  );
                }
              }}
            >
              Confirm
            </Button>
          )
        ) : (
          <Button
            type="error"
            loading={
              stagedForDeletion.includes(rowData.$project.id) && loading
            }
            auto
            scale={1 / 3}
            font="12px"
            className={
              stagedForDeletion.includes(rowData.$project.id)
                ? "staged-button"
                : ""
            }
            onClick={async (event) => {
              event.stopPropagation();

              setStagedForDeletion((old) => {
                if (old.includes(rowData.$project.id)) {
                  return old.filter((x) => x != rowData.$project.id);
                } else {
                  return [rowData.$project.id, ...stagedForDeletion];
                }
              });
            }}
          >
            {stagedForDeletion.includes(rowData.$project.id)
              ? "Staged"
              : "Delete"}
          </Button>
        )}
      </>
    );
  };

  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    width && (
      <>
        <EditDrawer
          drawer={drawer}
          projectAttributes={attributes}
          hackathon={hackathon}
          {...{
            setStatefulData: () => null as any,
            setProjects,
            projects
          }}
        />
        <Drawer
          visible={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          placement="right"
          style={{ maxWidth: "500px" }}
        >
          <Drawer.Content>
            <Text h3>New Project</Text>
            <Form
              schema={{
                elements: [
                  ...(builtInAttributes
                    .filter((x) => x.id != "built-in")
                    .map((attribute) => ({
                      type: "text",
                      label: attribute.name,
                      name: attribute.id,
                      defaultValue: ""
                    })) as any),
                  ...(attributes.map((attribute) => ({
                    type: "text",
                    label: attribute.name,
                    name: `custom-${attribute.id}`,
                    defaultValue: ""
                  })) as any)
                ],
                submitText: `Create New Project`
              }}
              submission={{
                type: "controlled",
                onSubmit: async (data) => {
                  let res = await fetch(
                    `/api/hackathons/${hackathon.slug}/projects/create`,
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
                      text: `Succesfully created ${res.project.name}'s record.`,
                      delay: 2000
                    });
                    setProjects([...projects, res.project]);
                    setDrawerOpen(false);
                  }
                }
              }}
            />
          </Drawer.Content>
        </Drawer>
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
          data={[...tableData, createNew]}
          rowClassName={() => "attendees-data-table-row"}
          onRow={(e) => {
            console.log(e, "@");
            if (e.$i === undefined) {
              return setDrawerOpen(true);
            }
            const project = projects[e.$i];

            drawer.open();
            drawer.setProject(project);
          }}
        >
          {builtInAttributes.map((column: BuiltInColumn) => (
            <Table.Column
              prop={column.name}
              label={column.name}
              render={
                column.customRender
                  ? (((value: string, _: unknown, index: number) => {
                      return column.customRender?.(value, projects[index]);
                    }) as any)
                  : undefined
              }
            />
          ))}
          {attributes
            .slice(0, sliceNum)
            .map((attribute: ProjectAttribute, i: number) => (
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

function DeleteButton({
  setValue,
  attributeName
}: {
  setValue: any;
  attributeName: string;
}) {
  return (
    <Button
      iconRight={<Trash2 />}
      auto
      scale={2 / 3}
      onClick={() => {
        setValue(attributeName, "deleted");
      }}
    />
  );
}

export default function Hackathon({
  hackathon
}: {
  hackathon: null | HackathonWithProjectsAndAttributes;
}): any {
  if (!hackathon) {
    return (
      <>
        <Page>404: Not Found!</Page>
      </>
    );
  }
  const [drawerOpen, setDrawerOpen] = useState(false);
  
  if (!hackathon.shipEnabled)
  return (
    <Page>
      <FeatureInfo
        featureKey="shipEnabled"
        featureName="Ship"
        featureDescription={
          <>
            Gather project submissions from hackers and manage&nbsp;judging.
          </>
        }
        featureIcon={Package}
        hackathonSlug={hackathon.slug}
      />
    </Page>
  );

  const properties = (attribute: ProjectAttribute) => {
    return [
      {
        type: "text",
        miniLabel: "Property Name:",
        label: attribute.name == "" ? attribute.id : attribute.name, // @ts-ignore
        name: `${attribute.id}_name`,
        mt: hackathon.projectAttributes[0]?.id == attribute.id ? 0.5 : 1.5,
        mb: 0.5,
        defaultValue: attribute["name"],
        visible: (data: { [key: string]: { value: string } }) => {
          return data[`${attribute.id}_name`]?.value != "deleted";
        },
        required: true
      },
      {
        type: "select",
        options: ["text", "select"],
        miniLabel: "Property Type:",
        name: `${attribute.id}_type`,
        mb: 0.3, // @ts-ignore
        defaultValue: attribute["type"],
        visible: (data: { [key: string]: { value: string } }) => {
          return data[`${attribute.id}_name`]?.value != "deleted";
        },
        required: true
      },
      {
        type: "select",
        multipleSelect: true,
        options: [],
        miniLabel: "Available Options:",
        name: `${attribute.id}_options`,
        disabled: true,
        useValuesAsOptions: true,
        mt: 0.5,
        mb: 0.1, // @ts-ignore
        defaultValue: [...attribute["options"]],
        visible: (data: { [key: string]: { value: string } }) => {
          return (
            data[`${attribute.id}_type`]?.value === "select" &&
            data[`${attribute.id}_name`]?.value != "deleted"
          );
        },
        required: true
      },
      {
        type: "text",
        name: `${attribute.id}_add-option`,
        mb: 0.5, // @ts-ignore
        visible: (data: { [key: string]: { value: string } }) => {
          return (
            data[`${attribute.id}_type`]?.value === "select" &&
            data[`${attribute.id}_name`]?.value != "deleted"
          );
        },
        placeholder: "Add an option...",
        onKeyup: (event: any, updateValue: any, getValue: any) => {
          if (event.key === "Enter") {
            event.preventDefault();
            let toAdd = getValue(`${attribute.id}_add-option`);
            let previousValues = Array.isArray(
              getValue(`${attribute.id}_options`)
            )
              ? getValue(`${attribute.id}_options`)
              : [];
            updateValue(`${attribute.id}_options`, [
              ...previousValues.filter((x: any) => x != toAdd),
              toAdd
            ]);
            updateValue(`${attribute.id}_add-option`, ``);
          }
        }
      }
    ];
  };

  const router = useRouter();

  const [schemaFormElements, setSchemaFormElements] = useState([
    ...hackathon.projectAttributes
      .map((attribute) => properties(attribute))
      .flat()
  ]);

  return (
    <>
      <Page>
        <Grid.Container justify="space-between" alignItems="center" mb={1}>
          <h1>Projects</h1>
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
            projects={hackathon.projects as any}
            attributes={hackathon.projectAttributes}
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
                elements: schemaFormElements as any,
                submitText: `Edit Schema`
              }}
              gap={1}
              buttonMt={16}
              additionalButtons={
                <Button
                  onClick={() => {
                    setSchemaFormElements([
                      ...schemaFormElements,
                      ...properties({
                        id: uuidv4(),
                        name: "",
                        type: "text",
                        options: [],
                        order: 1,
                        hackathonId: ""
                      })
                    ]);
                  }}
                >
                  Add A Field
                </Button>
              }
              submission={{
                type: "controlled",
                onSubmit: async (data) => {
                  let res = await fetch(
                    `/api/hackathons/${hackathon.slug}/projects/schema`,
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
                  router.reload();
                }
              }}
              AppendToLabel={DeleteButton}
            />
          </Drawer.Content>
        </Drawer>
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

export const getServerSideProps = getServerSidePropsTemplate;
