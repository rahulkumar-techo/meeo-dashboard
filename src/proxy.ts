import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  // Generate a cryptographically secure random nonce for each request
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const isProduction = process.env.NODE_ENV === "production";

  // Strict CSP: completely eliminates 'unsafe-inline' and 'unsafe-eval' from script-src
  const cspDirectives = [
    "default-src 'self'",
    // Nonce-based script execution with 'strict-dynamic' for modern browsers + explicit Google/Firebase origins
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https://accounts.google.com https://apis.google.com https://www.gstatic.com`,
    // Styles: allow self, Google Fonts, and inline styles for Tailwind CSS variables
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    // Images: allow self, data/blob previews, ImageKit CDN, and Google profile avatars
    "img-src 'self' blob: data: https://ik.imagekit.io https://*.googleusercontent.com https://lh3.googleusercontent.com",
    // Fonts: allow self, Google fonts static assets, data URIs
    "font-src 'self' https://fonts.gstatic.com data:",
    // REST API, Socket.IO WebSockets, Google OAuth endpoints, FCM push, ImageKit direct upload
    "connect-src 'self' https://meeo-server.onrender.com wss://meeo-server.onrender.com http://127.0.0.1:5000 ws://127.0.0.1:5000 https://accounts.google.com https://oauth2.googleapis.com https://fcm.googleapis.com https://firebaseinstallations.googleapis.com https://upload.imagekit.io",
    // Google Identity Services (GSI) iframe rendering for One-Tap and Sign-In buttons
    "frame-src 'self' https://accounts.google.com",
    // Disallow framing by any third-party (Clickjacking protection)
    "frame-ancestors 'none'",
    // Disallow legacy plugins
    "object-src 'none'",
    // Prevent base tag hijacking
    "base-uri 'self'",
    // Prevent arbitrary form submissions outside origin
    "form-action 'self'",
    ...(isProduction ? ["upgrade-insecure-requests"] : []),
  ];

  const cspHeader = cspDirectives.join("; ");

  const requestHeaders = new Headers(request.headers);
  // Next.js automatically reads 'x-nonce' and attaches nonce attributes to all Next.js generated scripts
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", cspHeader);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  response.headers.set("Content-Security-Policy", cspHeader);

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, robots.txt, branding
     */
    {
      source: "/((?!_next/static|_next/image|favicon.ico|robots.txt|branding).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
