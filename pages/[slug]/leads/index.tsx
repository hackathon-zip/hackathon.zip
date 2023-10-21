import {
    Button,
    Modal,
    Page,
    Table,
    useModal,
    useToasts
} from "@geist-ui/core";

import { Form } from "@/components/Form";
import HackathonLayout from "@/components/layouts/organizer/OrganizerLayout";
import FeatureInfo from "@/components/organizer/FeatureInfo";
import { formatPhoneNumber } from "@/lib/utils";
import { Link, Plus } from "@geist-ui/react-icons";
import type { Hackathon, Lead } from "@prisma/client";
import { ReactElement, useRef, useState } from "react";
import { getServerSideProps as getServerSidePropsTemplate } from "../index";

type HackathonWithLeads = Hackathon & {
  leads: Lead[];
};

export default function Hackathon({
  hackathon
}: {
  hackathon: HackathonWithLeads | null;
}): any {
  if (!hackathon) {
    return (
      <>
        <Page>404: Not Found!</Page>
      </>
    );
  }

  if (!hackathon.leadsEnabled)
    return (
      <Page>
        <FeatureInfo
          featureKey="leadsEnabled"
          featureName="Leads"
          featureDescription={
            <>
              Manage leads for venues, sponsorships, and other
              hackathon&nbsp;resources.
            </>
          }
          featureIcon={Link}
          hackathonSlug={hackathon.slug}
        />
      </Page>
    );

  const { visible, setVisible, bindings } = useModal();
  const formRef = useRef<HTMLFormElement>(null);
  const { setToast } = useToasts();

  const [leads, setLeads] = useState(
    hackathon.leads.map((l) => {
      return {
        name: l.name,
        company: `${l.jobTitle ? `${l.jobTitle} at ` : ""}${l.company}`,
        contact: (
          <>
            {l.email && (
              <>
                <a href={`mailto:${l.email}`}>{l.email}</a>
                {l.phone && ","}&nbsp;
                {l.phone && (
                  <a href={`tel:${l.phone}`}>{formatPhoneNumber(l.phone)}</a>
                )}
              </>
            )}
          </>
        ),
        type: l.type
      };
    })
  );

  return (
    <>
      <Page>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}
        >
          <h1>Leads</h1>

          <Button
            icon={<Plus />}
            type="success"
            auto
            onClick={() => setVisible(true)}
          >
            Add Lead
          </Button>

          <Modal {...bindings}>
            <Modal.Title>New Lead</Modal.Title>
            <Modal.Content>
              <Form
                schema={{
                  elements: [
                    {
                      type: "text",
                      label: "Name of lead",
                      name: "name",
                      placeholder: "Richard Hendricks",
                      required: true
                    },
                    {
                      type: "text",
                      label: "Job Title",
                      name: "jobTitle",
                      placeholder: "CEO",
                      required: false
                    },
                    {
                      type: "text",
                      label: "Company Name",
                      name: "company",
                      placeholder: "Pied Piper",
                      required: true
                    },
                    {
                      type: "email",
                      label: "Lead email",
                      name: "email",
                      placeholder: "richard@piedpiper.com"
                    },
                    {
                      type: "text",
                      label: "Lead phone number",
                      name: "phone",
                      placeholder: "800-867-5309"
                    },
                    {
                      type: "select",
                      label: "Lead type",
                      name: "type",
                      options: ["Venue", "Sponsor", "Other"],
                      required: true,
                      placeholder: "Select a type"
                    }
                  ]
                }}
                submission={{
                  type: "controlled",
                  onSubmit: async (data) => {
                    let res = await fetch(
                      `/api/hackathons/${hackathon.slug}/features/leads`,
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
                      setToast({
                        text: `Error: ${res.error.name}`,
                        delay: 2000,
                        type: "error"
                      });
                    } else {
                      setLeads((l) => [
                        ...l,
                        {
                          name: res.name,
                          company: `${
                            res.jobTitle ? `${res.jobTitle} at ` : ""
                          }${res.company}`,
                          contact: (
                            <>
                              {res.email && (
                                <>
                                  <a href={`mailto:${res.email}`}>
                                    {res.email}
                                  </a>
                                  {res.phone && ","}&nbsp;
                                  {res.phone && (
                                    <a href={`tel:${res.phone}`}>
                                      {formatPhoneNumber(res.phone)}
                                    </a>
                                  )}
                                </>
                              )}
                            </>
                          ),
                          type: res.type
                        }
                      ]);

                      setToast({
                        text: "Lead added!",
                        delay: 2000,
                        type: "success"
                      });
                    }

                    setVisible(false);
                  }
                }}
                hideSubmit={true}
                ref={formRef}
              />
            </Modal.Content>
            <Modal.Action passive onClick={() => setVisible(false)}>
              Cancel
            </Modal.Action>
            <Modal.Action
              onClick={() => {
                formRef.current &&
                  formRef.current.dispatchEvent(
                    new Event("submit", { cancelable: true, bubbles: true })
                  );
              }}
            >
              Submit
            </Modal.Action>
          </Modal>
        </div>

        <Table data={leads}>
          <Table.Column label="name" prop="name" />
          <Table.Column label="company" prop="company" />
          <Table.Column label="contact" prop="contact" />
          <Table.Column label="type" prop="type" />
        </Table>
      </Page>
    </>
  );
}

Hackathon.getLayout = function getLayout(page: ReactElement) {
  return <HackathonLayout>{page}</HackathonLayout>;
};

export const getServerSideProps = getServerSidePropsTemplate