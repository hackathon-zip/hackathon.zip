import "@/styles/globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { useEffect, useState, type ReactElement, type ReactNode } from "react";
import Head from "next/head"
import { ThemeProvider } from "@/hooks/useTheme";
import { CssBaseline, GeistProvider } from "@geist-ui/core";
import type { NextPage } from "next";
import type { AppProps } from "next/app";
import { SWRConfig } from "swr";

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement, pageProps: any) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

function localStorageCacheProvider(): Map<string, any> {
  // When initializing, we restore the data from `localStorage` into a map.
  const map = new Map<string, any>(
    JSON.parse(localStorage.getItem("app-cache") || "[]")
  );

  // Before unloading the app, we write back all the data into `localStorage`.
  window.addEventListener("beforeunload", () => {
    const appCache = JSON.stringify(Array.from(map.entries()));
    localStorage.setItem("app-cache", appCache);
  });

  // We still use the map for write & read for performance.
  return map;
}

export default function App({ Component, pageProps }: AppPropsWithLayout) {
  const getLayout = Component.getLayout ?? ((page) => page);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const localTheme = localStorage.getItem("theme");
    if (localTheme) {
      setTheme(localTheme as "light" | "dark");
    }
  }, []);

  return (
    <ThemeProvider theme={theme} setTheme={setTheme}>
      <ClerkProvider>
        <GeistProvider themeType={theme}>
          <SWRConfig
            value={{
              fetcher: (resource, init) =>
                fetch(resource, init).then((res) => res.json())
              // provider: localStorageCacheProvider
            }}
          >
            <CssBaseline />
            <Head>
              <title>Hackathon.zip</title>
            </Head>
            {getLayout(<Component {...pageProps} />, pageProps)}
          </SWRConfig>
        </GeistProvider>
      </ClerkProvider>
    </ThemeProvider>
  );
}
