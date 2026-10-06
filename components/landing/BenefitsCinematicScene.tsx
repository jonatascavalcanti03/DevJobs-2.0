"use client";

import { useEffect, useRef } from "react";

/** Decorative, scroll-linked layer kept separate from the semantic Benefits content. */
export function BenefitsCinematicScene() {
  const sceneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scene = sceneRef.current;
    const section = scene?.closest<HTMLElement>(".benefits-section");
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

    const header = section.querySelector<HTMLElement>(".benefits-header");
    const cards = Array.from(section.querySelectorAll<HTMLElement>(".benefits-column"));
    let frameId = 0;

    const clamp = (value: number) => Math.min(1, Math.max(0, value));
    const update = () => {
      const rect = section.getBoundingClientRect();
      const revealDistance = Math.min(rect.height * 0.58, window.innerHeight * 1.1);
      const progress = clamp((window.innerHeight - rect.top) / revealDistance);
      const headerProgress = clamp((progress - 0.05) / 0.5);

      section.style.setProperty("--benefits-progress", progress.toFixed(3));
      section.style.setProperty("--benefits-core-opacity", (0.18 + progress * 0.62).toFixed(3));
      section.style.setProperty("--benefits-core-scale", (0.78 + progress * 0.32).toFixed(3));
      section.style.setProperty("--benefits-line-opacity", (0.18 + progress * 0.65).toFixed(3));

      if (header) {
        header.style.setProperty("--benefits-header-opacity", headerProgress.toFixed(3));
        header.style.setProperty("--benefits-header-y", `${Math.round((1 - headerProgress) * 28)}px`);
      }

      cards.forEach((card, index) => {
        const cardProgress = clamp((progress - 0.22 - index * 0.16) / 0.52);
        card.style.setProperty("--benefits-card-opacity", cardProgress.toFixed(3));
        card.style.setProperty("--benefits-card-y", `${Math.round((1 - cardProgress) * (42 + index * 10))}px`);
        card.style.setProperty("--benefits-card-tilt", `${((1 - cardProgress) * (index ? 0.65 : -0.65)).toFixed(2)}deg`);
      });

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
    <div ref={sceneRef} className="benefits-cinematic-scene" aria-hidden="true">
      <div className="benefits-scene-core"><span /><i /></div>
      <div className="benefits-scene-line benefits-scene-line-one" />
      <div className="benefits-scene-line benefits-scene-line-two" />
      <div className="benefits-scene-particles"><span /><span /><span /><span /></div>
    </div>
  );
}
