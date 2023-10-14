import { css } from "@/components/CSS";
import useDeviceId from "@/hooks/useDeviceId";
import { useDomId } from "@/hooks/useDomId";
import useNavigation, { NavigationProvider } from "@/hooks/useNavigation";
import { Button as GeistButton, Text } from "@geist-ui/core";
import { Settings } from "@geist-ui/react-icons";
import Head from "next/head";
import Image from "next/image";
import { MouseEvent, useEffect } from "react";

const scrollable = {
  onTouchMove: function (e: any) {
    e.stopPropagation();
    e.stopImmediatePropagation();
  }
};

function Layout({ children, basic }: { basic?: boolean; children: any }) {
  const deviceId = useDeviceId();

  useEffect(() => {
    const el = document.body;
    el.addEventListener("touchstart", function () {
      var top = el.scrollTop,
        totalScroll = el.scrollHeight,
        currentScroll = top + el.offsetHeight;

      //If we're at the top or the bottom of the containers
      //scroll, push up or down one pixel.
      //
      //this prevents the scroll from "passing through" to
      //the body.
      if (top === 0) {
        el.scrollTop = 1;
      } else if (currentScroll === totalScroll) {
        el.scrollTop = top - 1;
      }
    });

    el.addEventListener("touchmove", function (evt) {
      //if the content is actually scrollable, i.e. the content is long enough
      //that scrolling can occur
      if (el.offsetHeight < el.scrollHeight) (evt as any)._isScroller = true;
    });

    document.body.addEventListener(
      "touchmove",
      function (evt: any) {
        //In this case, the default behavior is scrolling the body, which
        //would result in an overflow.  Since we don't want that, we preventDefault.
        if (!evt._isScroller) {
          evt.preventDefault();
        }
      },
      { passive: false }
    );
  }, []);

  return (
    <>
      <Head>
        <meta
          name="viewport"
          content="width=device-width,height=device-height,user-scalable=no,initial-scale=1.0,maximum-scale=1.0,minimum-scale=1.0"
        />
      </Head>
      {css`
        html,
        body,
        .base-element {
          width: 100vw;
          height: 100vh;
          box-sizing: border-box !important;
          user-select: none;
        }
        @font-face {
          font-family: sofiapro;
          src: url(https://envoy-fonts.s3.amazonaws.com/sofia-pro/3AF984_1_0.eot);
          src:
            url(https://envoy-fonts.s3.amazonaws.com/sofia-pro/3AF984_1_0.eot?#iefix)
              format("embedded-opentype"),
            url(https://envoy-fonts.s3.amazonaws.com/sofia-pro/3AF984_1_0.woff2)
              format("woff2"),
            url(https://envoy-fonts.s3.amazonaws.com/sofia-pro/3AF984_1_0.woff)
              format("woff"),
            url(https://envoy-fonts.s3.amazonaws.com/sofia-pro/3AF984_1_0.ttf)
              format("truetype");
          font-weight: 700;
          font-style: normal;
          font-display: swap;
        }

        @font-face {
          font-family: sofiapro;
          src: url(https://envoy-fonts.s3.amazonaws.com/sofia-pro/3AF984_5_0.eot);
          src:
            url(https://envoy-fonts.s3.amazonaws.com/sofia-pro/3AF984_5_0.eot?#iefix)
              format("embedded-opentype"),
            url(https://envoy-fonts.s3.amazonaws.com/sofia-pro/3AF984_5_0.woff2)
              format("woff2"),
            url(https://envoy-fonts.s3.amazonaws.com/sofia-pro/3AF984_5_0.woff)
              format("woff"),
            url(https://envoy-fonts.s3.amazonaws.com/sofia-pro/3AF984_5_0.ttf)
              format("truetype");
          font-weight: 800;
          font-style: normal;
          font-display: swap;
        }

        @font-face {
          font-family: sofiapro;
          src: url(https://envoy-fonts.s3.amazonaws.com/sofia-pro/3AF984_6_0.eot);
          src:
            url(https://envoy-fonts.s3.amazonaws.com/sofia-pro/3AF984_6_0.eot?#iefix)
              format("embedded-opentype"),
            url(https://envoy-fonts.s3.amazonaws.com/sofia-pro/3AF984_6_0.woff2)
              format("woff2"),
            url(https://envoy-fonts.s3.amazonaws.com/sofia-pro/3AF984_6_0.woff)
              format("woff"),
            url(https://envoy-fonts.s3.amazonaws.com/sofia-pro/3AF984_6_0.ttf)
              format("truetype");
          font-weight: 300;
          font-style: normal;
          font-display: swap;
        }

        @font-face {
          font-family: sofiapro;
          src: url(https://envoy-fonts.s3.amazonaws.com/sofia-pro/3AF984_7_0.eot);
          src:
            url(https://envoy-fonts.s3.amazonaws.com/sofia-pro/3AF984_7_0.eot?#iefix)
              format("embedded-opentype"),
            url(https://envoy-fonts.s3.amazonaws.com/sofia-pro/3AF984_7_0.woff2)
              format("woff2"),
            url(https://envoy-fonts.s3.amazonaws.com/sofia-pro/3AF984_7_0.woff)
              format("woff"),
            url(https://envoy-fonts.s3.amazonaws.com/sofia-pro/3AF984_7_0.ttf)
              format("truetype");
          font-weight: 500;
          font-style: normal;
          font-display: swap;
        }

        @font-face {
          font-family: sofiapro;
          src: url(https://envoy-fonts.s3.amazonaws.com/sofia-pro/3AF984_A_0.eot);
          src:
            url(https://envoy-fonts.s3.amazonaws.com/sofia-pro/3AF984_A_0.eot?#iefix)
              format("embedded-opentype"),
            url(https://envoy-fonts.s3.amazonaws.com/sofia-pro/3AF984_A_0.woff2)
              format("woff2"),
            url(https://envoy-fonts.s3.amazonaws.com/sofia-pro/3AF984_A_0.woff)
              format("woff"),
            url(https://envoy-fonts.s3.amazonaws.com/sofia-pro/3AF984_A_0.ttf)
              format("truetype");
          font-weight: 400;
          font-style: normal;
          font-display: swap;
        }

        @font-face {
          font-family: sofiapro;
          src: url(https://envoy-fonts.s3.amazonaws.com/sofia-pro/3AF984_C_0.eot);
          src:
            url(https://envoy-fonts.s3.amazonaws.com/sofia-pro/3AF984_C_0.eot?#iefix)
              format("embedded-opentype"),
            url(https://envoy-fonts.s3.amazonaws.com/sofia-pro/3AF984_C_0.woff2)
              format("woff2"),
            url(https://envoy-fonts.s3.amazonaws.com/sofia-pro/3AF984_C_0.woff)
              format("woff"),
            url(https://envoy-fonts.s3.amazonaws.com/sofia-pro/3AF984_C_0.ttf)
              format("truetype");
          font-weight: 600;
          font-style: normal;
          font-display: swap;
        }

        * {
          font-family: sofiapro !important;
        }
      `}
      <div
        className="base-element"
        style={{
          width: "100vw",
          height: "100svh",
          background: "white",
          margin: "0px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        {children}
        {!basic && (
          <div
            style={{
              position: "absolute",
              bottom: "20px",
              left: "20px",
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              gap: "10px"
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start"
              }}
            >
              <Text h5 my={0}>
                Device ID
              </Text>
              <Text
                style={{
                  fontSize: "12px"
                }}
                mb={0}
                mt="-2px"
              >
                {deviceId}
              </Text>
            </div>
            <GeistButton
              onClick={() => location.reload()}
              icon={<Settings />}
              auto
            >
              Settings
            </GeistButton>
          </div>
        )}
      </div>
    </>
  );
}

function Flex({
  column,
  row,
  alignItems,
  justifyContent,
  children,
  grow,
  gap
}: {
  column?: boolean;
  row?: boolean;
  alignItems?: string;
  justifyContent?: string;
  children?: any;
  grow?: string;
  gap?: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: column ? "column" : row ? "row" : undefined,
        alignItems,
        justifyContent,
        flexGrow: grow,
        gap
      }}
    >
      {children}
    </div>
  );
}

