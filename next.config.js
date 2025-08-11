/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // safe if you later switch <img> -> <Image> for picsum
    remotePatterns: [{ protocol: 'https', hostname: 'picsum.photos' }],
  },
};

module.exports = nextConfig;
