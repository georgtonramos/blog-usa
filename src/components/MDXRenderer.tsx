// src/components/MDXRenderer.tsx
import * as React from "react";
import { MDXRemote } from "next-mdx-remote/rsc";

// Se quiser mapear componentes MDX customizados, passe via prop `components`
type Props = {
  source: string;
  components?: Record<string, React.ComponentType<any>>;
};

export default function MDXRenderer({ source, components }: Props) {
  return <MDXRemote source={source} components={components} />;
}