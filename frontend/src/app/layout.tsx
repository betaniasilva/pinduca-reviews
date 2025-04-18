import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from 'sonner';
import { AuthProvider } from '@/context/AuthContext';
import LayoutClientWrapper from "@/components/LayoutClientWrapper"; 

export const metadata: Metadata = {
  title: "Pinduca Reviews",
  description: "Plataforma para avaliação de gibis",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br">
      <body>
        <AuthProvider>
          <LayoutClientWrapper>
            <main>{children}</main>
          </LayoutClientWrapper>
          <Toaster richColors position="top-center" />
        </AuthProvider>
      </body>
    </html>
  );
}