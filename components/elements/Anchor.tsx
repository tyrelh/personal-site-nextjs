import React, { PropsWithChildren } from "react";
import Link from "next/link";

export interface Props extends PropsWithChildren<any> {
  href: string;
}

export default function Anchor(props: Props) {
  function buildAnchor() {
    switch (props.href.charAt(0)) {
      case "/":
        return (
          <Link href={props.href}>
            {/* <a> */}
              { props.children }
            {/* </a> */}
          </Link>
        );
      default:
        return (
          <a href={props.href} target="_blank" rel="noopener noreferrer">
            { props.children }
          </a>
        );
    }
  }

  return (
    <span className="anchor">
      { buildAnchor() }
    </span>
  );
}
