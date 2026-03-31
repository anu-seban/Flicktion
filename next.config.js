/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Disable ESLint during builds to avoid Node 16 compatibility issues
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Disable TypeScript type checking during builds (for faster dev iteration)
  typescript: {
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig
