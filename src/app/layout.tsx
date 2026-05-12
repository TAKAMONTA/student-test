import type { Metadata, Viewport } from "next";
import SwRegister from "@/components/SwRegister";
import "./globals.css";

export const metadata: Metadata = {
  title: "中1テストキット",
  description: "中学1年生の中間・期末テスト対策アプリ。5教科の解説・ドリル・AI質問・予想模試。",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#4f46e5",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className="h-full">
      <body className="h-full bg-slate-50 text-slate-900 antialiased">
        {children}
        <SwRegister />
      </body>
    </html>
  );
}
