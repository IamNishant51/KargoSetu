import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // Cesium static workers/assets are copied to public/cesium by
  // scripts/copy-cesium.mjs (postinstall). Only app/dashboard/globe/
  // imports from cesium, so the landing bundle stays lean. At runtime
  // KargoGlobe sets CESIUM_BASE_URL to /cesium before Viewer construction.
  turbopack: {},
  // Image optimization
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 86400,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ik.imagekit.io",
      },
    ],
  },
  compress: true,
  async rewrites() {
    let apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    
    // Auto-correct huggingface.co/spaces/ URLs to the direct .hf.space URL
    if (apiUrl.includes("huggingface.co/spaces/")) {
      const parts = apiUrl.split("huggingface.co/spaces/")[1].split("/");
      if (parts.length >= 2) {
        const username = parts[0];
        const spacename = parts[1];
        apiUrl = `https://${username}-${spacename}.hf.space`;
      }
    }

    if (apiUrl.includes(".hf.space") && apiUrl.startsWith("http://")) {
      apiUrl = apiUrl.replace("http://", "https://");
    }
    apiUrl = apiUrl.replace(/\/$/, "");
    return [
      {
        source: "/api/:path*",
        destination: `${apiUrl}/api/:path*`,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Cross-Origin-Opener-Policy",
            value: "unsafe-none",
          },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload",
          },
        ],
      },
      {
        source: "/cesium/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/_next/static/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
