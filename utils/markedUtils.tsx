
// https://marked.js.org/using_pro#renderer

import { ReactNode } from "react";
import { CodeBlock, dracula } from "react-code-blocks";

// marked-react calls each override with the renderer as `this` after bumping `this.elementId`
// (see its own #h helper), so every returned element needs that id as its React key — these are
// rendered into an array. Plain methods, not arrow functions: arrows would lose `this`.
export const renderer = {
  code(code: ReactNode, lang: string) {
    return <CodeBlock
        key={this.elementId}
        text={code.toString()}
        language={lang}
        showLineNumbers={false}
        theme={dracula}
        // wrapLongLines={true}
      />
  },
  codespan(code: ReactNode) {
    return <code key={this.elementId} className={`inline-code`}>{code}</code>
  },
  image(src: string, alt: string) {
    // absolute and external URLs are used as-is; bare filenames live in /images/posts/
    const href = /^(https?:|\/)/.test(src) ? src : "/images/posts/" + src.replace(/^\.\//, "")
    return <img key={this.elementId} src={href} alt={alt} className="article-image" />
  },
  heading(children: ReactNode, level: number) {
    switch(level) {
      case 1:
        return <h1 key={this.elementId} id={children.toString()}>{children}</h1>
      case 2:
        return(
          <h2 key={this.elementId} id={children.toString()}>
            <span className="underline">{children}</span>
          </h2>
        )
      case 3:
        return <h3 key={this.elementId} id={children.toString()}>{children}</h3>
      default:
        return <h4 key={this.elementId} id={children.toString()}>{children}</h4>
    }
  }
};
