/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: "/universities",
        destination: "/",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
