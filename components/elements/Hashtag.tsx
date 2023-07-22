import { Tag } from "antd"

export interface Props {
  tag: string
}

export default function Hashtag(props: Props) {
  return (
    <Tag key={props.tag}>#{props.tag}</Tag>
  )
}