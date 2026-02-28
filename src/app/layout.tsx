import type {Metadata} from 'next';
import './globals.css';
import { CustomCursor } from '@/components/custom-cursor';
import { Toaster } from '@/components/ui/toaster';

export const metadata: Metadata = {
  title: 'CampUs | Find.Eat.Fix.Repeat',
  description: 'The Intelligent Smart Campus Hub',
  icons: {
    icon: 'https://i.postimg.cc/J4CxCpKT/Camp-Us-logo-OG.png',
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;900&family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap" rel="stylesheet" />
        <link rel="icon" href="https://i.postimg.cc/J4CxCpKT/Camp-Us-logo-OG.png" />
      </head>
      <body className="font-body antialiased selection:bg-accent selection:text-accent-foreground min-h-screen cursor-none">
        <CustomCursor />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
