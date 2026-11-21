export const site = {
  name: "Hub Acelera",
  description: "Vitrine dos projetos da comunidade Acelera Dev.",
  url: process.env.SITE_URL ?? "http://localhost:3100",
} as const;

export function pageTitle(section?: string): string {
  return section ? `${section} · ${site.name}` : site.name;
}
