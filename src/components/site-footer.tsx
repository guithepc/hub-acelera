import { site } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="label text-dim border-line flex flex-wrap justify-between gap-3 border-t px-5 py-8 sm:px-9">
      <span>{site.name}</span>
      <span>Feito pela comunidade Acelera Dev</span>
    </footer>
  );
}
