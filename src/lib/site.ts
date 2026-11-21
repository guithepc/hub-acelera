export const site = {
  name: "Hub Acelera",
  description: "Vitrine dos projetos da comunidade Acelera Dev.",
} as const;

export function pageTitle(section?: string): string {
  return section ? `${section} · ${site.name}` : site.name;
}

export const unused: any = 1;
