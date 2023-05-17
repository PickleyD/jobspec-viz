import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { GlobalStateProvider } from "../context";
import { ThirdwebProvider } from '@thirdweb-dev/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';

function MyApp({ Component, pageProps }: AppProps) {

  const queryClient = new QueryClient()

  // Set theme on first load 
  useEffect(() => {
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark')
      localStorage.theme = 'dark'
      dispatchEvent(new Event("storage"));
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.theme = 'light'
      dispatchEvent(new Event("storage"));
    }
  })

  // Listen for theme toggles
  useEffect(() => {
    const checkTheme = () => {
      const theme = localStorage.getItem('theme')
  
      if (theme === "dark") {
        document.documentElement.classList.add('dark')
        document.documentElement.classList.remove('light')
      }

      if (theme === "light") {
        document.documentElement.classList.add('light')
        document.documentElement.classList.remove('dark')
      }
    }
  
    addEventListener('storage', checkTheme)
  
    return () => {
      removeEventListener('storage', checkTheme)
    }
  }, [])

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
          }} />
          <Component {...pageProps} />
        </GlobalStateProvider>
      </ThirdwebProvider>
    </QueryClientProvider>
  )
}

export default MyApp
