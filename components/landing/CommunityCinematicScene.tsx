"use client";

import { useEffect, useRef } from "react";

/**
 * Living Network — decorative cinematic scene for the Community section.
 * Represents people connecting after discovering opportunities.
 * Deliberately slower and more organic than previous phases.
 */
export function CommunityCinematicScene() {
  const sceneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scene = sceneRef.current;
    const section = scene?.closest<HTMLElement>(".community-section");
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

    const panels = Array.from(section.querySelectorAll<HTMLElement>(".community-panel"));
    let frameId = 0;
    let currentX = 0;
    let currentY = 0;
    let targetX = 0;
    let targetY = 0;

    const clamp = (value: number) => Math.min(1, Math.max(0, value));

    const update = () => {
      const rect = section.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      const startTrigger = viewportHeight * 0.85;
      const endTrigger = -rect.height * 0.15;
      const totalScroll = startTrigger - endTrigger;

      const progress = clamp((startTrigger - rect.top) / Math.max(totalScroll, 1));

      // Slower cursor interpolation (0.04 vs 0.08 in Hero) for calmer feel
      currentX += (targetX - currentX) * 0.04;
      currentY += (targetY - currentY) * 0.04;

      section.style.setProperty("--cm-progress", progress.toFixed(3));
      scene.style.setProperty("--cursor-x", currentX.toFixed(3));
      scene.style.setProperty("--cursor-y", currentY.toFixed(3));

      // Panels revealed progressively with stagger
      panels.forEach((panel, index) => {
        const stepTrigger = 0.12 + index * 0.14;
        const panelProgress = clamp((progress - stepTrigger) / 0.18);
        panel.style.setProperty("--panel-progress", panelProgress.toFixed(3));
        panel.style.setProperty("--panel-y", `${Math.round((1 - panelProgress) * 35)}px`);
      });

      frameId = 0;
    };

    const requestUpdate = () => {
      if (!frameId) frameId = window.requestAnimationFrame(update);
    };

    const onPointerMove = (event: PointerEvent) => {
      targetX = (event.clientX / window.innerWidth - 0.5) * 2;
      targetY = (event.clientY / window.innerHeight - 0.5) * 2;
      requestUpdate();
    };

    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate, { passive: true });
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    requestUpdate();

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      window.removeEventListener("pointermove", onPointerMove);
    };
  }, []);

  return (
    <div ref={sceneRef} className="cm-cinematic-scene" aria-hidden="true">
      {/* Background: Atmospheric depth */}
      <div className="cm-scene-ambient" />

      {/* Midground: Living Network — nodes representing people */}
      <div className="cm-scene-network">
        <div className="cm-node cm-node-1" />
        <div className="cm-node cm-node-2" />
        <div className="cm-node cm-node-3" />
        <div className="cm-node cm-node-4" />
        <div className="cm-node cm-node-5" />

        {/* Connections between nodes */}
        <div className="cm-link cm-link-1" />
        <div className="cm-link cm-link-2" />
        <div className="cm-link cm-link-3" />
        <div className="cm-link cm-link-4" />
      </div>

      {/* Subtle atmospheric halo */}
      <div className="cm-scene-halo" />

      {/* Transition gradient to CTA */}
      <div className="cm-scene-transition-bottom" />
    </div>
  );
}
