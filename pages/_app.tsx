import "../styles/app.scss";
import { Layout, FloatButton, Tooltip } from "antd";
import { AppProps } from "next/app";
import Footer from "../components/layout/Footer";
import Script from "next/script";

const { Content } = Layout;

function App({ Component, pageProps }: AppProps) {
  
  return (
    <>
      <Layout className="app">
        <Content className="fadeIn">
          <Component {...pageProps} />
          <Footer/>
          <FloatButton.BackTop className="back-to-top" tooltip={<div>Back to top</div>} />
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
    </>
  );
}

export default App;

