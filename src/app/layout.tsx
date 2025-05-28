
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { AppHeader } from '@/components/AppHeader';
import { Toaster } from '@/components/ui/toaster';
import { SpeedInsights } from "@vercel/speed-insights/next"
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from '@/contexts/AuthContext'; // Import AuthProvider
import { TooltipProvider } from '@/components/ui/tooltip'; // Import TooltipProvider

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Track-My-Bills - Manage Your Monthly Bills',
  description: 'Easily track your monthly bills, due dates, and payments.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false} // Explicitly disable system if default is light/dark
          disableTransitionOnChange
        >
          <TooltipProvider> {/* Wrap with TooltipProvider */}
            <AuthProvider> {/* Wrap with AuthProvider */}
              <div className="flex min-h-screen flex-col">
                <AppHeader />
                <main className="flex-1">
                  {children}
                </main>
                <Toaster />
              </div>
            </AuthProvider>
          </TooltipProvider>
          <SpeedInsights />
        </ThemeProvider>
      </body>
    </html>
  );
}
