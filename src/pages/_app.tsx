// import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { NextUIProvider } from '@nextui-org/react'
import { FC, ReactNode } from 'react';

const Noop: FC<{ children?: ReactNode }> = ({ children }) => <>{children}</>

export default function App({ Component, pageProps }: AppProps) {

  const Layout = (Component as any).getLayout || Noop

  return (
    <NextUIProvider>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </NextUIProvider>
  );
}
