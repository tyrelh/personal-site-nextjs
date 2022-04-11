import "../styles/app.scss";
import { Layout } from "antd";
import { AppProps } from "next/app";
import HeaderW from "../components/layout/HeaderW";
import Footer from "../components/layout/Footer";
import ThemeToggle from "../components/elements/ThemeToggle"
import checkHeaderPos from "../utils/checkHeaderPos";
import { useEffect } from "react";
import Script from "next/script";

const { Content } = Layout;

function MyApp({ Component, pageProps }: AppProps) {

  useEffect(() => {
    window.addEventListener("scroll", checkHeaderPos);
  })
  
  return (
    <>
      <ThemeToggle/>
      <Layout className="app">
        <Content className="fadeIn">
          <Component {...pageProps} />
          <Footer/>
        </Content>
      </Layout>
      {/* <Script
        defer
        data-domain="tyrelh.github.io"
        data-api="https://spring-frog-7f22.tyrelh.workers.dev/tyrel/event"
        src="https://spring-frog-7f22.tyrelh.workers.dev/tyrel/script.hash.js"
      /> */}
    </>
  );
}

export default MyApp;

