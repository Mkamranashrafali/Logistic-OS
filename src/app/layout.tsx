import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

import { GoogleProvider } from "@/context/GoogleProvider";
import { QueryProvider } from "@/providers/QueryProvider";

export const metadata: Metadata = {
  metadataBase: new URL("http://localhost:3000"),
  title: "LogistiCore | Modern Logistics OS",
  description: "Cloud-based Logistics Operating System for modern logistics companies.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} font-sans antialiased`}
      >
        <QueryProvider>
          <GoogleProvider>
            <AuthProvider>
              {children}
            </AuthProvider>
          </GoogleProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
