/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    unoptimized: true,
  },
  serverExternalPackages: ["sweph"],
  outputFileTracingIncludes: {
    "/api/natal-chart/calculate": [
      "./node_modules/.pnpm/sweph@*/node_modules/sweph/prebuilds/linux-x64/**/*",
    ],
  },
}

export default nextConfig
