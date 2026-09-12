import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // Cesium static workers/assets are copied to public/cesium by
  // scripts/copy-cesium.mjs (postinstall). Only app/dashboard/globe/
  // imports from cesium, so the landing bundle stays lean. At runtime
  // KargoGlobe sets CESIUM_BASE_URL to /cesium before Viewer construction.
  turbopack: {},
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin-allow-popups",
          },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3001/api/:path*',
      },
    ];
  },
};

export default nextConfig;
