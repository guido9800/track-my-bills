
import type {NextConfig} from 'next';
import withPWAInit from "@ducanh2912/next-pwa";

const pwaConfig = {
  dest: "public",
  register: true,
  buildExcludes: ["app-build-manifest.json", /\/favicon\.ico$/], // Exclude favicon.ico from PWA build
  // sw: "service-worker.js", // Default
  // cacheOnFrontEndNav: true, // Default is false, enable if needed
  // reloadOnOnline: true, // Default is true
  // skipWaiting: true, // Default is true, removed due to previous TS error
};

const withPWA = withPWAInit(pwaConfig);

// Configuration for Next.js
const nextConfig: NextConfig = {
  /* config options here */
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
  /*
  experimental: {
    allowedDevOrigins: [
        "https://9003-firebase-studio-1748439590261.cluster-hf4yr35cmnbd4vhbxvfvc6cp5q.cloudworkstations.dev",
        "http://9003-firebase-studio-1748439590261.cluster-hf4yr35cmnbd4vhbxvfvc6cp5q.cloudworkstations.dev",
        "https://6000-firebase-studio-1748439590261.cluster-hf4yr35cmnbd4vhbxvfvc6cp5q.cloudworkstations.dev",
        "http://6000-firebase-studio-1748439590261.cluster-hf4yr35cmnbd4vhbxvfvc6cp5q.cloudworkstations.dev"
    ],
  },
  */
  // typescript: { // Already removed or commented out based on previous interactions
  //   ignoreBuildErrors: true,
  // },
  // eslint: { // Already removed or commented out
  //   ignoreDuringBuilds: true,
  // },
};

export default withPWA(nextConfig);
// Added a harmless comment to ensure the file is processed if no other changes were made.
