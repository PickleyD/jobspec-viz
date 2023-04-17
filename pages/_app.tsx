import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { GlobalStateProvider } from "../context";
import { ThirdwebProvider } from '@thirdweb-dev/react';

function MyApp({ Component, pageProps }: AppProps) {
  return (
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
        <Component {...pageProps} />
      </GlobalStateProvider>
    </ThirdwebProvider>
  )
}

export default MyApp
