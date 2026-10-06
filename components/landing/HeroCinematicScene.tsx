"use client";

import { useEffect, useRef } from "react";

/**
 * A GPU-friendly CSS 3D scene. The content stays outside this component so the
 * visual layer can be reduced without affecting the landing page's meaning.
 */
export function HeroCinematicScene() {
  const sceneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    const matchMedia = window.matchMedia?.bind(window);
    const reduceMotion = matchMedia?.("(prefers-reduced-motion: reduce)");
    const limitedDevice =
      !matchMedia ||
      reduceMotion?.matches === true ||
      (navigator.hardwareConcurrency !== undefined && navigator.hardwareConcurrency <= 4);

    if (limitedDevice) {
      scene.dataset.mode = "static";
      return;
    }

    let frameId = 0;
    let currentX = 0;
    let currentY = 0;
    let targetX = 0;
    let targetY = 0;

    const update = () => {
      const hero = scene.closest<HTMLElement>(".hero-section");
      if (!hero) return;

      const rect = hero.getBoundingClientRect();
      const progress = Math.min(1, Math.max(0, -rect.top / Math.max(rect.height, 1)));
      currentX += (targetX - currentX) * 0.08;
      currentY += (targetY - currentY) * 0.08;

      scene.style.setProperty("--scene-progress", progress.toFixed(3));
      hero.style.setProperty("--scene-progress", progress.toFixed(3));
      scene.style.setProperty("--cursor-x", currentX.toFixed(3));
      scene.style.setProperty("--cursor-y", currentY.toFixed(3));
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
    <div ref={sceneRef} className="hero-cinematic-scene" aria-hidden="true">
      <div className="hero-scene-aura" />
      <div className="hero-scene-grid" />
      <div className="hero-scene-orbit hero-scene-orbit-back" />
      <div className="hero-scene-orbit hero-scene-orbit-front" />
      <div className="hero-scene-connection hero-scene-connection-one" />
      <div className="hero-scene-connection hero-scene-connection-two" />
      <div className="hero-scene-node hero-scene-node-one"><span /></div>
      <div className="hero-scene-node hero-scene-node-two"><span /></div>
      <div className="hero-scene-node hero-scene-node-three"><span /></div>
      <div className="hero-scene-card hero-scene-card-profile">
        <span className="hero-scene-avatar" />
        <i /><i /><i />
      </div>
      <div className="hero-scene-card hero-scene-card-opportunity">
        <b />
        <i /><i />
      </div>
      <div className="hero-scene-core">
        <span className="hero-scene-core-ring" />
        <span className="hero-scene-core-ring hero-scene-core-ring-inner" />
        <span className="hero-scene-core-light" />
      </div>
      <div className="hero-scene-particles">
        <span /><span /><span /><span /><span />
      </div>
      <div className="hero-scene-transition" />
    </div>
  );
}
