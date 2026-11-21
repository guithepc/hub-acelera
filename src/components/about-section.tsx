import { site } from "@/lib/site";

export function AboutSection() {
  return (
    <section
      id="sobre"
      aria-labelledby="sobre-titulo"
      className="border-line scroll-mt-8 border-t px-5 py-24 sm:px-9"
    >
      <p className="label text-mint">Sobre</p>
      <div className="mt-4 grid gap-10 lg:grid-cols-2 lg:gap-20">
        <h2
          id="sobre-titulo"
          className="font-display text-4xl leading-[0.95] font-black tracking-tighter text-balance sm:text-6xl"
        >
          Uma comunidade que constrói junto.
        </h2>
        <div className="max-w-xl">
          <p className="text-xl leading-relaxed">
            A Acelera Dev é uma comunidade para quem quer conquistar uma vaga em tecnologia. Lá
            dentro tem método para currículo, LinkedIn e entrevistas, e um Discord com alertas de
            vagas, eventos semanais e networking.
          </p>
          <p className="text-soft mt-5 text-lg leading-relaxed">
            Este hub mostra o que saiu de lá. Cada projeto tem uma página que diz o que ele faz,
            quem construiu e como falar com a pessoa.
          </p>
          <ul className="mt-9 flex flex-wrap gap-3">
            <li>
              <a
                href={site.communityUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="label bg-mint text-void inline-block rounded-full px-6 py-4 font-semibold"
              >
                Conhecer a comunidade ↗
              </a>
            </li>
            <li>
              <a
                href={site.addProjectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="label border-line hover:border-ink inline-block rounded-full border px-6 py-4 transition-colors"
              >
                Colocar meu projeto aqui ↗
              </a>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
