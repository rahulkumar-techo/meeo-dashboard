import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme";
import { QueryProvider } from "@/components/providers/query-provider";
import { AppLayoutWrapper } from "@/components/layout/app-layout-wrapper";

import { SocketProvider } from "@/context/socket-provider";
import { Toaster } from "sonner";

const poppins = Poppins({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Meeo | Enterprise Commerce Dashboard",
  description: "Meeo Enterprise E-Commerce Administration and Management Platform",
  manifest: "/branding/site.webmanifest",
  icons: {
    icon: [
      { url: "/branding/favicon.ico" },
      { url: "/branding/favicon.svg", type: "image/svg+xml" },
      { url: "/branding/favicon-96x96.png", sizes: "96x96", type: "image/png" },
    ],
    apple: [
      { url: "/branding/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var stored = localStorage.getItem('meeo-dashboard-theme');
                  var isDark = stored === 'dark' || (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches) || (stored === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
                  if (isDark) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${poppins.variable} font-sans antialiased bg-background text-foreground`}
        suppressHydrationWarning
      >
        <QueryProvider>
          <ThemeProvider defaultTheme="system">
            <SocketProvider>
              <AppLayoutWrapper>{children}</AppLayoutWrapper>
              <Toaster richColors position="top-right" />
            </SocketProvider>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}


