import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { initials, neighbors } from "@/content/neighbors";
import { getProjects } from "@/content/projects";
import type { Author, Contact } from "@/content/schema";
import { pageTitle } from "@/lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return getProjects().map((project) => ({ slug: project.slug }));
}

const contactLabels: Record<Contact["kind"], string> = {
  github: "GitHub",
  linkedin: "LinkedIn",
  site: "Site",
  instagram: "Instagram",
  email: "E-mail",
};

export async function generateMetadata({
  params,
}: PageProps<"/projetos/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjects().find((candidate) => candidate.slug === slug);
  if (!project) return {};
  return {
    title: pageTitle(project.name),
    description: project.tagline,
    alternates: { canonical: `/projetos/${project.slug}/` },
    openGraph: {
      type: "article",
      title: project.name,
      description: project.tagline,
      url: `/projetos/${project.slug}/`,
      images: [project.cover],
    },
    twitter: { card: "summary_large_image", images: [project.cover] },
  };
}

export default async function ProjectPage({ params }: PageProps<"/projetos/[slug]">) {
  const { slug } = await params;
  const projects = getProjects();
  const index = projects.findIndex((candidate) => candidate.slug === slug);
  const project = projects[index];
  if (!project) notFound();
  const around = neighbors(projects, index);
  const position = `${String(index + 1).padStart(2, "0")} / ${String(projects.length).padStart(2, "0")}`;

  return (
    <main className="flex-1 pt-28 sm:pt-36">
      <article>
        <header className="px-5 sm:px-9">
          <Link href="/projetos/" className="label text-dim hover:text-ink transition-colors">
            ← Todos os projetos
          </Link>
          <p className="label text-mint mt-10">Projeto {position}</p>
          <h1 className="font-display mt-4 text-5xl leading-[0.9] font-black tracking-tighter text-balance sm:text-8xl">
            {project.name}
          </h1>
          <p className="text-soft mt-6 max-w-2xl text-xl sm:text-2xl">{project.tagline}</p>
          <ProjectLinks links={project.links} />
        </header>

        {/* eslint-disable-next-line @next/next/no-img-element -- static export, covers are plain files */}
        <img
          src={project.cover}
          alt={`Tela do projeto ${project.name}`}
          width={1600}
          height={1000}
          className="border-line bg-deep mt-12 aspect-[16/10] h-auto w-full border-y object-cover sm:mt-16"
        />

        <div className="grid gap-12 px-5 py-16 sm:px-9 lg:grid-cols-[1fr_20rem] lg:gap-20">
          <div className="max-w-2xl">
            <section aria-labelledby="sobre">
              <h2 id="sobre" className="label text-dim">
                O que é
              </h2>
              <p className="mt-4 text-lg leading-relaxed sm:text-xl">{project.description}</p>
            </section>
            <section aria-labelledby="destaques" className="mt-14">
              <h2 id="destaques" className="label text-dim">
                Destaques
              </h2>
              <ol className="border-line mt-4 border-t">
                {project.highlights.map((highlight, highlightIndex) => (
                  <li
                    key={highlight}
                    className="border-line grid grid-cols-[2.5rem_1fr] border-b py-5 text-lg"
                  >
                    <span className="label text-mint pt-1.5">
                      {String(highlightIndex + 1).padStart(2, "0")}
                    </span>
                    {highlight}
                  </li>
                ))}
              </ol>
            </section>
          </div>
          <aside>
            <section aria-labelledby="stack">
              <h2 id="stack" className="label text-dim">
                Stack
              </h2>
              <ul className="mt-4 flex flex-wrap gap-2">
                {project.stack.map((technology) => (
                  <li key={technology} className="label border-line rounded-full border px-3 py-2">
                    {technology}
                  </li>
                ))}
              </ul>
            </section>
          </aside>
        </div>

        {project.screenshots.length > 0 && (
          <section aria-labelledby="telas" className="px-5 pb-16 sm:px-9">
            <h2 id="telas" className="label text-dim">
              Telas
            </h2>
            <ul className="mt-4 grid gap-4 sm:grid-cols-2">
              {project.screenshots.map((screenshot, screenshotIndex) => (
                <li key={screenshot}>
                  {/* eslint-disable-next-line @next/next/no-img-element -- static export */}
                  <img
                    src={screenshot}
                    alt={`${project.name}, tela ${String(screenshotIndex + 1)}`}
                    loading="lazy"
                    width={1600}
                    height={1000}
                    className="border-line bg-deep h-auto w-full rounded-lg border"
                  />
                </li>
              ))}
            </ul>
          </section>
        )}

        <section aria-labelledby="autores" className="border-line border-t px-5 py-16 sm:px-9">
          <h2 id="autores" className="font-display text-3xl font-bold tracking-tight sm:text-5xl">
            Quem construiu
          </h2>
          <ul className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {project.authors.map((author) => (
              <AuthorCard key={author.name} author={author} />
            ))}
          </ul>
        </section>
      </article>

      {around && (
        <nav aria-label="Outros projetos" className="border-line grid border-t sm:grid-cols-2">
          <NeighborLink label="← Anterior" project={around.previous} />
          <NeighborLink label="Próximo →" project={around.next} alignEnd />
        </nav>
      )}
    </main>
  );
}

