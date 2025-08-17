import "@/app/ui/global.css";
import { inter } from "@/app/ui/fonts";
import { Analytics } from "@vercel/analytics/next";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <Analytics />
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  );
}
