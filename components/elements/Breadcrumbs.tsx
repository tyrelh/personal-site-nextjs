import { SwapRightOutlined } from '@ant-design/icons';
import Link from 'next/link';
import Anchor from './Anchor';

export interface Props {
  title: string;
  path: string;
}

export default function Breadcrumbs(props: Props) {

  function getBreadcrumbs() {

  }

  return (
    <div id="sticky-header" className="sticky-header sticky-header-hidden">
      <Anchor href="/">Home</Anchor><SwapRightOutlined />blog<SwapRightOutlined />{props.title}
    </div>
  )
}