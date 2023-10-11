import prisma from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import {
    Page
} from "@geist-ui/core";
import type { GetServerSideProps } from "next";

import Debug from "@/components/Debug";
import type { FormSchema } from "@/components/Form";
import HackathonLayout from "@/components/layouts/organizer/OrganizerLayout";
import type { AttendeeAttribute, Hackathon } from "@prisma/client";
import type { ReactElement } from "react";
import { useState } from "react";

type HackathonWithAttributes = Hackathon & {
  attendeeAttributes: AttendeeAttribute[];
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

  const properties = (attribute: AttendeeAttribute) => {
    return [
      {
        type: "text",
        miniLabel: "Property Name:",
        label: attribute.name == "" ? attribute.id : attribute.name, // @ts-ignore
        name: `${attribute.id}_name`,
        mt: hackathon.attendeeAttributes[0].id == attribute.id ? 0.5 :  1.5,
        mb: 0.5,
        defaultValue: attribute["name"],
        visible: (data: { [key: string]: { value: string } }) => {
          return  data[`${attribute.id}_name`]?.value != "deleted"
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
          return  data[`${attribute.id}_name`]?.value != "deleted"
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
          return data[`${attribute.id}_type`]?.value === "select" && data[`${attribute.id}_name`]?.value != "deleted"
        },
        required: true
      },
      {
        type: "text",
        name: `${attribute.id}_add-option`,
        mb: 0.5, // @ts-ignore
        visible: (data: { [key: string]: { value: string } }) => {
          return data[`${attribute.id}_type`]?.value === "select" && data[`${attribute.id}_name`]?.value != "deleted"
        },
        placeholder: "Add an option...",
        onKeyup: (event: any, updateValue: any, getValue: any) => {
          if (event.key === "Enter") {
            event.preventDefault();
            let toAdd = getValue(`${attribute.id}_add-option`)
            let previousValues = Array.isArray(getValue(`${attribute.id}_options`)) ?  getValue(`${attribute.id}_options`) : []
            updateValue(
              `${attribute.id}_options`, 
              [...previousValues.filter((x: any) => x != toAdd), toAdd]
            )
            updateValue(
              `${attribute.id}_add-option`, 
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
        <h1>Register</h1>
        <h3>
          {hackathon.startDate &&
            new Date(hackathon.startDate).toLocaleString()}
          {" to "}
          {hackathon.endDate &&
            new Date(hackathon.endDate).toLocaleString()} at{" "}
          {hackathon?.location}
        </h3>

        <code>/{hackathon?.slug}</code>

        <iframe
          src={`/${hackathon?.slug}/register/form-preview/${encodeURIComponent(
            JSON.stringify({
              elements: [
                {
                  type: "text",
                  required: false,
                  name: "name",
                  label: "Hello"
                }
              ]
            })
          )}`}
          width="100%"
          height="1000px"
        />

        <Debug data={{ formJSON }} />
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
        attendeeAttributes: true
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
  hackathon: Hackathon | null;
}>;
