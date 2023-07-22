import Anchor from "../elements/Anchor";
import { ThunderboltFilled, TwitterOutlined, GithubFilled } from "@ant-design/icons";
import { Layout, Space } from "antd"
import LinkedinLogoIcon from "../elements/LinkedinLogoIcon";
import Link from "next/link";
const { Footer: AntFooter } = Layout 

export default function Footer() {
  return (
    <AntFooter>
      <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
        <p>
          <Link href="/">Return to homepage</Link>
        </p>
        <p>
          Made with <ThunderboltFilled /> by Tyrel Hiebert   <Anchor href="https://twitter.com/tyreldelaney"><TwitterOutlined /></Anchor>  <Anchor href="https://github.com/tyrelh"><GithubFilled /></Anchor>  <Anchor href="https://www.linkedin.com/in/tyrelhiebert/"><LinkedinLogoIcon /></Anchor><br/>
        </p>
      </Space>
      <p>
        I use <Anchor href="https://plausible.io/superflux.dev">Plausible.io</Anchor> to collect privacy respecting visitor analytics.
      </p>
      <p>
        <Anchor href="https://www.github.com/tyrelh/personal-site-nextjs/"><GithubFilled /> View website source</Anchor>
      </p>
    </AntFooter>
)
}