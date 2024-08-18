import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Check from "./Check";
import Providers from "./components/Providers";
import NextTopLoader from "nextjs-toploader";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "chatapp",
  description: "chatapp",
  icons : '/favicon.ico',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
       <Providers>
        <NextTopLoader/>
         <Check>
           {children}
         </Check>
       </Providers>
      </body>
    </html>
  );
}
