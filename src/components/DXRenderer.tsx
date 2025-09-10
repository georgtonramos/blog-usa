// src/components/MDXRenderer.tsx
"use client";

import { MDXProvider } from "@mdx-js/react";
import * as runtime from 'react/jsx-runtime'

// Componentes customizados
const components = {
  h1: (props) => <h1 className="text-3xl font-bold mt-8 mb-4" {...props} />,
  p: (props) => <p className="mb-4 leading-relaxed" {...props} />,
  // Adicione outros componentes conforme necessário
};

export default function MDXRenderer({ compiledSource }) {
  const {default: Content} = runtime.jsx.apply(runtime, [{type: 'jsx', props: {
    components: components,
  }},
  {type: 'jsx', props: {
    ...runtime.jsx,
    ...runtime.jsxs,
    ...runtime.Fragment
  }, children: compiledSource}])
  
  return (
    <MDXProvider components={components}>
      <Content />
    </MDXProvider>
  );
}