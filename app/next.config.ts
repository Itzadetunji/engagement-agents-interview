/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn-files.eu.placewise.com",
      },
    ],
  },
};

export default nextConfig;
