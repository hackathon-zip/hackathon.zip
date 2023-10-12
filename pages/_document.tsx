import { CssBaseline } from "@geist-ui/core";
import Document, { Head, Html, Main, NextScript } from "next/document";
import { Fragment } from "react";

export default class MyDocument extends Document {
  static async getInitialProps(ctx: any) {
    const initialProps = await Document.getInitialProps(ctx);
    const styles = CssBaseline.flush();

    return {
      ...initialProps,
      styles: [
        <Fragment key="1">
          {initialProps.styles}
          {styles}
        </Fragment>
      ]
    };
  }

  render() {
    return (
      <Html lang="en">
        <Head>
          <link rel="icon" href="/favicon.png" />
          <link rel="favicon" href="/favicon.png" />

          <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
          <link rel="apple-touch-startup-image" href="/apple-touch-icon.png" />
          <meta name="apple-mobile-web-app-title" content="Hackathons" />

          <link rel="shortcut-icon" href="/favicon.png" />

          <meta name="theme-color" content="#4E597C" />

          <meta name="apple-mobile-web-app-capable" content="yes" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
