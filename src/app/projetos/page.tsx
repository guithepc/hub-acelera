import type { Metadata } from "next";
import { ProjectList } from "@/components/project-list";
import { getListProjects } from "@/content/list";
import { pageTitle } from "@/lib/site";

export const metadata: Metadata = {
  title: pageTitle("Projetos"),
  description: "Os projetos construídos pela comunidade Acelera Dev e quem construiu cada um.",
};

export default function ProjectsPage() {
  const projects = getListProjects();

  return (
    <main className="flex-1 pt-28 pb-24 sm:pt-36">
      <div className="px-5 pb-10 sm:px-9 sm:pb-14">
        <p className="label text-mint">
          {String(projects.length).padStart(2, "0")} projetos em órbita
        </p>
        <h1 className="font-display mt-4 text-5xl leading-[0.9] font-black tracking-tighter sm:text-8xl">
          Projetos
        </h1>
      </div>
      <ProjectList projects={projects} />
    </main>
  );
}
