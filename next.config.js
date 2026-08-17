/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  // 启用 SWC 压缩，构建和运行速度更快
  swcMinify: true,
  // 移除 X-Powered-By 响应头
  poweredByHeader: false,
  // 开启 gzip 压缩
  compress: true,
  images: {
    formats: ['image/avif', 'image/webp'],
  },
}

module.exports = nextConfig
