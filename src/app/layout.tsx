import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "@/components/layout/Providers";

export const metadata: Metadata = {
  title: {
    default: "Clayverse — The infinite creative studio for clay",
    template: "%s | Clayverse",
  },
  description:
    "Design, simulate, collaborate, and fabricate with clay. The all-in-one platform for potters, sculptors, tile artists, and everyone working with clay.",
  keywords: ["pottery", "ceramics", "clay", "3D modeling", "glaze simulation", "ceramic art", "wheel throwing", "hand building", "sculpting"],
  metadataBase: new URL("https://clayverse.app"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://clayverse.app",
    siteName: "Clayverse",
    title: "Clayverse — The infinite creative studio for clay",
    description: "Design, simulate, collaborate, and fabricate with clay.",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fdf8f4" },
    { media: "(prefers-color-scheme: dark)", color: "#221b16" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
