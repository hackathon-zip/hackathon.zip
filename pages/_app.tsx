import '@/styles/globals.css'
import { ClerkProvider } from '@clerk/nextjs';
import { CssBaseline, GeistProvider } from '@geist-ui/core';
import type { AppProps } from 'next/app'
import { CompletionTriggerKind } from 'typescript';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ClerkProvider>
      <GeistProvider>
        <CssBaseline />
        <Component {...pageProps} />
      </GeistProvider>
    </ClerkProvider>
  );
}
