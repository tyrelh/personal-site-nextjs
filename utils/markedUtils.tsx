
// https://marked.js.org/using_pro#renderer

import { ReactNode } from "react";
import { CodeBlock, dracula } from "react-code-blocks";

export const renderer = {
  code(code: ReactNode, lang: string) {
    return <CodeBlock
        text={code.toString()}
        language={lang}
        showLineNumbers={false}
        theme={dracula}
        // wrapLongLines={true}
      />
  },
  codespan(code: ReactNode) {
    return <code className={`inline-code`}>{code}</code>
  },
  image(src: string, alt: string) {
    const nonRelativeHref = "/images/posts/" + src
    return <img src={nonRelativeHref} alt={alt} className="article-image" />
    
  },
  heading(children: ReactNode, level: number) {
    switch(level) {
      case 1:
        return <h1 id={children.toString()}>{children}</h1>
      case 2:
        return(
          <h2 id={children.toString()}>
            <span className="underline">{children}</span>
          </h2>
        )
      case 3:
        return <h3 id={children.toString()}>{children}</h3>
      default:
        return <h4 id={children.toString()}>{children}</h4>
    }
  }
};