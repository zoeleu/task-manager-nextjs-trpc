import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ProvedorTRPCReact } from "@/trpc/cliente";

const fonteGeist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const fonteGeistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tarefas",
  description: "Um gerenciador de tarefas simples desenvolvido com Next.js e tRPC",
};

export default function LayoutPrincipal({ children: conteudo }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${fonteGeist.variable} ${fonteGeistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ProvedorTRPCReact>
          <main className="mx-auto w-full max-w-xl px-4 py-12">{conteudo}</main>
        </ProvedorTRPCReact>
      </body>
    </html>
  );
}
