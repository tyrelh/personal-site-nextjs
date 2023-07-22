import { GetStaticPaths, GetStaticPathsResult, GetStaticProps, GetStaticPropsResult } from "next"
import path from "path"
import fs from "fs";
import { getMetadata } from "../../../utils/articleFileUtils"
import { PostData, PostMetadata, Tags } from "../../../dtos/PostData";
import { getTagsFromMetadata } from "../../../utils/tagUtils";
import matter from "gray-matter";
import { calculateReadTimeOfText } from "../../../utils/textUtils";
import { Params } from "next/dist/server/router";


export default function TagPage({tag}) {
  return (
    <>
      TAG YO {tag}
    </>
  )
}

// export const getStaticProps: GetStaticProps = async ({
//   params: { tag },
// }): Promise<GetStaticPropsResult<PostData>> => {
//   // read in all article files
//   // parse into a list of PostData objects
//   // filter list based on the tag prop
//   // order remaining list by date written

//   return {
//     props: {
//       ...postData,
//     },
//   };
// };

export async function getStaticProps({ params }: Params) {


  return {
    props: {
      tag: params.tag
    },
  }
}

export const getStaticPaths: GetStaticPaths = async (
  context
): Promise<GetStaticPathsResult> => {
  const metadata = getMetadata();
  const tags = getTagsFromMetadata(metadata);
  console.log("Tags: ", tags);
  const paths = tags.map((tag: string) => ({
    params: {
      tag,
    },
  }));

  return {
    paths: paths,
    fallback: false
  };
};