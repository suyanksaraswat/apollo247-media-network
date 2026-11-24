import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Schibsted_Grotesk } from "next/font/google";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

const display = Schibsted_Grotesk({
  variable: "--font-schibsted",
  subsets: ["latin"],
  weight: ["600", "700"],
});

const text = Inter({ variable: "--font-inter", subsets: ["latin"] });

const mono = JetBrains_Mono({ variable: "--font-jetbrains", subsets: ["latin"], weight: ["500"] });

export const metadata: Metadata = {
  title: {
    default: "Apollo 24|7 Media Network · Unofficial concept",
    template: "%s · Apollo 24|7 Media Network (concept)",
  },
  description:
    "A working concept of one retail media network across the Apollo 24|7 app, its stores and its home deliveries.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-IN" className={`${display.variable} ${text.variable} ${mono.variable}`}>
      <body className="flex min-h-dvh flex-col bg-bg font-sans text-[15px] leading-relaxed text-ink antialiased">
        <SiteHeader />
        <main className="mx-auto w-full max-w-6xl flex-1 px-[max(1rem,env(safe-area-inset-left))] py-8 sm:py-12">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
