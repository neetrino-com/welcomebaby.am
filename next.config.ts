import type { NextConfig } from "next";

// Разбираем S3_PUBLIC_URL или S3_ENDPOINT, чтобы разрешить домен R2 для изображений
const s3PublicUrl = process.env.S3_PUBLIC_URL || process.env.S3_ENDPOINT
let r2RemotePattern:
  | {
      protocol: 'http' | 'https'
      hostname: string
      pathname: string
    }
  | undefined

if (s3PublicUrl) {
  try {
    const url = new URL(s3PublicUrl)
    r2RemotePattern = {
      protocol: url.protocol === 'http:' ? 'http' : 'https',
      hostname: url.hostname,
      pathname: '/**',
    }
  } catch {
    // некорректный URL — просто пропускаем, чтобы не ломать билд
  }
}

const nextConfig: NextConfig = {
  eslint: {
    // Отключаем ESLint во время сборки для продакшена
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Отключаем проверку типов во время сборки
    ignoreBuildErrors: true,
  },
  // Оптимизация для разработки
  poweredByHeader: false,
  // Оптимизация изображений
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    qualities: [75, 85, 100], // Настройка качества для Next.js 16
    minimumCacheTTL: 31536000, // 1 год
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    unoptimized: false, // Включаем оптимизатор обратно после исправления конфига
    // Разрешаем локальные изображения, Cloudflare R2 (через S3_PUBLIC_URL/S3_ENDPOINT) и Vercel Blob Storage (для обратной совместимости)
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'welcomebaby.neetrino.com',
        pathname: '/images/**',
      },
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
        pathname: '/**',
      },
      ...(r2RemotePattern ? [r2RemotePattern] : []),
      {
        protocol: 'http',
        hostname: 'localhost',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        pathname: '/**',
      },
    ],
    // Разрешаем локальные пути
    domains: [],
  },
  // Экспериментальные функции для производительности
  experimental: {
    // optimizePackageImports: ['lucide-react'], // Временно отключаем
  },
  // Внешние пакеты для серверных компонентов
  serverExternalPackages: [],
  // Компрессия
  compress: true,
  // Security Headers и кэширование
  async headers() {
    const securityHeaders = [
      {
        key: 'X-Frame-Options',
        value: 'SAMEORIGIN',
      },
      {
        key: 'X-Content-Type-Options',
        value: 'nosniff',
      },
      {
        key: 'Referrer-Policy',
        value: 'strict-origin-when-cross-origin',
      },
      {
        key: 'X-XSS-Protection',
        value: '1; mode=block',
      },
    ]

    // HSTS только для HTTPS (в проде)
    if (process.env.NODE_ENV === 'production') {
      securityHeaders.push({
        key: 'Strict-Transport-Security',
        value: 'max-age=31536000; includeSubDomains',
      })
    }

    return [
      // Security headers для всех маршрутов
      {
        source: '/:path*',
        headers: securityHeaders,
      },
      // Кэширование для API продуктов
      {
        source: '/api/products/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=3600, stale-while-revalidate=7200',
          },
        ],
      },
      // Кэширование для изображений
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default nextConfig;