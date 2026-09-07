import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme";
import { QueryProvider } from "@/components/providers/query-provider";
import { AppLayoutWrapper } from "@/components/layout/app-layout-wrapper";

const poppins = Poppins({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Meeo | Enterprise Commerce Dashboard",
  description: "Meeo Enterprise E-Commerce Administration and Management Platform",
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
            <AppLayoutWrapper>{children}</AppLayoutWrapper>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}

