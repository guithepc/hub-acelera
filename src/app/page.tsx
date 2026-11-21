import { AboutSection } from "@/components/about-section";
import { EntryGate, focusAfterOpenId, gateBootScript } from "@/components/entry-gate";
import { ProjectList } from "@/components/project-list";
import { WarpField } from "@/components/warp-field";
import { getListProjects } from "@/content/list";

export default function Home() {
  const projects = getListProjects();
  const authors = new Set(projects.flatMap((project) => project.authorNames));

  return (
    <main className="flex-1">
      <script dangerouslySetInnerHTML={{ __html: gateBootScript }} />
      <noscript>
        <style>{"#entry-gate{display:none}html{overflow:auto!important}"}</style>
      </noscript>
      <EntryGate />

      <section className="relative isolate flex min-h-svh flex-col justify-center overflow-hidden px-5 pt-24 pb-28 sm:px-9">
        <WarpField />
        <div className="relative">
          <p className="label text-mint">
            {String(projects.length).padStart(2, "0")} projetos ·{" "}
            {String(authors.size).padStart(2, "0")} autores
          </p>
          <h1
            id={focusAfterOpenId}
            tabIndex={-1}
            className="font-display outline-none mt-5 text-[clamp(3.4rem,13.5vw,13.75rem)] leading-[0.84] font-black tracking-[-0.04em]"
          >
            Hub
            <br />
            <span className="text-mint">Acelera</span>
          </h1>
          <p className="text-soft mt-8 max-w-[30ch] text-xl leading-snug sm:text-2xl">
            O que a comunidade Acelera Dev construiu. E quem construiu.
          </p>
          <a
            href="#projetos"
            className="label text-mint border-mint hover:bg-mint hover:text-void mt-8 inline-block rounded-full border px-6 py-4 transition-colors"
          >
            Ver projetos ↓
          </a>
        </div>
        <p className="label text-dim absolute inset-x-5 bottom-7 hidden sm:inset-x-9 sm:block motion-reduce:hidden">
          Mova o cursor para pilotar · mova rápido para acelerar
        </p>
      </section>

      <section
        id="projetos"
        tabIndex={-1}
        aria-labelledby="projetos-titulo"
        className="scroll-mt-8 pt-20 pb-24 outline-none"
      >
        <div className="px-5 pb-10 sm:px-9 sm:pb-14">
          <p className="label text-mint">Em órbita</p>
          <h2
            id="projetos-titulo"
            className="font-display mt-4 text-5xl leading-[0.9] font-black tracking-tighter sm:text-8xl"
          >
            Projetos
          </h2>
        </div>
        <ProjectList projects={projects} />
      </section>

      <AboutSection />
    </main>
  );
}
