import Anchor from './Anchor';
import ThemeToggle from './ThemeToggle';
import SearchInput from './Search';
import { PostMetadata } from '../../dtos/PostData';

export interface Props {
  title?: string;
  path?: string[];
  searchIndexJson?: string;
  postMetadataList?: PostMetadata[];
}

export default function StickyHeader(props: Props) {
  return (
    <div id="sticky-header" className="sticky-header sticky-header-visible">
      <div className="breadcrumbs">
        <ThemeToggle/>
        <SearchInput searchIndexJson={props.searchIndexJson} postMetadataList={props.postMetadataList} />
        <Anchor href="/">
          superflux.dev
        </Anchor>
        { props?.path?.length > 0 &&
          props?.path.map((pathPiece: string) => (
            <span key={pathPiece}>
              <> / {pathPiece}</>
            </span>
          ))
        }
        {props?.title &&
          <> / {props.title}</>
        }
      </div>
  </div>
  )
}