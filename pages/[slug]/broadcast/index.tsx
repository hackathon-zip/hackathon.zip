import { Button, Card, Link, Page, Text, Textarea } from "@geist-ui/core";

import HackathonLayout from "@/components/layouts/organizer/OrganizerLayout";
import FeatureInfo from "@/components/organizer/FeatureInfo";
import { Radio } from "@geist-ui/react-icons";
import type { Hackathon } from "@prisma/client";

import { css } from "@/components/CSS";
import { useDomId } from "@/hooks/useDomId";
import { useState } from "react";
import { getServerSideProps as getServerSidePropsTemplate } from "../index";

export default function Hackathon({
  hackathon
}: {
  hackathon: Hackathon | null;
}): any {
  if (!hackathon) {
    return (
      <>
        <Page>404: Not Found!</Page>
      </>
    );
  }

  if (!hackathon.broadcastEnabled)
    return (
      <Page>
        <FeatureInfo
          featureKey="broadcastEnabled"
          featureName="Broadcasts"
          featureDescription={
            <>
              Communicate with hackers in real-time about
              hackathon&nbsp;updates.
            </>
          }
          featureIcon={Radio}
          hackathonSlug={hackathon.slug}
        />
      </Page>
    );

  const [templateText, setTemplateText] = useState("Template");
  const textareaId = useDomId();

  return (
    <>
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          flexDirection: "row"
        }}
      >
        <div
          style={{
            display: "flex",
            height: "100%",
            flexDirection: "column",
            padding: "32px",
            borderRight: "1px solid #eaeaea",
            background: "#fcfcfc"
          }}
        >
          <Text
            font="13px"
            style={{
              letterSpacing: "1.3px",
              textTransform: "uppercase",
              color: "#888"
            }}
          >
            Templates
          </Text>

          {/* template #1 */}

          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              marginTop: "2px",
              marginBottom: "2px",
              minWidth: "220px",
              color: "#444"
            }}
          >
            <Link color>
              <Text
                font="16px"
                style={{
                  letterSpacing: "0.3px"
                }}
              >
                Template #1
              </Text>
            </Link>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              marginTop: "2px",
              marginBottom: "2px",
              minWidth: "220px",
              color: "#444"
            }}
          >
            <Link>
              <Text
                font="16px"
                style={{
                  letterSpacing: "0.3px"
                }}
              >
                Template #2
              </Text>
            </Link>
          </div>

          <Text
            font="13px"
            style={{
              letterSpacing: "1.3px",
              textTransform: "uppercase",
              color: "#888"
            }}
          >
            Broadcasts
          </Text>

          <Text
            font="13px"
            style={{
              letterSpacing: "1.3px",
              textTransform: "uppercase",
              color: "#888"
            }}
          >
            Settings
          </Text>
        </div>
        <div
          style={{
            display: "flex",
            height: "100%",
            flexDirection: "row",
            flexGrow: "1",
            overflow: "hidden"
          }}
        >
          <Page>
            <h2>Template #1</h2>
            <Card
              shadow
              style={{
                height: "calc(100%)"
              }}
            >
              <Card.Content
                style={{
                  height: "100%",
                  position: "relative"
                }}
              >
                {css`
                  .${textareaId} {
                    width: 100% !important;
                    height: 100% !important;
                    margin: -16px !important;
                    padding: 16px !important;
                    box-sizing: border-box !important;
                    border: none !important;
                  }

                  .${textareaId} textarea {
                    height: 100% !important;
                  }
                `}
                <Textarea
                  value={templateText}
                  onChange={(e) => setTemplateText(e.target.value)}
                  className={textareaId}
                />
                <div
                  style={{
                    position: "absolute",
                    bottom: "16px",
                    right: "0px",
                    padding: "16px",
                    display: "flex",
                    boxSizing: "border-box",
                    justifyContent: "flex-end",
                    gap: "16px"
                  }}
                >
                  <Button type="default" auto>
                    Preview
                  </Button>
                  <Button type="success" auto>
                    Save
                  </Button>
                </div>
              </Card.Content>
            </Card>
          </Page>
        </div>
      </div>
    </>
  );

  // return (
  //   <>
  //     <Page>
  //       <h1>Broadcast</h1>
  //       <h3>
  //         {hackathon.startDate &&
  //           new Date(hackathon.startDate).toLocaleString()}
  //         {" to "}
  //         {hackathon.endDate &&
  //           new Date(hackathon.endDate).toLocaleString()} at{" "}
  //         {hackathon?.location}
  //       </h3>
  //       <code>/{hackathon?.slug}</code>
  //     </Page>
  //   </>
  // );
}

Hackathon.getLayout = function getLayout(page: JSX.Element) {
  return <HackathonLayout>{page}</HackathonLayout>;
};

export const getServerSideProps = getServerSidePropsTemplate;
