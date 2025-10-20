import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mafia Game Night",
  description: "Digital companion for in-person Mafia/Werewolf games",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
