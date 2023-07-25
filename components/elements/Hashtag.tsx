import { Tag } from "antd"
import Anchor from "./Anchor"

export interface Props {
  tag: string
}

export default function Hashtag(props: Props) {
  return (
    <Anchor key={props.tag} href={`/blog/tags/${props.tag}`}>
      <Tag key={props.tag}>#{props.tag}</Tag>
    </Anchor>
  )
}