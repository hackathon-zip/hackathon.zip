import { css } from "@/components/CSS";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import {
  Button,
  Display,
  Image as GeistImage,
  Page,
  Text
} from "@geist-ui/core";
import { Github } from "@geist-ui/react-icons";
import Image from "next/image";
import Link from "next/link";

export default function Home(): any {
  return (
    <>
      <Page className="flex flex-col align-center justify-center">
        <div className="flex flex-col align-center justify-center gap-4 mt-4">
          <div>
            <Image
              src="/wordmark-light.svg"
              alt="Hackathon.zip"
              height={40}
              width={350}
            />
          </div>
          <Text marginTop={0} mb={0} b>
            A work-in-progress hackathon management system, built by and for
            hackathon organizers.
          </Text>

          <Display shadow mt={0.5} mb={0}>
            <GeistImage
              width="435px"
              src="https://cloud-p1yhi2i8t-hack-club-bot.vercel.app/0screenshot_2023-10-11_at_11.46.25___pm.png"
            />
          </Display>

          <SignedIn>
            <div className="flex flex-row gap-4">
              <Link href="/dashboard">
                <Button type="success">Dashboard</Button>
              </Link>
              <Link
                href="https://github.com/hackathon-zip/hackathon.zip"
                target="_blank"
              >
                <Button type="secondary-light" icon={<Github />} auto />
              </Link>
            </div>
          </SignedIn>

          <SignedOut>
            <div className="flex flex-row gap-4">
              <Link href="/sign-up/">
                <Button type="success" color="#fff">
                  Get Started
                </Button>
              </Link>
              <Link href="/sign-in/">
                {css`
                  .sign-in:not(:hover) {
                    border: 1px solid #555 !important;
                    color: #444 !important;
                  }
                `}
                <Button type="default" className="sign-in">
                  Sign In
                </Button>
              </Link>
              <Link
                href="https://github.com/hackathon-zip/hackathon.zip"
                target="_blank"
              >
                <Button type="secondary-light" icon={<Github />} auto />
              </Link>
            </div>
          </SignedOut>
        </div>
      </Page>
    </>
  );
}
