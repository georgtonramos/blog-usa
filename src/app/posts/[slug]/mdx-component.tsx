// src/app/posts/hello-world/mdx-component.tsx
"use client";

import { MDXProvider } from "@mdx-js/react";
import { useEffect } from "react";

// Aqui você pode adicionar componentes customizados para o MDX, como por exemplo:
// const components = {
//   h1: ({ children }) => <h1 className="text-3xl font-bold">{children}</h1>,
// };

export default function MDXClientComponent({ children }) {
  // Você pode usar hooks aqui se precisar de interatividade
  useEffect(() => {
    console.log("Componente MDX montado no cliente.");
  }, []);

  return (
    <div className="prose dark:prose-invert">
      <MDXProvider components={{}}>{children}</MDXProvider>
    </div>
  );
}