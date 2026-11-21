import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="label text-dim absolute inset-x-0 top-0 z-20 flex items-center justify-between gap-4 px-5 py-5 sm:px-9 sm:py-7">
      <Link href="/" className="hover:text-ink transition-colors">
        <span className="text-mint">●</span> Acelera Dev / Hub
      </Link>
      <nav aria-label="Principal" className="flex gap-5">
        <Link href="/projetos/" className="hover:text-ink transition-colors">
          Projetos
        </Link>
        <Link href="/#sobre" className="hover:text-ink transition-colors">
          Sobre
        </Link>
      </nav>
    </header>
  );
}
