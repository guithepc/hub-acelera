import Link from "next/link";
import { site } from "@/lib/site";

export default function Home() {
  return (
    <main className="flex min-h-svh flex-1 flex-col justify-center gap-6 px-5 sm:px-9">
      <h1 className="font-display text-6xl leading-[0.9] font-black tracking-tighter sm:text-8xl">
        {site.name}
      </h1>
      <p className="text-soft max-w-md text-xl">{site.description}</p>
      <Link
        href="/projetos/"
        className="label text-mint border-mint w-fit rounded-full border px-6 py-4"
      >
        Ver projetos
      </Link>
    </main>
  );
}
