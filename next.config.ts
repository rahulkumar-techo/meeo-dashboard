import type { NextConfig } from "next";

const isProduction = process.env.NODE_ENV === "production";

// Content Security Policy crafted for Next.js App Router, Google OAuth, ImageKit, and Firebase Push
const cspDirectives = [
  "default-src 'self'",
  // Next.js hydration, inline theme initialization, Google Identity Services, and Firebase SDK CDNs
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://accounts.google.com https://apis.google.com https://www.gstatic.com",
  // Tailwind styles, CSS variables, and Google Fonts stylesheet
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  // Local assets, blob preview drops, ImageKit image CDN, and Google profile avatars
  "img-src 'self' blob: data: https://ik.imagekit.io https://*.googleusercontent.com https://lh3.googleusercontent.com",
  // Google Fonts binary fonts and data fonts
  "font-src 'self' https://fonts.gstatic.com data:",
  // REST API, Socket.IO WebSockets (prod & local dev), Google OAuth token verification, FCM push, ImageKit direct upload
  "connect-src 'self' https://meeo-server.onrender.com wss://meeo-server.onrender.com http://127.0.0.1:5000 ws://127.0.0.1:5000 https://accounts.google.com https://oauth2.googleapis.com https://fcm.googleapis.com https://firebaseinstallations.googleapis.com https://upload.imagekit.io",
  // Google Identity Services (GSI) iframe rendering for One-Tap and Sign-In buttons
  "frame-src 'self' https://accounts.google.com",
  // Disallow framing by any third-party or external origin (Clickjacking defense)
  "frame-ancestors 'none'",
  // Disallow legacy plugin objects (Flash, Java, Silverlight)
  "object-src 'none'",
  // Prevent base tag hijacking
  "base-uri 'self'",
  // Prevent arbitrary form submissions outside origin
  "form-action 'self'",
  ...(isProduction ? ["upgrade-insecure-requests"] : []),
];

const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: cspDirectives.join("; "),
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), accelerometer=(), gyroscope=(), magnetometer=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains",
  },
  {
    // Allows Google OAuth popup window to communicate via postMessage with opener
    key: "Cross-Origin-Opener-Policy",
    value: "same-origin-allow-popups",
  },
  {
    key: "Cross-Origin-Resource-Policy",
    value: "same-origin",
  },
];

const nextConfig: NextConfig = {
  // Strip X-Powered-By header to prevent server fingerprinting
  poweredByHeader: false,
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ik.imagekit.io",
      },
      {
        protocol: "https",
        hostname: "*.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
