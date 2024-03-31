import { List } from "antd"
import { CalendarOutlined, ReadOutlined } from "@ant-design/icons"
import { PostData, PostMetadata } from "../../dtos/PostData"
import Link from "next/link"
import Hashtag from "./Hashtag"


export interface Props {
  articleMetadataList: PostMetadata[]
}

export default function ArticlePreviewList(props: Props) {
  const { articleMetadataList } = props
  
  return (
    <List
      itemLayout="vertical"
      size="large"
      split={false}
      dataSource={articleMetadataList}
      renderItem={ (post: PostMetadata | PostData) => (
        <List.Item
          key={post.slug}
          extra={
            <Link href={`/blog/${post.slug}`}>
              <img
                className="article-preview-image" 
                alt=""
                src={post?.hero ? post.hero : null}/>
            </Link>
          }
        >
          <Link href={`/blog/${post.slug}`}>
            <h3 className="article-preview-title">
              { post?.title ? post.title : post?.slug }
            </h3>
            {
              post?.date &&
                <h4>
                  <CalendarOutlined /> {post.date}  <ReadOutlined className="readtime-icon" /> {post.readTimeInMinutes} Minute Read
                </h4>
            }
            <p className="article-preview-excerpt">
              {post?.excerpt ? post.excerpt : null}
            </p>
          </Link>
          {
            post?.tags?.length &&
            <p>
              {post.tags.map((tag: string) => (
                <Hashtag key={tag} tag={tag}/>
              ))}
            </p>
          }
        </List.Item>
      )}
    />
  )
}