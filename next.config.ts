
import type {NextConfig} from 'next';
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public", // Destination directory for service worker files
  register: true, // Register the service worker
  skipWaiting: true, // Instructs the waiting service worker to become the active service worker
  disable: process.env.NODE_ENV === "development", // Disable PWA in development mode for easier debugging (optional, can be enabled)
  // buildExcludes: ["app-build-manifest.json"], // Example for excluding files if needed
  // sw: "service-worker.js", // You can specify a custom service worker file if needed
  // cacheOnFrontEndNav: true, // Caches pages navigated to on the front-end
  // reloadOnOnline: true, // Reload the app when it comes back online
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
        "https://9003-firebase-studio-1748439590261.cluster-hf4yr35cmnbd4vhbxvfvc6cp5q.cloudworkstations.dev"
    ],
  },
};

export default withPWA(nextConfig);
