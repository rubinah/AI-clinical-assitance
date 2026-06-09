// app/layout.tsx
import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI Clinical Assistant — HealthView",
  description: "AI-powered clinical decision support for healthcare professionals. Demo project — not for real clinical use.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${plusJakartaSans.className} bg-background text-foreground min-h-screen`}>
        {/* Skip link for keyboard accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4
                     focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground
                     focus:rounded-lg focus:text-sm"
        >
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
