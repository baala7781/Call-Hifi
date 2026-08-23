import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HiFi — Automate hotel phone calls with CALL-E",
  description: "AI voice agent platform that discovers, verifies, negotiates, and confirms hotel bookings directly over the phone via CALL-E.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col text-[#1A1A1A] selection:bg-[#1A1A1A] selection:text-[#FFD84D]">
        {children}
      </body>
    </html>
  );
}
