import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Death Eaters Among Us",
  description: "Digital companion for in-person Mafia/Werewolf games",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.cdnfonts.com/css/harry-potter" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
