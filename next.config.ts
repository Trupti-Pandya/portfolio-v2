import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,

  // NOTE: Domain canonicalization (www vs apex, .com -> .dev) is intentionally
  // handled in Vercel's Domains settings, NOT here. Doing host-based redirects
  // in app code on top of Vercel's own domain redirect caused an infinite
  // redirect loop (Vercel: apex -> www, app: www -> apex). Configure redirects
  // in the Vercel dashboard so there is a single source of truth.
};

export default nextConfig;
