import {
  Grid,
  Card,
  Text,
  Divider,
  Link,
  useModal,
  Modal,
  Input,
} from "@geist-ui/core";
import { useRef } from "react";
import NextLink from "next/link";
import type { Hackathon } from "@prisma/client";
import { useRouter } from "next/router";
import Head from "next/head";
import { Form } from "@/components/Form";

export default function AttendeeLayout({
  children,
  hackathon,
}: {
  children: React.ReactNode;
  hackathon: Hackathon | null;
}) {
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
        <Modal.Title>Enter Your Email</Modal.Title>
        <Modal.Content>
          <Form
            schema={{
              elements: [
                {
                  type: "email",
                  label: "Email",
                  name: "email",
                  placeholder: "fiona@hackathon.zip",
                  required: true,
                },
              ],
            }}
            submission={{
              type: "request",
              method: "POST",
              action: transformAPIURL("/sign-in"),
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
            formRef.current.submit();
          }}
        >
          Sign In
        </Modal.Action>
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
                  backgroundPosition: "center",
                }}
              >
                <Text
                  h3
                  b
                  style={{
                    color: "white",
                    fontWeight: "800",
                  }}
                >
                  {hackathon?.name}
                </Text>
              </div>
              <Card.Content>
                <Text b my={0}>
                  <Link color underline href={transformURL("/")}>
                    Home
                  </Link>
                </Text>
              </Card.Content>
              <Divider h="1px" my={0} />
              <Card.Content>
                <Text b my={0}>
                  <Link color underline href={transformURL("/register")}>
                    Register
                  </Link>
                </Text>
              </Card.Content>
              <Divider h="1px" my={0} />
              <Card.Content>
                <Text b my={0}>
                  <Link color underline href={transformURL("/schedule")}>
                    Schedule
                  </Link>
                </Text>
              </Card.Content>
              <Divider h="1px" my={0} />
              <Card.Content>
                <Text b my={0}>
                  <Link color underline href={transformURL("/ship")}>
                    Ship
                  </Link>
                </Text>
              </Card.Content>
              <Divider h="1px" my={0} />
              <Card.Content>
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
              </Card.Content>
            </Card>
          </div>
        </Grid>
        <Grid xs>{children}</Grid>
      </Grid.Container>
    </>
  );
}
