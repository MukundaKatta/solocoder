import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SoloCoder - Autonomous AI Software Engineer",
  description: "Full IDE experience with autonomous AI coding agent",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-solo-bg antialiased">
        {children}
      </body>
    </html>
  );
}
