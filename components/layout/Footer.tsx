import Anchor from "../elements/Anchor";
import { ThunderboltFilled, TwitterOutlined, GithubFilled } from "@ant-design/icons";
import { Layout } from "antd"
const { Footer: AntFooter } = Layout 

export default function Footer() {
  return (
    <AntFooter>
        <p>
          Made with <ThunderboltFilled /> by Tyrel Hiebert   <Anchor href="https://twitter.com/tyrelhiebert"><TwitterOutlined /></Anchor>  <Anchor href="https://github.com/tyrelh"><GithubFilled /></Anchor><br/>
          {/* This site uses <Anchor href="https://plausible.io/">Plausible</Anchor> to collect privacy mindful visitor stats<br/> */}
          <Anchor href="https://www.github.com/tyrelh/personal-site-nextjs/"><GithubFilled /> View Source</Anchor>
        </p>
      </AntFooter>
  )
}