// app/layout.tsx
import type { Metadata, Viewport } from "next";
import "./globals.css";

// If your Topbar lives elsewhere, adjust the import.
// (This can be a Client Component; layouts can render them.)
import Topbar from "@/components/ai/Topbar";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://wip-frontend.vercel.app"
  ),
  title: { default: "superNova_2177", template: "%s · superNova_2177" },
  description: "Minimal social UI with a 3D portal hero.",
  icons: [{ rel: "icon", url: "/icon.png" }],
  openGraph: {
    title: "superNova_2177",
    description: "Minimal social UI with a 3D portal hero.",
    images: ["/opengraph-image.png"],
  },
  twitter: {
    title: "superNova_2177",
    description: "Minimal social UI with a 3D portal hero.",
    images: ["/opengraph-image.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        {/* global top navigation */}
        <Topbar />

        {/* page content */}
        {children}

        {/* portal root for drawers/modals/tooltips */}
        <div id="portal-root" />
      </body>
    </html>
  );
}
