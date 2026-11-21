"use client";

import { useReducedMotion } from "@/lib/use-reduced-motion";
import { useEffect, useRef } from "react";

type Star = { x: number; y: number; z: number };

const starCount = 420;
const idleAfterMs = 2500;

function randomStar(z: number): Star {
  return { x: Math.random() * 2 - 1, y: Math.random() * 2 - 1, z };
}

export function WarpField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    const stars = Array.from({ length: starCount }, () => randomStar(Math.random() * 0.98 + 0.02));
    const pointer = { x: 0.5, y: 0.5, speed: 0, movedAt: -idleAfterMs };
    const center = { x: 0.5, y: 0.5 };
    let frame = 0;
    let previous = performance.now();
    let visible = true;

    function resize() {
      if (!canvas) return;
      const ratio = Math.min(window.devicePixelRatio, 2);
      canvas.width = canvas.clientWidth * ratio;
      canvas.height = canvas.clientHeight * ratio;
      if (reduceMotion) drawStill();
    }

    function project(star: Star, z: number, width: number, height: number) {
      return {
        x: center.x * width + (star.x / z) * width * 0.5,
        y: center.y * height + (star.y / z) * width * 0.5,
      };
    }

    function drawStill() {
      if (!canvas || !context) return;
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = "rgb(233 236 245 / 0.8)";
      for (const star of stars) {
        const point = project(star, star.z, canvas.width, canvas.height);
        const size = (1 - star.z) * 2.2 + 0.4;
        context.fillRect(point.x, point.y, size, size);
      }
    }

    function draw(now: number) {
      frame = requestAnimationFrame(draw);
      if (!canvas || !context || !visible) {
        previous = now;
        return;
      }
      const elapsed = Math.min(0.05, (now - previous) / 1000);
      previous = now;

      if (now - pointer.movedAt > idleAfterMs) {
        pointer.x = 0.5 + Math.cos(now / 2600) * 0.2;
        pointer.y = 0.5 + Math.sin(now / 3400) * 0.16;
      }
      pointer.speed *= 0.94;
      center.x += (pointer.x - center.x) * 0.06;
      center.y += (pointer.y - center.y) * 0.06;

      const { width, height } = canvas;
      const ratio = Math.min(window.devicePixelRatio, 2);
      const velocity = 0.12 + pointer.speed * 1.6;
      context.fillStyle = `rgb(4 5 13 / ${String(0.42 - pointer.speed * 0.28)})`;
      context.fillRect(0, 0, width, height);
      context.strokeStyle =
        pointer.speed > 0.35 ? "rgb(92 242 176 / 0.9)" : "rgb(233 236 245 / 0.85)";

      for (const star of stars) {
        const from = star.z;
        star.z -= velocity * elapsed;
        if (star.z <= 0.02) {
          Object.assign(star, randomStar(1));
          continue;
        }
        const start = project(star, from, width, height);
        const end = project(star, star.z, width, height);
        context.lineWidth = (1 - star.z) * 2.4 * ratio;
        context.beginPath();
        context.moveTo(start.x, start.y);
        context.lineTo(end.x, end.y + 0.5);
        context.stroke();
      }
    }

    function onPointerMove(event: PointerEvent) {
      if (!canvas) return;
      const box = canvas.getBoundingClientRect();
      const x = (event.clientX - box.left) / box.width;
      const y = (event.clientY - box.top) / box.height;
      pointer.speed = Math.min(1, pointer.speed + Math.hypot(x - pointer.x, y - pointer.y) * 4);
      pointer.x = x;
      pointer.y = y;
      pointer.movedAt = performance.now();
    }

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? true;
    });
    observer.observe(canvas);
    window.addEventListener("resize", resize);
    resize();

    if (!reduceMotion) {
      window.addEventListener("pointermove", onPointerMove);
      frame = requestAnimationFrame(draw);
    }

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
    };
  }, [reduceMotion]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      data-testid="warp-field"
      data-animated={!reduceMotion}
      className="absolute inset-0 size-full"
    />
  );
}
