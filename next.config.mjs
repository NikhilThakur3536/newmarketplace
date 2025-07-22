/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
    domains: [process.env.NEXT_IMAGE_URL],
  },
};

export default nextConfig;
