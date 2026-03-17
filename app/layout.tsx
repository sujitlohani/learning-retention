import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/src/components/theme/ThemeProvider";
import { AuthProvider } from "@/src/features/auth/hooks/useAuth";
import { UserInit } from "@/src/components/UserInit";
import { Sidebar } from "@/src/components/sidebar/Sidebar";
import { TooltipProvider } from "@/src/components/ui/tooltip";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Memora — AI-Powered Spaced Repetition",
  description: "Retain what you learn with AI-powered spaced repetition quizzes and personalized study schedules.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${plusJakarta.variable} font-sans antialiased`} style={{ background: 'var(--bg-base)' }} suppressHydrationWarning>
        <script src="https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js" async />
        <ClerkProvider>
          <ThemeProvider>
            <AuthProvider>
              <UserInit />
              <TooltipProvider>
                <div className="flex min-h-screen">
                  <Sidebar />
                  <main className="flex-1 overflow-auto">
                    {children}
                  </main>
                </div>
              </TooltipProvider>
            </AuthProvider>
          </ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
