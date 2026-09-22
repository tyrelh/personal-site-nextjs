import { Tags } from "../../dtos/PostData";
import Anchor from "./Anchor";

export interface Props {
  tags: Tags;
}

const MIN_FONT_SIZE_REM = 0.9;
const MAX_FONT_SIZE_REM = 2.0;

export default function TagCloud(props: Props) {
  const { tags } = props;
  const tagEntries = Object.entries(tags);

  if (tagEntries.length === 0) {
    return null;
  }

  const counts = tagEntries.map(([, count]) => count);
  const minCount = Math.min(...counts);
  const maxCount = Math.max(...counts);
  const countRange = maxCount - minCount || 1;
  const fontSizeRange = MAX_FONT_SIZE_REM - MIN_FONT_SIZE_REM;

  const tagList = tagEntries
    .sort(([tagA], [tagB]) => tagA.localeCompare(tagB))
    .map(([tag, count]) => {
      const relativeCount = (count - minCount) / countRange;
      const fontSize = MIN_FONT_SIZE_REM + relativeCount * fontSizeRange;

      return (
        <Anchor key={tag} href={`/blog/tags/${tag}`}>
          <span
            className="tag-cloud-item"
            style={{ fontSize: `${fontSize}rem` }}
            title={`${count} post${count === 1 ? "" : "s"}`}
          >
            #{tag}
          </span>
        </Anchor>
      );
    });

  return <div className="tag-cloud">{tagList}</div>;
}
