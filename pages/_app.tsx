import "../styles/app.scss";
import { Layout } from "antd";
import { AppProps } from "next/app";
import HeaderW from "../components/layout/HeaderW";
import Footer from "../components/layout/Footer";
import ThemeToggle from "../components/elements/ThemeToggle"
import checkHeaderPos from "../utils/checkHeaderPos";
import { useEffect } from "react";

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
    </>
  );
}

export default MyApp;

