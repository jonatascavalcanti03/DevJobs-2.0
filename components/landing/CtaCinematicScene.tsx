"use client";

import { useEffect, useRef } from "react";

/**
 * Convergence scene for the CTA final section.
 * The network nodes converge toward the center, creating a focal pull
 * toward action. Deliberately minimal — a quiet crescendo, not fireworks.
 */
export function CtaCinematicScene() {
  const sceneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scene = sceneRef.current;
    const section = scene?.closest<HTMLElement>(".cta-section");
    if (!scene || !section) return;

    const matchMedia = window.matchMedia?.bind(window);
    const limitedDevice =
      !matchMedia ||
      matchMedia("(prefers-reduced-motion: reduce)").matches ||
      (navigator.hardwareConcurrency !== undefined && navigator.hardwareConcurrency <= 4);

    if (limitedDevice) {
      scene.dataset.mode = "static";
      section.dataset.mode = "static";
      return;
    }

    let frameId = 0;

    const clamp = (value: number) => Math.min(1, Math.max(0, value));

    const update = () => {
      const rect = section.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      const startTrigger = viewportHeight * 0.8;
      const endTrigger = -rect.height * 0.3;
      const totalScroll = startTrigger - endTrigger;

      const progress = clamp((startTrigger - rect.top) / Math.max(totalScroll, 1));

      section.style.setProperty("--cta-progress", progress.toFixed(3));

      frameId = 0;
    };

    const requestUpdate = () => {
      if (!frameId) frameId = window.requestAnimationFrame(update);
    };

    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate, { passive: true });
    requestUpdate();

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
    };
  }, []);

  return (
    <div ref={sceneRef} className="cta-cinematic-scene" aria-hidden="true">
      {/* Convergence halo — focal pull toward center */}
      <div className="cta-scene-focus" />

      {/* Subtle radial lines converging to center */}
      <div className="cta-scene-rays" />

      {/* Ambient atmosphere */}
      <div className="cta-scene-ambient" />
    </div>
  );
}
