"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fechar menu mobile com tecla Escape e gerenciar foco acessível
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && mobileMenuOpen) {
        setMobileMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };

    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [mobileMenuOpen]);

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
    menuButtonRef.current?.focus();
  };

  return (
    <header className={`site-header ${isScrolled ? "scrolled" : ""}`}>
      <div className="container header-container">
        {/* Logo */}
        <Link href="/" className="header-logo" aria-label="DevJobs 2.0 Início">
          <div className="header-logo-icon" aria-hidden="true">
            DJ
          </div>
          <span>
            DevJobs<span className="header-logo-badge">2.0</span>
          </span>
        </Link>

        {/* Navegação Desktop */}
        <nav className="header-nav" aria-label="Navegação principal">
          <Link href="#beneficios" className="header-nav-link">
            Benefícios
          </Link>
          <Link href="#como-funciona" className="header-nav-link">
            Como funciona
          </Link>
          <Link href="#vagas" className="header-nav-link">
            Vagas em destaque
          </Link>
          <Link href="#comunidade" className="header-nav-link">
            Comunidade
          </Link>
        </nav>

        {/* Ações Desktop */}
        <div className="header-actions">
          <Link href="#vagas" className="btn btn-primary" style={{ padding: "0.55rem 1.15rem", fontSize: "0.875rem" }}>
            Explorar vagas
          </Link>
          <Link href="/login" className="btn btn-ghost" style={{ padding: "0.55rem 1rem", fontSize: "0.875rem" }}>
            Entrar
          </Link>

          {/* Botão Mobile */}
          <button
            ref={menuButtonRef}
            type="button"
            className="mobile-menu-btn"
            aria-label={mobileMenuOpen ? "Fechar menu de navegação" : "Abrir menu de navegação"}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-drawer"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              {mobileMenuOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </>
              ) : (
                <>
                  <line x1="4" y1="7" x2="20" y2="7" />
                  <line x1="4" y1="12" x2="20" y2="12" />
                  <line x1="4" y1="17" x2="20" y2="17" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Drawer Overlay Mobile */}
      <div
        className={`mobile-drawer-overlay ${mobileMenuOpen ? "open" : ""}`}
        onClick={closeMobileMenu}
        aria-hidden="true"
      />

      {/* Drawer Mobile */}
      <div
        id="mobile-drawer"
        ref={drawerRef}
        className={`mobile-drawer ${mobileMenuOpen ? "open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Menu principal de navegação"
      >
        <div className="mobile-drawer-header">
          <div className="header-logo">
            <div className="header-logo-icon" aria-hidden="true">
              DJ
            </div>
            <span>DevJobs 2.0</span>
          </div>
          <button
            type="button"
            className="btn btn-ghost"
            style={{ width: "44px", height: "44px", padding: 0 }}
            aria-label="Fechar menu"
            onClick={closeMobileMenu}
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <nav className="mobile-drawer-nav" aria-label="Links do menu mobile">
          <Link href="#beneficios" className="mobile-nav-link" onClick={closeMobileMenu}>
            Benefícios
          </Link>
          <Link href="#como-funciona" className="mobile-nav-link" onClick={closeMobileMenu}>
            Como funciona
          </Link>
          <Link href="#vagas" className="mobile-nav-link" onClick={closeMobileMenu}>
            Vagas em destaque
          </Link>
          <Link href="#comunidade" className="mobile-nav-link" onClick={closeMobileMenu}>
            Comunidade
          </Link>
        </nav>

        <div className="mobile-drawer-actions">
          <Link href="#vagas" className="btn btn-primary" onClick={closeMobileMenu}>
            Explorar vagas
          </Link>
          <Link href="/login" className="btn btn-secondary" onClick={closeMobileMenu}>
            Entrar na conta
          </Link>
        </div>
      </div>
    </header>
  );
}
