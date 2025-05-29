
import type {NextConfig} from 'next';
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  register: true,
  skipWaiting: true,
  // PWA will now be enabled in development
  // buildExcludes: ["app-build-manifest.json"],
  // sw: "service-worker.js",
  // cacheOnFrontEndNav: true,
  // reloadOnOnline: true,
});

const nextConfig: NextConfig = {
  /* config options here */
  // typescript: {
  //   ignoreBuildErrors: true, // Removed this line
  // },
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
        "https://9003-firebase-studio-1748439590261.cluster-hf4yr35cmnbd4vhbxvfvc6cp5q.cloudworkstations.dev",
        "http://9003-firebase-studio-1748439590261.cluster-hf4yr35cmnbd4vhbxvfvc6cp5q.cloudworkstations.dev"
    ],
  },
};

export default withPWA(nextConfig);
