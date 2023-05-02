import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { GlobalStateProvider } from "../context";
import { ThirdwebProvider } from '@thirdweb-dev/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

function MyApp({ Component, pageProps }: AppProps) {

  const queryClient = new QueryClient()

  return (
    <QueryClientProvider client={queryClient}>
      <ThirdwebProvider
        activeChain="ethereum"
        authConfig={{
          authUrl: "/api/auth",
          domain: process.env.NEXT_PUBLIC_AUTH_DOMAIN || ""
        }}
        dAppMeta={{
          name: "LINKIT",
          description: "Chainlink job spec editor",
          // logoUrl: "https://example.com/logo.png",
          url: "TODO",
          isDarkMode: true,
        }}
      >
        <GlobalStateProvider>
          <Toaster toastOptions={{
            style: {
              backgroundColor: "#000",
              color: "#ccc"
            }
          }}/>
          <Component {...pageProps} />
        </GlobalStateProvider>
      </ThirdwebProvider>
    </QueryClientProvider>
  )
}

export default MyApp
