
import { PropsWithChildren } from "react"
import { TwitterOutlined, GithubFilled } from "@ant-design/icons";
import LinkedinLogoIcon from "./LinkedinLogoIcon";
import Anchor from "./Anchor";

export interface Props extends PropsWithChildren<any> {
  clazzName?: string
}

export default function SocialCallout(props: Props) {

  let clazz = "social-callout ";
  if (props?.clazzName) {
    clazz += props.clazzName;
  }

  return (
    <div className={clazz}>
      <Anchor href="https://twitter.com/tyreldelaney"><TwitterOutlined/></Anchor>
      <Anchor href="https://github.com/tyrelh"><GithubFilled/></Anchor>
      <Anchor href="https://www.linkedin.com/in/tyrelhiebert/"><LinkedinLogoIcon/></Anchor>
    </div>
  )
}
