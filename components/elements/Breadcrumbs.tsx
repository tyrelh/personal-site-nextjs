import { SwapRightOutlined } from '@ant-design/icons';
import Link from 'next/link';
import Anchor from './Anchor';
import ThemeToggle from './ThemeToggle';

export interface Props {
  title?: string;
  path?: string;
}

export default function Breadcrumbs(props: Props) {

  return (
    <div id="sticky-header" className="sticky-header sticky-header-visible">
      <ThemeToggle/>
      <Anchor href="/">superflux</Anchor>
      {
        props?.path &&
        <><SwapRightOutlined />{props.path}</>
      }
      {
        props?.title &&
        <><SwapRightOutlined />{props.title}</>
      }
    </div>
  )
}