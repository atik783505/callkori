import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CallKori — ভিডিও কল করুন",
  description: "বন্ধুদের সাথে HD ভিডিও কলে সংযুক্ত থাকুন। বিনামূল্যে, কোনো ডাউনলোড ছাড়া।",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="bn" className="h-full">
      <body className="min-h-full flex flex-col antialiased">{children}</body>
    </html>
  );
}
