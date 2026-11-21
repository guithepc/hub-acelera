"use client";

import { useReducedMotion } from "@/lib/use-reduced-motion";
import { useEffect, useRef, useState } from "react";

type Gate = { phase: "closed" } | { phase: "counting"; left: number } | { phase: "open" };

const storageKey = "hub-acelera:entered";
const tickMs = 380;
const exitMs = 900;

export const focusAfterOpenId = "inicio";

export const gateBootScript = `try{if(sessionStorage.getItem(${JSON.stringify(storageKey)}))document.documentElement.dataset.entered="true"}catch{}`;

function remember() {
  try {
    sessionStorage.setItem(storageKey, "1");
  } catch {
    return;
  }
}

export function EntryGate() {
  const [gate, setGate] = useState<Gate>({ phase: "closed" });
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (gate.phase !== "counting") return;
    const timer = setTimeout(() => {
      setGate(gate.left === 0 ? { phase: "open" } : { phase: "counting", left: gate.left - 1 });
    }, tickMs);
    return () => {
      clearTimeout(timer);
    };
  }, [gate]);

  useEffect(() => {
    if (gate.phase !== "open") return;
    remember();
    const anchor = document.getElementById(decodeURIComponent(window.location.hash.slice(1)));
    if (anchor) anchor.scrollIntoView({ behavior: "instant" });
    else window.scrollTo({ top: 0, behavior: "instant" });
    (anchor ?? document.getElementById(focusAfterOpenId))?.focus({ preventScroll: true });
    const timer = setTimeout(
      () => {
        document.documentElement.dataset.entered = "true";
      },
      reduceMotion ? 0 : exitMs,
    );
    return () => {
      clearTimeout(timer);
    };
  }, [gate.phase, reduceMotion]);

  const ignition = useRef<HTMLButtonElement>(null);
  const skip = useRef<HTMLButtonElement>(null);

  const trapped = gate.phase !== "open";
  const counting = gate.phase === "counting";

  useEffect(() => {
    if (!trapped || document.documentElement.dataset.entered === "true") return;
    (counting ? skip : ignition).current?.focus();

    function keepFocusInside(event: globalThis.KeyboardEvent) {
      if (event.key !== "Tab") return;
      event.preventDefault();
      const stops = counting ? [skip.current] : [ignition.current, skip.current];
      const next =
        stops[(stops.indexOf(document.activeElement as HTMLButtonElement) + 1) % stops.length];
      next?.focus();
    }
    document.addEventListener("keydown", keepFocusInside, true);
    return () => {
      document.removeEventListener("keydown", keepFocusInside, true);
    };
  }, [trapped, counting]);

  const count = gate.phase === "counting" ? gate.left : gate.phase === "open" ? 0 : 3;

  return (
    <div
      id="entry-gate"
      role="dialog"
      aria-modal="true"
      aria-label="Entrada do Hub Acelera"
      data-testid="entry-gate"
      data-phase={gate.phase}
      inert={gate.phase === "open"}
      className="bg-void fixed inset-0 z-40 grid place-items-center bg-[linear-gradient(var(--color-line)_1px,transparent_1px),linear-gradient(90deg,var(--color-line)_1px,transparent_1px)] bg-[size:100%_48px,48px_100%] transition-[clip-path] duration-900 ease-[cubic-bezier(0.7,0,0.2,1)] [clip-path:inset(0_0_0_0)] data-[phase=open]:pointer-events-none data-[phase=open]:[clip-path:inset(0_0_100%_0)]"
    >
      <div className="grid justify-items-center gap-6 text-center">
        <p className="label text-dim">Acelera Dev / Hub</p>
        <p
          aria-hidden="true"
          className="font-display text-amber text-[clamp(6rem,22vw,15rem)] leading-[0.85] font-black tabular-nums"
        >
          {String(count).padStart(2, "0")}
        </p>
        <button
          ref={ignition}
          type="button"
          aria-disabled={gate.phase !== "closed"}
          onClick={() => {
            if (gate.phase !== "closed") return;
            setGate(reduceMotion ? { phase: "open" } : { phase: "counting", left: 3 });
          }}
          className="label bg-amber text-void cursor-pointer rounded-full px-9 py-4 font-semibold shadow-[0_0_0_6px_rgb(255_181_71/0.18)] transition-shadow hover:shadow-[0_0_0_10px_rgb(255_181_71/0.22)] aria-disabled:cursor-default"
        >
          Ignição
        </button>
        <button
          ref={skip}
          type="button"
          onClick={() => {
            setGate({ phase: "open" });
          }}
          className="label text-dim hover:text-ink cursor-pointer transition-colors"
        >
          Entrar sem contagem
        </button>
      </div>
    </div>
  );
}
