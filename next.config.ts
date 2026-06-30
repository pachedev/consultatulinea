import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      // Turnstile requiere cargar su JS desde challenges.cloudflare.com
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob:",
      "font-src 'self'",
      // Turnstile renderiza dentro de un iframe en challenges.cloudflare.com
      "frame-src https://challenges.cloudflare.com",
      // Llamadas al backend API + verificación Turnstile desde el cliente
      "connect-src 'self' https://api.consultatulinea.mx https://challenges.cloudflare.com",
      "frame-ancestors 'none'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  reactCompiler: true,
  output: "standalone",
  async headers() {
    return [
      {
        source: "/((?!_next/static|_next/image|favicon).*)",
        headers: securityHeaders,
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
