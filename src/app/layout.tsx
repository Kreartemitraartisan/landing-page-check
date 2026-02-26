import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Krearte - Customer Survey",
  description: "Krearte Customer Survey Form",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
        {children}
      </body>
    </html>
  );
}