import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { cache } from "react";
import { parseProject, sortProjects } from "./parse";
import type { Project } from "./schema";

const projectsDir = join(process.cwd(), "content", "projects");
const publicDir = join(process.cwd(), "public");

export const getProjects = cache((): Project[] =>
  sortProjects(
    readdirSync(projectsDir)
      .filter((fileName) => fileName.endsWith(".json"))
      .map((fileName) =>
        parseProject(fileName, readFileSync(join(projectsDir, fileName), "utf8"), (publicPath) =>
          existsSync(join(publicDir, publicPath)),
        ),
      ),
  ),
);
