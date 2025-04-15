import "@/styles/globals.css";
import type { AppProps } from "next/app";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import Meta from "@/layouts/Meta";
import { tippy } from "@tippyjs/react";
import NiceModal from "@ebay/nice-modal-react";

import Script from "next/script";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

export default function App({ Component, pageProps }: AppProps) {
  tippy.setDefaultProps({
    delay: [250, 0],
    duration: [500, 0],
  });

  return (
    <QueryClientProvider client={queryClient}>
      <NiceModal.Provider>
        <Meta />
        <Toaster richColors={true} position="bottom-right" />
        <Component {...pageProps} />
        <Script
          src="https://api.toolbird.io/js/script.js"
          strategy="lazyOnload"
          data-domain="mcsetups.dk"
        />
      </NiceModal.Provider>
    </QueryClientProvider>
  );
}
