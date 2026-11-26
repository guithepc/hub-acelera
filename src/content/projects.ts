import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { cache } from "react";
import { parseProject, projectFileNames, sortProjects } from "./parse";
import type { Project } from "./schema";

const projectsDir = join(process.cwd(), "content", "projects");
const publicDir = join(process.cwd(), "public");

export const getProjects = cache((): Project[] =>
  sortProjects(
    projectFileNames(readdirSync(projectsDir)).map((fileName) =>
      parseProject(fileName, readFileSync(join(projectsDir, fileName), "utf8"), (publicPath) =>
        existsSync(join(publicDir, publicPath)),
      ),
    ),
  ),
);
