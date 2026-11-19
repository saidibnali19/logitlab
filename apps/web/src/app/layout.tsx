import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { ReportProvider } from "@/components/report/ReportProvider";
import { StateDebugStrip } from "@/components/report/StateDebugStrip";
import { THEME_SCRIPT } from "@/lib/theme";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LogitLab: binary logistic regression, end to end",
  description:
    "Upload a CSV and get a statistician's analysis: data hygiene, assumption checks, a fitted model and plain-English results.",
};

export const viewport: Viewport = {
  // Both schemes are supported, so the browser can theme its own UI (scrollbars, form controls).
  colorScheme: "light dark",
  // theme-color cannot read CSS variables, so these are the canvas colours (slate-50, slate-950) written out.
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
    { media: "(prefers-color-scheme: dark)", color: "#020617" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    // suppressHydrationWarning: the script below may set data-theme before React hydrates.
    <html
      lang="en"
      className="scroll-smooth motion-reduce:scroll-auto"
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-canvas text-ink font-sans antialiased`}
      >
        <ReportProvider>
          {children}
          <StateDebugStrip />
        </ReportProvider>
      </body>
    </html>
  );
}
