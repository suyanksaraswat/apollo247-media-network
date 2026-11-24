import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Schibsted_Grotesk } from "next/font/google";
import { AppShell } from "@/components/app-shell";
import { CAMPAIGNS } from "@/packages/workspace/campaigns";
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
      <body className="bg-bg font-sans text-[14.5px] leading-relaxed text-ink antialiased">
        <AppShell approvals={CAMPAIGNS.filter((c) => c.status === "in_review").length}>
          {children}
        </AppShell>
      </body>
    </html>
  );
}
