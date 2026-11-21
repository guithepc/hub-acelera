"use client";

import { useReducedMotion } from "@/lib/use-reduced-motion";
import { motion, useMotionValue, useSpring } from "motion/react";
import Link from "next/link";
import { useState, type PointerEvent } from "react";
import type { Project } from "@/content/schema";

type ListProject = Pick<Project, "slug" | "name" | "tagline" | "cover" | "previewVideo"> & {
  authorNames: string[];
};

type Active =
  { kind: "none" } | { kind: "floating"; slug: string } | { kind: "inline"; slug: string };

const none: Active = { kind: "none" };
const previewWidth = 440;

export function ProjectList({ projects }: { projects: ListProject[] }) {
  const [active, setActive] = useState<Active>(none);
  const [lastPointer, setLastPointer] = useState<string>("mouse");
  const reduceMotion = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const spring = { stiffness: 380, damping: 32, mass: 0.5 };
  const springX = useSpring(x, spring);
  const springY = useSpring(y, spring);

  function follow(event: PointerEvent) {
    if (event.pointerType !== "mouse") return;
    const left = Math.min(event.clientX + 28, window.innerWidth - previewWidth - 16);
    x.set(Math.max(16, left));
    y.set(event.clientY - 140);

    const slug = (event.target as Element).closest<HTMLElement>("[data-slug]")?.dataset.slug;
    if (slug === undefined) return;
    setActive((current) => {
      if (current.kind === "floating" && current.slug === slug) return current;
      if (reduceMotion || current.kind !== "floating") {
        springX.jump(x.get());
        springY.jump(y.get());
      }
      return { kind: "floating", slug };
    });
  }

  return (
    <div
      onPointerMove={follow}
      onPointerLeave={(event) => {
        if (event.pointerType === "mouse") setActive(none);
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
                data-slug={project.slug}
                data-active={isActive}
                className="group grid touch-manipulation grid-cols-[2.5rem_1fr] items-baseline gap-x-3 px-5 py-7 outline-offset-[-2px] sm:grid-cols-[4rem_1fr_auto] sm:px-9 sm:py-9"
                onPointerDown={(event) => {
                  setLastPointer(event.pointerType);
                }}
                onFocus={(event) => {
                  if (event.currentTarget.matches(":focus-visible"))
                    setActive({ kind: "inline", slug: project.slug });
                }}
                onClick={(event) => {
                  if (lastPointer === "mouse" || isInline) return;
                  event.preventDefault();
                  setActive({ kind: "inline", slug: project.slug });
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
                      playing={isInline}
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
                playing={shown}
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
  playing,
  className = "",
  ...rest
}: {
  project: ListProject;
  playing: boolean;
  className?: string;
  "data-shown"?: boolean;
}) {
  const frame = `border-line bg-deep aspect-[16/10] rounded-lg border object-cover ${className}`;
  if (project.previewVideo && playing) {
    return (
      <video
        {...rest}
        className={frame}
        src={project.previewVideo}
        poster={project.cover}
        autoPlay
        muted
        loop
        playsInline
      />
    );
  }
  // eslint-disable-next-line @next/next/no-img-element -- static export, covers are plain files
  return <img {...rest} className={frame} src={project.cover} alt="" data-cover={project.slug} />;
}
