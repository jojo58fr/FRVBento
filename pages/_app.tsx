import type { AppProps } from 'next/app';
import Head from 'next/head';
import { COMMON_BLOCK_CSS } from '../services/commonStyles';
import '../components/docs/docsStyles.css';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <style data-openbento-common>{COMMON_BLOCK_CSS}</style>
      </Head>
      <Component {...pageProps} />
    </>
  );
}
