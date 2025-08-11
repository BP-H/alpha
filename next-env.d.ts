/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'picsum.photos' },
      { protocol: 'https', hostname: 'images.unsplash.com' }, // optional if you ever switch
      { protocol: 'https', hostname: 'placehold.co' } // optional
    ]
  }
};

module.exports = nextConfig;
