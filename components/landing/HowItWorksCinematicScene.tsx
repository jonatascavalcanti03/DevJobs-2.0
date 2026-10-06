"use client";

import { useEffect, useRef } from "react";

/** Cinematic visual narrative for How It Works phase. */
export function HowItWorksCinematicScene() {
  const sceneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scene = sceneRef.current;
    const section = scene?.closest<HTMLElement>(".how-it-works-section");
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

    const cards = Array.from(section.querySelectorAll<HTMLElement>(".step-card"));
    let frameId = 0;
    let currentX = 0;
    let currentY = 0;
    let targetX = 0;
    let targetY = 0;

    const clamp = (value: number) => Math.min(1, Math.max(0, value));
    
    const update = () => {
      const rect = section.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      
      // Start slightly before section enters, end when it leaves viewport
      const startTrigger = viewportHeight * 0.9;
      const endTrigger = -rect.height * 0.1;
      const totalScroll = startTrigger - endTrigger;
      
      const progress = clamp((startTrigger - rect.top) / Math.max(totalScroll, 1));
      
      currentX += (targetX - currentX) * 0.08;
      currentY += (targetY - currentY) * 0.08;

      section.style.setProperty("--hiw-progress", progress.toFixed(3));
      scene.style.setProperty("--cursor-x", currentX.toFixed(3));
      scene.style.setProperty("--cursor-y", currentY.toFixed(3));
      
      // Cards appearance synced with scroll progress
      cards.forEach((card, index) => {
        const stepTrigger = 0.15 + (index * 0.12);
        const cardProgress = clamp((progress - stepTrigger) / 0.15);
        card.style.setProperty("--card-progress", cardProgress.toFixed(3));
        card.style.setProperty("--card-y", `${Math.round((1 - cardProgress) * 40)}px`);
        card.style.setProperty("--card-scale", (0.95 + cardProgress * 0.05).toFixed(3));
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
    <div ref={sceneRef} className="hiw-cinematic-scene" aria-hidden="true">
      {/* Background: Depth and transition from Benefits */}
      <div className="hiw-scene-bg-grid" />
      <div className="hiw-scene-ambient-light" />
      
      {/* Midground: Constellation / Network lines */}
      <div className="hiw-scene-connections">
        <div className="hiw-connection-line hiw-line-1" />
        <div className="hiw-connection-line hiw-line-2" />
        <div className="hiw-connection-line hiw-line-3" />
      </div>

      {/* Foreground: The 3 main actors representing Profile, Opportunity and System */}
      <div className="hiw-node hiw-node-profile">
        <div className="hiw-node-core" />
        <div className="hiw-node-ring" />
      </div>
      
      <div className="hiw-node hiw-node-system">
        <div className="hiw-node-core" />
        <div className="hiw-node-pulse" />
      </div>

      <div className="hiw-node hiw-node-opportunity">
        <div className="hiw-node-core" />
        <div className="hiw-node-ring" />
      </div>

      {/* Decorative floating particles for depth */}
      <div className="hiw-scene-particles">
        <span /><span /><span /><span /><span />
      </div>

      {/* Seamless transition to next section */}
      <div className="hiw-scene-transition-bottom" />
    </div>
  );
}
