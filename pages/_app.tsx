import "../styles/app.scss";
import { Layout } from "antd";
import { AppProps } from "next/app";
import Footer from "../components/layout/Footer";
import Script from "next/script";
import { useEffect } from "react";

declare global {
  interface Window {
    pagefind: any;
  }
}

const { Content } = Layout;

function MyApp({ Component, pageProps }: AppProps) {

  useEffect(() => {
    async function loadPagefind() {
      if (typeof window.pagefind === "undefined") {
        try {
          window.pagefind = await import(
            // @ts-expect-error pagefind generated after build
            /* webpackIgnore: true */ "/pagefind/pagefind.js"
          );
        } catch (error) {
          window.pagefind = {
            debouncedSearch: () => ({
              results: [
                {
                  id: "pretzels",
                  data: async () => ({
                    url: "/pretzels.html",
                    meta: { title: "These pretzels are making me thirsty" },
                    excerpt:
                      "these <mark>pretzels</mark> are making me thirsty",
                  }),
                },
              ],
            }),
          };
        }
      }
    }
    loadPagefind();
  }, []);
  
  return (
    <>
      <Layout className="app">
        <Content className="fadeIn">
          <div id="search"></div>
          <Component {...pageProps} />
          <Footer/>
        </Content>
      </Layout>
      {
        process.env.NODE_ENV == "production" &&
        <Script
          id="springfrog"
          strategy="afterInteractive"
          data-domain="superflux.dev"
          data-api="https://spring-frog-7f22.tyrelh.workers.dev/tyrel/event"
          src="https://spring-frog-7f22.tyrelh.workers.dev/tyrel/script.hash.js"
        />
      }
      <script>
          
      </script>
    </>
  );
}

export default MyApp;

