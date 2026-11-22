import { mediaPaths, projectFileSchema, type Project } from "./schema";

export class ContentError extends Error {
  override name = "ContentError";
}

const slugPattern = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export function parseProject(
  fileName: string,
  raw: string,
  mediaExists: (publicPath: string) => boolean,
): Project {
  const slug = fileName.replace(/\.json$/, "");
  if (!slugPattern.test(slug)) {
    throw new ContentError(
      `${fileName}: o nome do arquivo vira a URL do projeto. Use só minúsculas, números e hífen.`,
    );
  }

  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch (error) {
    throw new ContentError(`${fileName}: JSON inválido. ${String(error)}`);
  }

  const result = projectFileSchema.safeParse(json);
  if (!result.success) {
    const problems = result.error.issues.map(
      (issue) => `  - campo "${issue.path.join(".") || "(raiz)"}": ${issue.message}`,
    );
    throw new ContentError(`${fileName}: conteúdo inválido.\n${problems.join("\n")}`);
  }

  const missing = mediaPaths(result.data).filter((path) => !mediaExists(path));
  if (missing.length > 0) {
    throw new ContentError(
      `${fileName}: arquivo de mídia não encontrado em public/.\n${missing.map((path) => `  - ${path}`).join("\n")}`,
    );
  }

  return { ...result.data, slug };
}

export function projectFileNames(entries: readonly string[]): string[] {
  const stray = entries.filter((entry) => !entry.startsWith(".") && !entry.endsWith(".json"));
  if (stray.length > 0) {
    throw new ContentError(
      `content/projects só aceita arquivos .json, em minúsculas. Renomeie ou remova:\n${stray.map((entry) => `  - ${entry}`).join("\n")}`,
    );
  }
  return entries.filter((entry) => entry.endsWith(".json"));
}

export function sortProjects(projects: Project[]): Project[] {
  return projects.toSorted((a, b) => a.order - b.order || a.name.localeCompare(b.name, "pt-BR"));
}
