import { SwapRightOutlined } from '@ant-design/icons';
import Anchor from './Anchor';
import ThemeToggle from './ThemeToggle';
import SearchInput from './Search';

export interface Props {
  title?: string;
  path?: string[];
}

export default function StickyHeader(props: Props) {
  return (
    <div id="sticky-header" className="sticky-header sticky-header-visible">
      <div className="breadcrumbs">
        <ThemeToggle/>
        <SearchInput/>
        <Anchor href="/">
          superflux.dev
        </Anchor>
        { props?.path?.length > 0 &&
          props?.path.map((pathPiece: string) => (
            <>
              <SwapRightOutlined />
              {pathPiece}
            </>
          ))
        }
        {props?.title &&
          <><SwapRightOutlined />{props.title}</>
        }
      </div>
  </div>
  )
}