function ProjectLinks({
  links,
}: {
  links: { site?: string | undefined; repo?: string | undefined };
}) {
  return (
    <ul className="mt-8 flex flex-wrap gap-3">
      {links.site && (
        <li>
          <a
            href={links.site}
            target="_blank"
            rel="noopener noreferrer"
            className="label bg-mint text-void inline-block rounded-full px-6 py-4 font-semibold"
          >
            Abrir o projeto ↗
          </a>
        </li>
      )}
      {links.repo && (
        <li>
          <a
            href={links.repo}
            target="_blank"
            rel="noopener noreferrer"
            className="label border-line hover:border-ink inline-block rounded-full border px-6 py-4 transition-colors"
          >
            Ver o código ↗
          </a>
        </li>
      )}
    </ul>
  );
}

function AuthorCard({ author }: { author: Author }) {
  return (
    <li className="border-line bg-deep flex gap-5 rounded-xl border p-6" data-testid="author">
      {author.avatar ? (
        // eslint-disable-next-line @next/next/no-img-element -- static export
        <img src={author.avatar} alt="" className="size-16 shrink-0 rounded-full object-cover" />
      ) : (
        <span
          aria-hidden="true"
          className="font-display bg-mint text-void grid size-16 shrink-0 place-items-center rounded-full text-lg font-bold"
        >
          {initials(author.name)}
        </span>
      )}
      <div className="min-w-0">
        <h3 className="text-xl font-medium">{author.name}</h3>
        {author.role && <p className="label text-dim mt-1">{author.role}</p>}
        {author.contacts.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
            {author.contacts.map((contact) => (
              <li key={contact.url}>
                <a
                  href={contact.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="label text-mint underline-offset-4 hover:underline"
                  aria-label={`${contactLabels[contact.kind]} de ${author.name}, abre em nova aba`}
                >
                  {contactLabels[contact.kind]} ↗
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </li>
  );
}

function NeighborLink({
  label,
  project,
  alignEnd = false,
}: {
  label: string;
  project: { slug: string; name: string };
  alignEnd?: boolean;
}) {
  return (
    <Link
      href={`/projetos/${project.slug}/`}
      className={`group border-line hover:bg-deep px-5 py-12 outline-offset-[-2px] transition-colors sm:px-9 sm:py-16 ${alignEnd ? "sm:border-l sm:text-right" : "border-b sm:border-b-0"}`}
    >
      <span className="label text-dim">{label}</span>
      <span className="font-display group-hover:text-mint mt-3 block text-2xl font-bold tracking-tight transition-colors sm:text-4xl">
        {project.name}
      </span>
    </Link>
  );
}
