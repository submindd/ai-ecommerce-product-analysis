import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { PlatformProvider } from "@/components/platform-provider";
import { NavBar } from "@/components/nav-bar";
import "./globals.css";

// ========== 字体配置 ==========
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// ========== SEO 元数据 ==========
export const metadata: Metadata = {
  title: "Aoxia Lite - AI选品助手",
  description:
    "AI驱动的跨境电商智能选品助手 — 发现热销商品，洞察市场机会",
};

// ========== 根布局组件 ==========
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ThemeProvider>
          <PlatformProvider>
            <NavBar />
            {children}
          </PlatformProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
