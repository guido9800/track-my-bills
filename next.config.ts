
import type {NextConfig} from 'next';
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  register: true,
  skipWaiting: true,
  // For testing PWA features in dev, you might want to comment out the disable line
  // disable: process.env.NODE_ENV === "development", 
  // buildExcludes: ["app-build-manifest.json"], // Example for excluding files if needed
});

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  experimental: {
    allowedDevOrigins: [
        "9003-firebase-studio-1748439590261.cluster-hf4yr35cmnbd4vhbxvfvc6cp5q.cloudworkstations.dev"
    ],
  },
};

export default withPWA(nextConfig);
