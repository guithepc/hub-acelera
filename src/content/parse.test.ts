import { describe, expect, it } from "vitest";
import { ContentError, parseProject, projectFileNames, sortProjects } from "./parse";

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

describe("endereços", () => {
  const withContact = (kind: string, url: string) => ({
    ...valid,
    authors: [{ name: "Ana", contacts: [{ kind, url }] }],
  });

  it.each(["javascript:alert(1)", "data:text/html,<b>x</b>", "file:///etc/passwd", "ftp://x.com"])(
    "recusa %s como link do projeto",
    (url) => {
      expect(() => parse("a.json", { ...valid, links: { site: url } })).toThrow(
        /campo "links\.site": use um endereço http ou https/,
      );
    },
  );

  it("recusa javascript: em contato", () => {
    expect(() => parse("a.json", withContact("github", "javascript:alert(1)"))).toThrow(
      /campo "authors\.0\.contacts\.0\.url"/,
    );
  });

  it("contato de e-mail só aceita mailto:", () => {
    expect(() => parse("a.json", withContact("email", "https://example.com"))).toThrow(/mailto/);
    expect(
      parse("a.json", withContact("email", "mailto:ana@example.com")).authors[0]?.contacts,
    ).toEqual([{ kind: "email", url: "mailto:ana@example.com" }]);
  });

  it("os outros contatos não aceitam mailto:", () => {
    expect(() => parse("a.json", withContact("site", "mailto:ana@example.com"))).toThrow(
      ContentError,
    );
  });
});

describe("projectFileNames", () => {
  it("devolve só os .json e ignora arquivos ocultos", () => {
    expect(projectFileNames(["b.json", ".DS_Store", "a.json"])).toEqual(["b.json", "a.json"]);
  });

  it.each(["copia.JSON", "rascunho.json.txt", "notas.md"])(
    "falha com %s em vez de ignorar em silêncio",
    (stray) => {
      expect(() => projectFileNames(["a.json", stray])).toThrow(
        new RegExp(stray.replace(".", "\\.")),
      );
    },
  );
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
