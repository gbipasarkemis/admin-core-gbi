import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'qkiysowbffpldpfzxebq.supabase.co', // Ganti dengan hostname project Supabase kamu
        pathname: '/storage/v1/object/public/qrcodes/**',
      },
    ],
  },
};

export default nextConfig;
