import next from 'next';
import createMdx from '@next/mdx';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
};

const withMDX = createMdx({
  extension: /\.mdx?$/,
  options: {
    // Se precisar de plugins, adicione aqui
  },
});

export default withMDX(nextConfig);