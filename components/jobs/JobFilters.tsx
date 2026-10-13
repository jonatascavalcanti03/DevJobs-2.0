"use client";

import { useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface JobFiltersProps {
  totalCount: number;
}

export function JobFilters({ totalCount }: JobFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentQ = searchParams.get("q") || "";
  const currentModality = searchParams.get("modality") || "";
  const currentLevel = searchParams.get("level") || "";
  const currentLocation = searchParams.get("location") || "";

  const hasActiveFilters = Boolean(currentQ || currentModality || currentLevel || currentLocation);

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "ALL") {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    startTransition(() => {
      const queryString = params.toString();
      router.push(queryString ? `/vagas?${queryString}` : "/vagas", { scroll: false });
    });
  };

  const handleReset = () => {
    startTransition(() => {
      router.push("/vagas", { scroll: false });
    });
  };

  return (
    <div className="vagas-filters-container" aria-label="Filtros de busca de vagas">
      {/* Barra de Busca Textual (RF20) */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const form = e.currentTarget;
          const input = form.elements.namedItem("q") as HTMLInputElement;
          updateFilters("q", input.value.trim());
        }}
        className="vagas-search-bar"
        role="search"
      >
        <div className="vagas-search-input-wrap">
          <svg
            className="vagas-search-icon"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="search"
            name="q"
            defaultValue={currentQ}
            placeholder="Buscar por cargo, competência ou palavra-chave..."
            className="vagas-search-input"
            aria-label="Buscar vagas por título ou descrição"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.currentTarget.form?.requestSubmit();
              }
            }}
          />
        </div>
        <button
          type="submit"
          className="btn btn-primary"
          style={{ height: "48px", minWidth: "110px" }}
          disabled={isPending}
        >
          {isPending ? "Buscando..." : "Buscar"}
        </button>
      </form>

      {/* Controles de Filtros Estruturados (RF21) */}
      <div className="vagas-filters-row">
        {/* Modalidade */}
        <select
          id="filter-modality"
          value={currentModality || "ALL"}
          onChange={(e) => updateFilters("modality", e.target.value)}
          className="vagas-filter-select"
          aria-label="Filtrar por modalidade de trabalho"
        >
          <option value="ALL">Todas as modalidades</option>
          <option value="REMOTE">Remoto</option>
          <option value="HYBRID">Híbrido</option>
          <option value="ON_SITE">Presencial</option>
        </select>

        {/* Nível de Senioridade */}
        <select
          id="filter-level"
          value={currentLevel || "ALL"}
          onChange={(e) => updateFilters("level", e.target.value)}
          className="vagas-filter-select"
          aria-label="Filtrar por senioridade"
        >
          <option value="ALL">Todos os níveis</option>
          <option value="JUNIOR">Júnior</option>
          <option value="PLENO">Pleno</option>
          <option value="SENIOR">Sênior</option>
          <option value="LEAD">Especialista / Lead</option>
        </select>

        {/* Localização rápida */}
        <input
          type="text"
          defaultValue={currentLocation}
          placeholder="Localização (ex: São Paulo)"
          className="vagas-filter-select"
          aria-label="Filtrar por localização"
          onBlur={(e) => updateFilters("location", e.target.value.trim())}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              updateFilters("location", e.currentTarget.value.trim());
            }
          }}
        />

        {/* Reset */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleReset}
            className="vagas-filter-reset-btn"
            aria-label="Limpar todos os filtros aplicados"
          >
            <svg
              width="14"
              height="14"
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
            Limpar filtros
          </button>
        )}
      </div>

      {/* Barra de Resultados */}
      <div className="vagas-results-bar" style={{ marginTop: "1rem" }}>
        <span className="vagas-results-count">
          {totalCount === 0 ? (
            "Nenhuma vaga encontrada"
          ) : totalCount === 1 ? (
            <><strong>1</strong> vaga disponível</>
          ) : (
            <><strong>{totalCount}</strong> vagas disponíveis</>
          )}
          {hasActiveFilters && " para os filtros selecionados"}
        </span>

        {isPending && <span style={{ color: "var(--color-electric-blue)" }}>Atualizando...</span>}
      </div>
    </div>
  );
}
