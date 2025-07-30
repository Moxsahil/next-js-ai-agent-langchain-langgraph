import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { generateMetadata } from "@/lib/metadata";
import { ConvexClientProvider } from "@/components/ConvexClientProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = generateMetadata();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ConvexClientProvider>
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground min-h-screen overflow-y-auto scrollbar-hide-until-hover scroll-smooth`}
        >
          {children}
        </body>
      </html>
    </ConvexClientProvider>
  );
}
