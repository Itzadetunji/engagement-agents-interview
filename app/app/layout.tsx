import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "Promotions Aggregator",
  description: "Browse mall promotions scraped from Briargate",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/geist@1.4.2/dist/fonts/geist-sans/style.min.css"
        />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/geist@1.4.2/dist/fonts/geist-mono/style.min.css"
        />
      </head>
      <body className="min-h-full flex flex-col bg-background font-sans">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
