import { Grid, Page } from "@geist-ui/core";
import { getServerSideProps as getServerSidePropsTemplate } from "../index";

import Debug from "@/components/Debug";
import type { FormSchema } from "@/components/Form";
import { Form } from "@/components/Form";
import HackathonLayout from "@/components/layouts/organizer/OrganizerLayout";
import type {
  AttendeeAttribute,
  Hackathon,
  SignupFormField
} from "@prisma/client";
import type { ReactElement } from "react";
import { useState } from "react";

type AttendeeAttributeWithField = AttendeeAttribute & {
  signupFormField: SignupFormField | null;
};

type HackathonWithAttributes = Hackathon & {
  attendeeAttributes: AttendeeAttributeWithField[];
};

export default function Hackathon({
  hackathon
}: {
  hackathon: HackathonWithAttributes | null;
}): any {
  const defaultValue: FormSchema = {
    elements: [
      {
        type: "text",
        required: false,
        name: "name",
        label: "Hello"
      }
    ]
  };
  const [formJSON, setFormJSON] = useState<any>(defaultValue);

  if (!hackathon) {
    return (
      <>
        <Page>404: Not Found!</Page>
      </>
    );
  }

  const properties = (attribute: AttendeeAttributeWithField, i: number) => {
    return [
      {
        type: "checkbox",
        options: ["Display on form?"],
        label: attribute.name,
        name: `${attribute.id}_enabled_on_form`,
        defaultValue:
          attribute.signupFormField != null ? ["Display on form?"] : []
      },
      {
        type: "text",
        miniLabel: "Label:",
        name: `${attribute.id}_label`,
        mt: 1,
        mb: 0.5,
        defaultValue:
          attribute.signupFormField != null
            ? attribute.signupFormField.label
            : "",
        visible: (data: { [key: string]: { value: string[] } }) => {
          return data[`${attribute.id}_enabled_on_form`].value.includes(
            "Display on form?"
          );
        },
        required: true
      },
      {
        type: "textarea",
        miniLabel: "Description:",
        name: `${attribute.id}_description`,
        mt: 1,
        mb: 0.5,
        defaultValue:
          attribute.signupFormField != null
            ? attribute.signupFormField.description
            : "",
        visible: (data: { [key: string]: { value: string[] } }) => {
          return data[`${attribute.id}_enabled_on_form`].value.includes(
            "Display on form?"
          );
        }
      },
      {
        type: "text",
        miniLabel: "Placeholder:",
        name: `${attribute.id}_plaecholder`,
        mt: 1,
        mb: 0.5,
        defaultValue:
          attribute.signupFormField != null
            ? attribute.signupFormField.plaecholder
            : "",
        visible: (data: { [key: string]: { value: string[] } }) => {
          return data[`${attribute.id}_enabled_on_form`].value.includes(
            "Display on form?"
          );
        },
      },
      {
        type: "select",
        options: ["Initial", "Supplementary"],
        miniLabel: "Stage",
        name: `${attribute.id}_stage`,
        mb: 0.3, // @ts-ignore
        defaultValue: attribute.signupFormField != null
            ? hackathon.applicationsEnabled ? attribute.signupFormField.stage : "Initial"
            : "",
        visible: (data: { [key: string]: { value: string[] } }) => {
          return data[`${attribute.id}_enabled_on_form`].value.includes(
            "Display on form?"
          ) && hackathon.applicationsEnabled;
        },
        required: true
      }
    ];
  };

  const [formData, setFormData] = useState({});

  const generatePreviewFields = (data: any, stage: string) => {
    let object = (() => {
      let newData: any = {};
      Object.keys(formData).map((x) => {
        let id = x.split("_")[0];
        let property = x.split("_")[1];
        if (!newData[id]) {
          newData[id] = {
            attribute: hackathon.attendeeAttributes.filter((x) => x.id == id)[0]
          };
        }
        newData[id][property] = (formData as any)[x].value;
      });
      return newData;
    })();
    return Object.keys(object)
      .map((x) => ({
        ...object[x].attribute,
        ...object[x],
        label: object[x].label || object[x].attribute.name,
        placeholder: object[x].plaecholder,
        miniLabel: object[x].description,
        name: object[x].attribute.id,
        type: object[x].attribute.type,
        enabled: object[x].enabled.includes("Display on form?")
      }))
      .filter((x) => x.enabled && x.stage == stage);
  };

  return (
    <>
      <Page>
        <h2>Configure Your Registration {hackathon.applicationsEnabled && "/ Application"} Form</h2>
        <Grid.Container gap={2} justify="center">
          <Grid xs={!hackathon.applicationsEnabled ? 12 : 8}>
            <Form
              submission={{
                onSubmit: async (data) => {
                  let res = await fetch(
                    `/api/hackathons/${hackathon.slug}/data/form`,
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
                },
                type: "controlled"
              }}
              buttonMt={16}
              schema={{
                elements: hackathon.attendeeAttributes
                  .map((attribute, i) => properties(attribute, i))
                  .flat() as any
              }}
              setData={setFormData}
            />
          </Grid>
          <Grid xs={!hackathon.applicationsEnabled ? 12 : 8}>
            <iframe
              src={`/${hackathon?.slug}/register/form-preview/${encodeURIComponent(
                JSON.stringify({
                  elements: [
                    {
                      type: "text",
                      label: "Name",
                      name: "name",
                      placeholder: "Fiona Hackworth",
                      required: true
                    },
                    {
                      type: "email",
                      label: "Email",
                      name: "email",
                      placeholder: "fiona@hackathon.zip",
                      required: true
                    },
                    ...generatePreviewFields(formData, "Initial")
                  ]
                })
              )}`}
              width="100%"
              height="1000px"
              style={{
                border: "1px solid #333",
                borderRadius: "8px",
                padding: "16px",
                background: "#fff",
                marginTop: "24px"
              }}
            />
          </Grid>
          <Grid xs={!hackathon.applicationsEnabled ? 0 : 8}>
            <iframe
              src={`/${hackathon?.slug}/register/form-preview/${encodeURIComponent(
                JSON.stringify({
                  elements: [
                    ...generatePreviewFields(formData, "Supplementary")
                  ]
                })
              )}`}
              width="100%"
              height="1000px"
              style={{
                border: "1px solid #333",
                borderRadius: "8px",
                padding: "16px",
                background: "#fff",
                marginTop: "24px"
              }}
            />
          </Grid>
        </Grid.Container>
      </Page>
    </>
  );
}

Hackathon.getLayout = function getLayout(page: ReactElement) {
  return <HackathonLayout>{page}</HackathonLayout>;
};

export const getServerSideProps = getServerSidePropsTemplate;
