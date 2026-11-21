import type { Metadata } from "next";
import Link from "next/link";
import { pageTitle } from "@/lib/site";

export const metadata: Metadata = { title: pageTitle("Página não encontrada") };

export default function NotFound() {
  return (
    <main className="flex min-h-svh flex-1 flex-col justify-center gap-6 px-5 sm:px-9">
      <p className="label text-amber">Erro 404 · fora de órbita</p>
      <h1 className="font-display text-5xl leading-[0.9] font-black tracking-tighter sm:text-8xl">
        Página não encontrada
      </h1>
      <p className="text-soft max-w-md text-xl">
        Esse endereço não existe no hub, ou o projeto mudou de nome.
      </p>
      <Link
        href="/projetos/"
        className="label text-mint border-mint w-fit rounded-full border px-6 py-4"
      >
        Ver todos os projetos
      </Link>
    </main>
  );
}
