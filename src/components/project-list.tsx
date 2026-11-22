"use client";

import { useReducedMotion } from "@/lib/use-reduced-motion";
import { motion, useMotionValue, useSpring } from "motion/react";
import Link from "next/link";
import { useEffect, useRef, useState, type PointerEvent } from "react";
import type { Project } from "@/content/schema";

type ListProject = Pick<Project, "slug" | "name" | "tagline" | "cover" | "previewVideo"> & {
  authorNames: string[];
};

type Active =
  { kind: "none" } | { kind: "floating"; slug: string } | { kind: "inline"; slug: string };

const none: Active = { kind: "none" };
const previewWidth = 440;
const previewHeight = (previewWidth * 10) / 16;
const edge = 16;

export function ProjectList({ projects }: { projects: ListProject[] }) {
  const [active, setActive] = useState<Active>(none);
  const [lastPointer, setLastPointer] = useState<string>("mouse");
  const [floatingLoaded, setFloatingLoaded] = useState(false);
  const [inlineLoaded, setInlineLoaded] = useState<ReadonlySet<string>>(new Set());
  const reduceMotion = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const spring = { stiffness: 380, damping: 32, mass: 0.5 };
  const springX = useSpring(x, spring);
  const springY = useSpring(y, spring);

  const pointer = useRef({ x: 0, y: 0, inside: false });

  function showUnder(target: Element | null) {
    const slug = target?.closest<HTMLElement>("[data-slug]")?.dataset.slug;
    setActive((current) => {
      if (slug === undefined) return current.kind === "floating" ? none : current;
      if (current.kind === "floating" && current.slug === slug) return current;
      if (reduceMotion || current.kind !== "floating") {
        springX.jump(x.get());
        springY.jump(y.get());
      }
      return { kind: "floating", slug };
    });
  }

  function follow(event: PointerEvent) {
    if (event.pointerType !== "mouse") return;
    setFloatingLoaded(true);
    pointer.current = { x: event.clientX, y: event.clientY, inside: true };
    const left = Math.min(event.clientX + 28, window.innerWidth - previewWidth - edge);
    const top = Math.min(event.clientY - 140, window.innerHeight - previewHeight - edge);
    x.set(Math.max(edge, left));
    y.set(Math.max(edge, top));
    showUnder(event.target as Element);
  }

  const showUnderRef = useRef(showUnder);
  useEffect(() => {
    showUnderRef.current = showUnder;
  });
  useEffect(() => {
    function onScroll() {
      if (!pointer.current.inside) return;
      showUnderRef.current(document.elementFromPoint(pointer.current.x, pointer.current.y));
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  function openInline(slug: string) {
    setInlineLoaded((loaded) => (loaded.has(slug) ? loaded : new Set(loaded).add(slug)));
    setActive({ kind: "inline", slug });
  }

  return (
    <div
      onPointerMove={follow}
      onPointerLeave={(event) => {
        if (event.pointerType !== "mouse") return;
        pointer.current.inside = false;
        setActive(none);
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget))
          setActive((current) => (current.kind === "inline" ? none : current));
      }}
    >
      <ol className="border-line border-t">
        {projects.map((project, index) => {
          const isActive = active.kind !== "none" && active.slug === project.slug;
          const isInline = active.kind === "inline" && isActive;
          return (
            <li key={project.slug} className="border-line border-b" data-testid="project">
              <Link
                href={`/projetos/${project.slug}/`}
                prefetch={false}
                data-slug={project.slug}
                data-active={isActive}
                className="group grid touch-manipulation grid-cols-[2.5rem_1fr] items-baseline gap-x-3 px-5 py-7 outline-offset-[-2px] sm:grid-cols-[4rem_1fr_auto] sm:px-9 sm:py-9"
                onPointerDown={(event) => {
                  setLastPointer(event.pointerType);
                }}
                onFocus={(event) => {
                  if (event.currentTarget.matches(":focus-visible")) openInline(project.slug);
                }}
                onClick={(event) => {
                  if (lastPointer === "mouse" || isInline) return;
                  event.preventDefault();
                  openInline(project.slug);
                }}
              >
                <span className="label text-dim">{String(index + 1).padStart(2, "0")}</span>
                <span className="min-w-0">
                  <span className="font-display group-data-[active=true]:text-mint block text-3xl leading-none font-bold tracking-tight transition-[color,translate] duration-200 group-data-[active=true]:translate-x-2 sm:text-6xl">
                    {project.name}
                  </span>
                  <span className="text-soft mt-3 block max-w-xl text-base sm:text-lg">
                    {project.tagline}
                  </span>
                </span>
                <span className="label text-dim col-start-2 mt-3 sm:col-start-3 sm:mt-0 sm:text-right">
                  Por {project.authorNames.join(", ")}
                </span>
                <span
                  data-testid="inline-preview"
                  aria-hidden="true"
                  className="col-span-full grid transition-[grid-template-rows] duration-300 data-[open=false]:grid-rows-[0fr] data-[open=true]:grid-rows-[1fr]"
                  data-open={isInline}
                >
                  <span className="overflow-hidden">
                    <Preview
                      project={project}
                      load={inlineLoaded.has(project.slug)}
                      playing={isInline}
                      reduceMotion={reduceMotion}
                      className="mt-6 w-full max-w-xl"
                    />
                    <span className="label text-mint mt-3 block pb-1">
                      Toque de novo ou Enter para abrir →
                    </span>
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ol>

      <motion.div
        data-testid="floating-preview"
        data-open={active.kind === "floating"}
        aria-hidden="true"
        className="pointer-events-none fixed top-0 left-0 z-30 transition-opacity duration-150 data-[open=false]:opacity-0 data-[open=true]:opacity-100"
        style={{
          x: reduceMotion ? x : springX,
          y: reduceMotion ? y : springY,
          width: previewWidth,
        }}
      >
        <div className="grid">
          {projects.map((project) => {
            const shown = active.kind === "floating" && active.slug === project.slug;
            return (
              <Preview
                key={project.slug}
                project={project}
                load={floatingLoaded}
                playing={shown}
                reduceMotion={reduceMotion}
                data-shown={shown}
                className="col-start-1 row-start-1 shadow-2xl shadow-black/60 transition-opacity duration-150 data-[shown=false]:opacity-0"
              />
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}

function Preview({
  project,
  load,
  playing,
  reduceMotion,
  className = "",
  ...rest
}: {
  project: ListProject;
  load: boolean;
  playing: boolean;
  reduceMotion: boolean;
  className?: string;
  "data-shown"?: boolean;
}) {
  const frame = `border-line bg-deep aspect-[16/10] h-auto rounded-lg border object-cover ${className}`;
  if (!load) return <span {...rest} className={`block ${frame}`} data-cover={project.slug} />;
  if (project.previewVideo && playing && !reduceMotion) {
    return (
      <video
        {...rest}
        className={frame}
        src={project.previewVideo}
        poster={project.cover}
        data-cover={project.slug}
        autoPlay
        muted
        loop
        playsInline
      />
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element -- static export, covers are plain files
    <img
      {...rest}
      className={frame}
      src={project.cover}
      alt=""
      width={1600}
      height={1000}
      decoding="async"
      data-cover={project.slug}
    />
  );
}
