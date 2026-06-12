import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,

  // Consolidate ranking authority on ONE canonical domain. Anyone hitting
  // truptipandya.com (or its www) is 301'd to the canonical truptipandya.dev,
  // so search/answer engines never see split duplicate content. To make .com
  // primary instead, swap the host values here and update SITE_URL in src/lib/site.ts.
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "(www\\.)?truptipandya\\.com" }],
        destination: "https://truptipandya.dev/:path*",
        permanent: true,
      },
      {
        source: "/:path*",
        has: [{ type: "host", value: "www\\.truptipandya\\.dev" }],
        destination: "https://truptipandya.dev/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
