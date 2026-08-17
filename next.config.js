/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // 移除 X-Powered-By 响应头
  poweredByHeader: false,
  // 开启 gzip 压缩
  compress: true,
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  // 关闭Next.js遥测，减少日志干扰
  telemetry: false,
}

module.exports = nextConfig
