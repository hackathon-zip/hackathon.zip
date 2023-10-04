import { useState, useEffect, Fragment } from "react";
import { run, compile } from "@mdx-js/mdx";
import * as runtime from "react/jsx-runtime";

import MarkdownIt from "markdown-it";

/* The component exported by the page renders Markdown to 
HTML/JSX using Next.js' standard @mdx-js/mdx */

// export default function Markdown({ code }: { code: String }) {
//   const [mdxModule, setMdxModule] = useState(); // @ts-ignore
//   const Content = mdxModule ? mdxModule.default : Fragment;

//   useEffect(() => {
//     (async () => {
//       const compiled = String(
//         await compile(`${code}`, {
//           outputFormat: "function-body",
//           development: false
//         })
//       );
//       setMdxModule(await run(compiled, runtime));
//     })();
//   }, [code]);
//   return <Content />;
// }

export default function Markdown({ code }: { code: string }) {
  return (
    <div
      dangerouslySetInnerHTML={{
        __html: MarkdownIt().render(code)
      }}
    />
  )
}