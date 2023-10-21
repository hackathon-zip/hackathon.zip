import {
    Button,
    Modal,
    Page,
    Table,
    useModal,
    useToasts
} from "@geist-ui/core";
import { getServerSideProps as getServerSidePropsTemplate } from "../index";

import { Form } from "@/components/Form";
import HackathonLayout from "@/components/layouts/organizer/OrganizerLayout";
import FeatureInfo from "@/components/organizer/FeatureInfo";
import { formatPhoneNumber } from "@/lib/utils";
import { Package, Plus } from "@geist-ui/react-icons";
import type { Hackathon, Sponsor } from "@prisma/client";
import { useRef, useState, type ReactElement } from "react";

type HackathonWithSponsors = Hackathon & {
  sponsors: Sponsor[];
};

export default function Hackathon({
  hackathon
}: {
  hackathon: HackathonWithSponsors | null;
}): any {
  if (!hackathon) {
    return (
      <>
        <Page>404: Not Found!</Page>
      </>
    );
  }

  if (!hackathon.sponsorsEnabled) {
    return (
      <Page>
        <FeatureInfo
          featureKey="sponsorsEnabled"
          featureName="Sponsors"
          featureDescription={<>Find and manage sponsors for your hackathon.</>}
          featureIcon={Package}
          hackathonSlug={hackathon.slug}
        />
      </Page>
    );
  }

  const { visible, setVisible, bindings } = useModal();
  const formRef = useRef<HTMLFormElement>(null);
  const { setToast } = useToasts();

  const [sponsors, setSponsors] = useState(
    (hackathon.sponsors ?? []).map((s) => {
      return {
        name: s.name,
        website: s.website,
        contact: (
          <>
            {s.contactName} (
            <a href={`mailto:${s.contactEmail}`}>{s.contactEmail}</a>
            {s.contactPhone && (
              <>
                ,&nbsp;
                <a href={`tel:${s.contactPhone}`}>
                  {formatPhoneNumber(s.contactPhone)}
                </a>
              </>
            )}
            )
          </>
        ),
        amount: s.amountCash
          ? new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD"
            }).format(s.amountCash)
          : s.amountOther
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
          <h1>Sponsors</h1>

          <Button
            icon={<Plus />}
            type="success"
            auto
            onClick={() => setVisible(true)}
          >
            Add Sponsor
          </Button>

          <Modal {...bindings}>
            <Modal.Title>New Sponsor</Modal.Title>
            <Modal.Content>
              <Form
                schema={{
                  elements: [
                    {
                      type: "text",
                      label: "Name of sponsor",
                      name: "name",
                      placeholder: "Pied Piper",
                      required: true
                    },
                    {
                      type: "text",
                      label: "Website",
                      name: "website",
                      placeholder: "https://piedpiper.com",
                      required: true,
                      validate(value) {
                        const regex =
                          /^((https?|ftp|smtp):\/\/)?(www.)?[a-z0-9]+\.[a-z]+(\/[a-zA-Z0-9#]+\/?)*$/;
                        return regex.test(value);
                      }
                    },
                    {
                      type: "text",
                      label: "Contact name",
                      name: "contactName",
                      placeholder: "Richard Hendricks",
                      required: true
                    },
                    {
                      type: "email",
                      label: "Contact email",
                      name: "contactEmail",
                      placeholder: "richard@piedpiper.com"
                    },
                    {
                      type: "text",
                      label: "Contact phone number",
                      name: "contactPhone",
                      placeholder: "800-867-5309"
                    },
                    {
                      type: "number",
                      label: "Amount",
                      name: "amountCash",
                      placeholder: "10000",
                      required: true,
                      inlineLabel: "$"
                    }
                  ]
                }}
                submission={{
                  type: "controlled",
                  onSubmit: async (data) => {
                    let res = await fetch(
                      `/api/hackathons/${hackathon.slug}/features/sponsors`,
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
                      setSponsors((s) => [
                        ...s,
                        {
                          name: res.name,
                          website: res.website,
                          contact: (
                            <>
                              {res.contactName} (
                              <a href={`mailto:${res.contactEmail}`}>
                                {res.contactEmail}
                              </a>
                              {res.contactPhone && (
                                <>
                                  ,&nbsp;
                                  <a href={`tel:${res.contactPhone}`}>
                                    {formatPhoneNumber(res.contactPhone)}
                                  </a>
                                </>
                              )}
                              )
                            </>
                          ),
                          amount: res.amountCash
                            ? new Intl.NumberFormat("en-US", {
                                style: "currency",
                                currency: "USD"
                              }).format(res.amountCash)
                            : res.amountOther
                        }
                      ]);

                      setToast({
                        text: "Sponsor added!",
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

        <Table data={sponsors}>
          <Table.Column label="name" prop="name" />
          <Table.Column label="website" prop="website" />
          <Table.Column label="contact" prop="contact" />
          <Table.Column label="amount" prop="amount" />
        </Table>
      </Page>
    </>
  );
}

Hackathon.getLayout = function getLayout(page: ReactElement) {
  return <HackathonLayout>{page}</HackathonLayout>;
};

export const getServerSideProps = getServerSidePropsTemplate