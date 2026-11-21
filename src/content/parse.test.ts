import { describe, expect, it } from "vitest";
import { ContentError, parseProject, sortProjects } from "./parse";

const valid = {
  name: "Rota Segura",
  tagline: "Rotas a pé mais seguras.",
  description: "Um app de rotas.",
  highlights: ["Mapa de calor"],
  stack: ["React Native"],
  links: { site: "https://example.com" },
  cover: "/projects/rota-segura/cover.svg",
  authors: [{ name: "Ana Exemplo" }],
};

const allMediaExists = () => true;
const parse = (fileName: string, value: unknown, mediaExists = allMediaExists) =>
  parseProject(fileName, JSON.stringify(value), mediaExists);

describe("parseProject", () => {
  it("usa o nome do arquivo como slug e preenche os padrões", () => {
    const project = parse("rota-segura.json", valid);
    expect(project.slug).toBe("rota-segura");
    expect(project.screenshots).toEqual([]);
    expect(project.authors[0]?.contacts).toEqual([]);
  });

  it("diz qual arquivo e qual campo está faltando", () => {
    expect(() => parse("rota-segura.json", { ...valid, tagline: undefined })).toThrow(
      /rota-segura\.json: conteúdo inválido\.\n\s+- campo "tagline"/,
    );
  });

  it("aponta o campo dentro de uma lista", () => {
    const broken = {
      ...valid,
      authors: [{ name: "Ana", contacts: [{ kind: "github", url: "x" }] }],
    };
    expect(() => parse("a.json", broken)).toThrow(/campo "authors\.0\.contacts\.0\.url"/);
  });

  it("recusa projeto sem link de site nem de repo", () => {
    expect(() => parse("a.json", { ...valid, links: {} })).toThrow(/site ou repo/);
  });

  it("recusa campo desconhecido, para pegar erro de digitação", () => {
    expect(() => parse("a.json", { ...valid, taglin: "x" })).toThrow(ContentError);
  });

  it("recusa mídia que não existe em public/", () => {
    expect(() => parse("a.json", valid, () => false)).toThrow(
      /mídia não encontrado[\s\S]*\/projects\/rota-segura\/cover\.svg/,
    );
  });

  it("recusa nome de arquivo que não serve de URL", () => {
    expect(() => parse("Rota Segura.json", valid)).toThrow(/nome do arquivo/);
  });

  it("recusa JSON quebrado dizendo o arquivo", () => {
    expect(() => parseProject("a.json", "{", allMediaExists)).toThrow(/a\.json: JSON inválido/);
  });
});

describe("sortProjects", () => {
  it("ordena por order e depois por nome", () => {
    const projects = [
      parse("c.json", { ...valid, name: "Zeta", order: 2 }),
      parse("b.json", { ...valid, name: "Beta", order: 2 }),
      parse("a.json", { ...valid, name: "Alfa", order: 10 }),
    ];
    expect(sortProjects(projects).map((project) => project.name)).toEqual(["Beta", "Zeta", "Alfa"]);
  });
});
