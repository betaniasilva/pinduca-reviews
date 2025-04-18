import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https', 
        hostname: 'd14d9vp3wdof84.cloudfront.net', 
        port: '', 
        pathname: '/image/**',
      },
      {
        protocol: 'https',
        hostname: 'blogger.googleusercontent.com',
        port: '',
        pathname: '/img/b/**',
      },
      {
        protocol: 'https',
        hostname: 'images.tcdn.com.br',
        port: '',
        pathname: '/img/img_prod/**',
      }
    ],
  },
};

export default nextConfig;