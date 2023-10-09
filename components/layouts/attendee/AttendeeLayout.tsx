import { Form } from "@/components/Form";
import {
    Button,
    Card,
    Divider,
    Grid,
    Link,
    Modal,
    Text,
    useModal,
    useToasts
} from "@geist-ui/core";
import type { Attendee, Hackathon } from "@prisma/client";
import Head from "next/head";
import { useRouter } from "next/router";
import { useRef } from "react";

export default function AttendeeLayout({
  children,
  hackathon,
  attendee
}: {
  children: React.ReactNode;
  hackathon: Hackathon | null;
  attendee: Attendee | null;
}) {
  const { setToast } = useToasts();
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const transformURL = (path: string) =>
    router.asPath.startsWith("/attendee/")
      ? `/attendee/${hackathon?.slug}${path}`
      : path;
  const transformAPIURL = (path: string) =>
    router.asPath.startsWith("/attendee/")
      ? `/api/attendee/${hackathon?.slug}${path}`
      : `/api/${path}`;
  const { visible, setVisible, bindings } = useModal();
  return (
    <>
      <Head>
        <title>{hackathon?.name}</title>
      </Head>
      <Modal {...bindings}>
        <Modal.Content>
          <Form
            schema={{
              elements: [
                {
                  type: "email",
                  label: "Sign In With Email",
                  name: "email",
                  placeholder: "fiona@hackathon.zip",
                  required: true
                }
              ]
            }}
            submission={{
              type: "controlled",
              onSubmit: async (data) => {
                let res = await fetch(transformAPIURL("/sign-in"), {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json"
                  },
                  body: JSON.stringify({
                    ...data
                  })
                }).then((r) => r.json());
                if (res.error) {
                  setToast({ text: res.error, delay: 2000 });
                } else {
                  setToast({
                    text: "Please check your email for a magic URL, thanks!",
                    delay: 2000
                  });
                  setVisible(false);
                }
              }
            }}
            hideSubmit={false}
            ref={formRef}
            additionalButtons={
              <Button style={{ flexGrow: 1 }} onClick={() => setVisible(false)}>
                Cancel
              </Button>
            }
          />
        </Modal.Content>
      </Modal>
      <Grid.Container gap={4} justify="center" style={{ padding: "2rem" }}>
        <Grid xs={6}>
          <div style={{ width: "100%", position: "relative" }}>
            <Card style={{ overflow: "hidden" }}>
              <div
                style={{
                  backgroundImage:
                    "linear-gradient(rgba(0,0,0,0.25), rgba(0,0,0,0.5)), url(https://pbs.twimg.com/media/FZmKOGwUcAApTR7.jpg)",
                  minHeight: "100px",
                  padding: "16px",
                  backgroundSize: "cover",
                  backgroundPosition: "center"
                }}
              >
                <Text
                  h3
                  b
                  style={{
                    color: "white",
                    fontWeight: "800"
                  }}
                >
                  {hackathon?.name}
                </Text>
              </div>
              {attendee && (
                <>
                  <Card.Content>
                    <Text b my={0}>
                      <Link color underline href={transformURL("/")}>
                        Dashboard
                      </Link>
                    </Text>
                  </Card.Content>
                  <Divider h="1px" my={0} />
                </>
              )}
              {!attendee && (
                <>
                  <Card.Content>
                    <Text b my={0}>
                      <Link color underline href={transformURL("/register")}>
                        Register
                      </Link>
                    </Text>
                  </Card.Content>
                  <Divider h="1px" my={0} />
                </>
              )}
              {attendee && (
                <>
                  <Card.Content>
                    <Text b my={0}>
                      <Link color underline href={transformURL("/ship")}>
                        Ship
                      </Link>
                    </Text>
                  </Card.Content>
                  <Divider h="1px" my={0} />
                </>
              )}
              {attendee && (
                <>
                  <Card.Content>
                    <Text b my={0}>
                      <Link color underline href={transformAPIURL("/sign-out")}>
                        Sign Out
                      </Link>
                    </Text>
                  </Card.Content>
                  <Divider h="1px" my={0} />
                </>
              )}
              <Card.Content>
                {attendee ? (
                  <>Signed in as {attendee?.name}.</>
                ) : (
                  <Text b my={0}>
                    <Link
                      href="#login"
                      color
                      underline
                      onClick={() => setVisible(true)}
                    >
                      Sign In
                    </Link>
                  </Text>
                )}
              </Card.Content>
            </Card>
          </div>
        </Grid>
        <Grid xs>{children}</Grid>
      </Grid.Container>
    </>
  );
}
