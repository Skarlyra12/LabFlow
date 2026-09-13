import type { Metadata } from "next";
import Sidebar from "@/components/Sidebar";
import "./globals.css";

export const metadata: Metadata = {
  title: "LabFlow",
  description: "Gestão de laboratórios universitários",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>
        <Sidebar />
        <main className="min-h-screen md:ml-[272px]">{children}</main>
      </body>
    </html>
  );
}
