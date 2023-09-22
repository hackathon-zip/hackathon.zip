import '@/styles/globals.css'
import { CssBaseline, GeistProvider } from '@geist-ui/core';
import type { AppProps } from 'next/app'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <GeistProvider>
      <CssBaseline />
      <Component {...pageProps} />
    </GeistProvider>
  );
}
