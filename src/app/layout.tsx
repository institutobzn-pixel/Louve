import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "next-themes";

import { ServiceWorkerRegister } from "@/components/layout/sw-register";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Plataforma de Gestão · Ministério de Louvor",
    template: "%s · Ministério de Louvor",
  },
  description:
    "Plataforma completa de planejamento ministerial para ministérios de louvor.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/icons/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/icons/favicon-32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/icons/apple-touch-icon.png",
  },
  // Instalável na tela inicial (Android/iOS), sem loja de aplicativos.
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Louve",
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#09090e",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="font-sans">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider delayDuration={200}>{children}</TooltipProvider>
          <Toaster position="bottom-right" />
          <ServiceWorkerRegister />
        </ThemeProvider>
      </body>
    </html>
  );
}
