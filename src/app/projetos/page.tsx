import type { Metadata } from "next";
import { getProjects } from "@/content/projects";
import { pageTitle } from "@/lib/site";

export const metadata: Metadata = { title: pageTitle("Projetos") };

export default function ProjectsPage() {
  const projects = getProjects();

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 p-8">
      <h1 className="text-4xl font-semibold tracking-tight">Projetos</h1>
      <ul className="flex flex-col gap-6">
        {projects.map((project) => (
          <li key={project.slug} data-testid="project">
            <h2 className="text-2xl font-medium">{project.name}</h2>
            <p className="opacity-70">{project.tagline}</p>
            <p className="text-sm opacity-60">
              Por {project.authors.map((author) => author.name).join(", ")}
            </p>
          </li>
        ))}
      </ul>
    </main>
  );
}