function Button({
  children,
  onClick
}: {
  children?: any;
  onClick?: (e: MouseEvent<HTMLButtonElement>) => any;
}) {
  const className = useDomId("ipad-button");

  return (
    <>
      {css`
        .${className} {
          color: white;
          background-color: #4e597c;
          font-size: 25px;
          font-weight: 400;
          padding: 22px 48px 18px 48px;
          border-radius: 6px;
          box-shadow: 0px 4px 8px #4e597c22;
          border: none;
          transition: transform 0.15s ease-in-out;
          cursor: pointer;
        }
        .${className}:hover:not(:focus) {
          transform: scale(0.9);
        }
      `}
      <button
        className={className}
        onClick={(e) => {
          // (e.target as any).focusss();
          window.blur();
          onClick?.(e);
        }}
      >
        {children}
      </button>
    </>
  );
}

function LinkCode() {
  return (
    <>
      <Text
        h1
        font="sofiapro"
        style={{
          fontSize: "140px",
          color: "#1f2d3d",
          fontWeight: "600"
        }}
        my={0}
      >
        ABC DEF
      </Text>

      <Text
        h3
        font="sofiapro"
        mt={-1}
        style={{
          color: "#8492a6",
          fontWeight: 400,
          maxWidth: "42vw",
          textAlign: "center",
          fontSize: "22px"
        }}
      >
        Go to hackathon.zip/link on your computer to connect this iPad to your
        event.
      </Text>
    </>
  );
}

function Home() {
  const { push, pop } = useNavigation();
  return (
    <>
      <Image
        src="/checkin.svg"
        alt="Hackathon.zip"
        height={300}
        width={500}
        style={{
          margin: "0px"
        }}
      />
      <Text
        h2
        font="sofiapro"
        mt={3}
        mb={0}
        style={{
          color: "#1f2d3d",
          fontSize: "36px"
        }}
      >
        Welcome to Hackathon.zip Check In!
      </Text>

      <Text
        h3
        font="sofiapro"
        mt={0}
        mb={2}
        style={{
          color: "#8492a6",
          fontWeight: 400,
          maxWidth: "45vw",
          textAlign: "center",
          fontSize: "22px"
        }}
      >
        If you're ready for a secure and seamless attendee check-in experience,
        then let's get started!
      </Text>

      <Button onClick={(e: any) => push(<LinkCode />)}>
        I have a Hackathon.zip account
      </Button>
      <Text
        h4
        font="sofiapro"
        my={1}
        style={{
          color: "#8492a6",
          fontWeight: 400,
          fontSize: "18px"
        }}
      >
        To proceed you will need a Hackathon.zip account
      </Text>
    </>
  );
}

export default function Index() {
  return <NavigationProvider defaultView={<Home />} layout={Layout} />;
}
