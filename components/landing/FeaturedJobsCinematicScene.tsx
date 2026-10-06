"use client";

import { useEffect, useRef } from "react";

/** Cinematic visual narrative for Featured Jobs (Opportunity Field). */
export function FeaturedJobsCinematicScene() {
  const sceneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scene = sceneRef.current;
    const section = scene?.closest<HTMLElement>(".featured-jobs-section");
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

    // Identify if it's the empty state or populated state
    const track = section.querySelector<HTMLElement>(".featured-jobs-track");
    const cards = track ? Array.from(track.querySelectorAll<HTMLElement>(".job-card")) : [];
    
    let frameId = 0;
    let currentX = 0;
    let currentY = 0;
    let targetX = 0;
    let targetY = 0;

    const clamp = (value: number) => Math.min(1, Math.max(0, value));
    
    const update = () => {
      const rect = section.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      
      // Calculate progress starting when section enters bottom, ending when it leaves top
      const startTrigger = viewportHeight * 0.8;
      const endTrigger = -rect.height * 0.2;
      const totalScroll = startTrigger - endTrigger;
      
      const progress = clamp((startTrigger - rect.top) / Math.max(totalScroll, 1));
      
      currentX += (targetX - currentX) * 0.05;
      currentY += (targetY - currentY) * 0.05;

      section.style.setProperty("--fj-progress", progress.toFixed(3));
      scene.style.setProperty("--cursor-x", currentX.toFixed(3));
      scene.style.setProperty("--cursor-y", currentY.toFixed(3));
      
      // Real jobs cards appearance synced with scroll progress (Perspective entry)
      if (cards.length > 0) {
        cards.forEach((card, index) => {
          const stepTrigger = 0.1 + (index * 0.05); // Rapid stagger for horizontal layout
          const cardProgress = clamp((progress - stepTrigger) / 0.15);
          
          card.style.setProperty("--job-progress", cardProgress.toFixed(3));
          card.style.setProperty("--job-y", `${Math.round((1 - cardProgress) * 30)}px`);
          card.style.setProperty("--job-rotate", `${((1 - cardProgress) * 8).toFixed(2)}deg`);
        });
      }

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
    <div ref={sceneRef} className="fj-cinematic-scene" aria-hidden="true">
      {/* Background Depth: Space/Field representation */}
      <div className="fj-scene-ambient" />
      <div className="fj-scene-field-grid" />
      
      {/* Dynamic Network Points (Opportunities) */}
      <div className="fj-scene-points">
        <div className="fj-point fj-point-1" />
        <div className="fj-point fj-point-2" />
        <div className="fj-point fj-point-3" />
        <div className="fj-point fj-point-4" />
        <div className="fj-point fj-point-5" />
        <div className="fj-point fj-point-6" />
        <div className="fj-point fj-point-7" />
      </div>

      {/* Halos and Atmospheric glows */}
      <div className="fj-scene-glow fj-glow-primary" />
      <div className="fj-scene-glow fj-glow-secondary" />

      {/* Transition boundary to the next section (Community) */}
      <div className="fj-scene-transition-bottom" />
    </div>
  );
}
