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
  title: "AI 跨境电商智能选品分析平台",
  description:
    "AI 驱动的跨境电商智能选品分析工具，帮助卖家精准选品、洞察市场趋势",
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
