import type { Metadata, Viewport } from "next";
import { Nunito } from "next/font/google";
import { AppHeader } from "@/components/layout/app-header";
import "./globals.css";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Eco-Simulink: Energy Flow and Food Pyramids",
    template: "%s · Eco-Simulink",
  },
  description:
    "An interactive Grade 7 Science learning app on ecosystems, food chains, food webs, energy flow and ecological pyramids. Works offline after the first visit.",
  applicationName: "Eco-Simulink",
  appleWebApp: { capable: true, title: "Eco-Simulink", statusBarStyle: "default" },
  icons: { apple: "/icons/apple-touch-icon.png" },
};

export const viewport: Viewport = {
  themeColor: "#2a5e34",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${nunito.variable} antialiased`}>
      <body className="flex min-h-dvh flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-xl focus:bg-white focus:p-3"
        >
          Skip to main content
        </a>
        <AppHeader />
        <main id="main" className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:py-10">
          {children}
        </main>
      </body>
    </html>
  );
}
