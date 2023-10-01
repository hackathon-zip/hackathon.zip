import "@/styles/globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import type { ReactElement, ReactNode, FC, ComponentType } from "react";

import type { NextPage } from "next";
import type { AppProps } from "next/app";
import { CssBaseline, GeistProvider } from "@geist-ui/core";
import { SWRConfig } from "swr";

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement, pageProps: any) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

export default function App({ Component, pageProps }: AppPropsWithLayout) {
  const getLayout = Component.getLayout ?? ((page) => page);

  return (
    <ClerkProvider>
      <GeistProvider>
        <SWRConfig
          value={{
            fetcher: (resource, init) =>
              fetch(resource, init).then((res) => res.json()),
          }}
        >
          <CssBaseline />
          {getLayout(<Component {...pageProps} />, pageProps)}
        </SWRConfig>
      </GeistProvider>
    </ClerkProvider>
  );
}
