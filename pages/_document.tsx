import { Html, Head, Main, NextScript } from 'next/document'
import Script from "next/script";
 
export default function Document() {
  return (
    <Html>
      <Head>
        <link href="/pagefind/pagefind-ui.css" rel="stylesheet" />
        <script src="/pagefind/pagefind-ui.js" async />
        <script id="pagefind-ui-init" defer>
           {`window.addEventListener('DOMContentLoaded', (event) => {
                new PagefindUI({ element: "#search", showSubResults: true });
            });`}
        </script>
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}