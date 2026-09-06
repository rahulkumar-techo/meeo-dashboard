import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar/appSidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";

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
      <body
        className={`${poppins.variable} font-sans antialiased`}
        suppressHydrationWarning
      >
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset className="bg-slate-50/40 dark:bg-background min-h-svh min-w-0 max-w-full overflow-x-hidden">
            <DashboardHeader />
            <div className="flex-1 p-3 sm:p-4 md:p-5 lg:p-6 min-w-0 max-w-full">
              {children}
            </div>
          </SidebarInset>
        </SidebarProvider>
      </body>
    </html>
  );
}
