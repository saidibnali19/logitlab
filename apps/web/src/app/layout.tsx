import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { ReportProvider } from "@/components/report/ReportProvider";
import { StateDebugStrip } from "@/components/report/StateDebugStrip";

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

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="scroll-smooth">
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
