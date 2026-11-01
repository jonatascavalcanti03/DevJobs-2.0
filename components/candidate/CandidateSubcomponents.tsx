"use client";

import { useState } from "react";
import {
  addExperience,
  removeExperience,
  addEducation,
  removeEducation,
  addCertification,
  removeCertification,
  addLanguage,
  removeLanguage,
  addSkill,
  removeSkill,
  addProject,
  removeProject,
} from "@/lib/actions/candidate-profile";

interface SubcomponentsProps {
  experiences: Array<{
    id: string;
    company_name: string;
    title: string;
    start_date: string;
    end_date: string | null;
    description: string | null;
  }>;
  educations: Array<{
    id: string;
    institution: string;
    degree: string;
    field_of_study: string | null;
    start_date: string;
    end_date: string | null;
  }>;
  certifications: Array<{
    id: string;
    name: string;
    issuing_organization: string;
    issue_date: string;
    expiration_date: string | null;
  }>;
  languages: Array<{
    id: string;
    language_name: string;
    proficiency_level: string;
  }>;
  skills?: Array<{
    id: string;
    name: string;
  }>;
  projects?: Array<{
    id: string;
    name: string;
    description: string | null;
    url: string | null;
  }>;
}

export function CandidateSubcomponents({
  experiences,
  educations,
  certifications,
  languages,
  skills = [],
  projects = [],
}: SubcomponentsProps) {
  const [activeTab, setActiveTab] = useState<"exp" | "edu" | "cert" | "lang" | "skills" | "proj">("skills");
  const [showAddExp, setShowAddExp] = useState(false);
  const [showAddEdu, setShowAddEdu] = useState(false);
  const [showAddCert, setShowAddCert] = useState(false);
  const [showAddLang, setShowAddLang] = useState(false);
  const [showAddSkill, setShowAddSkill] = useState(false);
  const [showAddProj, setShowAddProj] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleAddExp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    setError(null);
    const form = e.currentTarget;
    const res = await addExperience(new FormData(form));
    if (res?.error) setError(res.error);
    else {
      form.reset();
      setShowAddExp(false);
    }
    setIsPending(false);
  };

  const handleAddEdu = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    setError(null);
    const form = e.currentTarget;
    const res = await addEducation(new FormData(form));
    if (res?.error) setError(res.error);
    else {
      form.reset();
      setShowAddEdu(false);
    }
    setIsPending(false);
  };

  const handleAddCert = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    setError(null);
    const form = e.currentTarget;
    const res = await addCertification(new FormData(form));
    if (res?.error) setError(res.error);
    else {
      form.reset();
      setShowAddCert(false);
    }
    setIsPending(false);
  };

  const handleAddLang = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    setError(null);
    const form = e.currentTarget;
    const res = await addLanguage(new FormData(form));
    if (res?.error) setError(res.error);
    else {
      form.reset();
      setShowAddLang(false);
    }
    setIsPending(false);
  };

  const handleRemoveExp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    setError(null);
    const res = await removeExperience(new FormData(e.currentTarget));
    if (res?.error) setError(res.error);
    setIsPending(false);
  };

  const handleRemoveEdu = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    setError(null);
    const res = await removeEducation(new FormData(e.currentTarget));
    if (res?.error) setError(res.error);
    setIsPending(false);
  };

  const handleRemoveCert = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    setError(null);
    const res = await removeCertification(new FormData(e.currentTarget));
    if (res?.error) setError(res.error);
    setIsPending(false);
  };

  const handleRemoveLang = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    setError(null);
    const res = await removeLanguage(new FormData(e.currentTarget));
    if (res?.error) setError(res.error);
    setIsPending(false);
  };

  const handleAddSkill = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    setError(null);
    setSuccess(null);
    const form = e.currentTarget;
    const res = await addSkill(new FormData(form));
    if (res?.error) setError(res.error);
    else {
      form.reset();
      setShowAddSkill(false);
      setSuccess("Competência adicionada com sucesso!");
    }
    setIsPending(false);
  };

  const handleRemoveSkill = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    setError(null);
    setSuccess(null);
    const res = await removeSkill(new FormData(e.currentTarget));
    if (res?.error) setError(res.error);
    else setSuccess("Competência removida com sucesso!");
    setIsPending(false);
  };

  const handleAddProj = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    setError(null);
    setSuccess(null);
    const form = e.currentTarget;
    const res = await addProject(new FormData(form));
    if (res?.error) setError(res.error);
    else {
      form.reset();
      setShowAddProj(false);
      setSuccess("Projeto adicionado ao portfólio!");
    }
    setIsPending(false);
  };

  const handleRemoveProj = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    setError(null);
    setSuccess(null);
    const res = await removeProject(new FormData(e.currentTarget));
    if (res?.error) setError(res.error);
    else setSuccess("Projeto removido!");
    setIsPending(false);
  };

  return (
    <div className="candidate-subcomponents" style={{ marginTop: "var(--space-6)" }}>
      {/* Abas dos Subcomponentes (RF06) */}
      <div className="role-selector" role="tablist" style={{ marginBottom: "var(--space-4)", flexWrap: "wrap", gap: "var(--space-2)" }}>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "skills"}
          className={`role-btn ${activeTab === "skills" ? "active" : ""}`}
          onClick={() => { setActiveTab("skills"); setError(null); setSuccess(null); }}
        >
          Competências ({skills.length})
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "proj"}
          className={`role-btn ${activeTab === "proj" ? "active" : ""}`}
          onClick={() => { setActiveTab("proj"); setError(null); setSuccess(null); }}
        >
          Projetos ({projects.length})
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "exp"}
          className={`role-btn ${activeTab === "exp" ? "active" : ""}`}
          onClick={() => { setActiveTab("exp"); setError(null); setSuccess(null); }}
        >
          Experiências ({experiences.length})
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "edu"}
          className={`role-btn ${activeTab === "edu" ? "active" : ""}`}
          onClick={() => { setActiveTab("edu"); setError(null); setSuccess(null); }}
        >
          Formação ({educations.length})
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "cert"}
          className={`role-btn ${activeTab === "cert" ? "active" : ""}`}
          onClick={() => { setActiveTab("cert"); setError(null); setSuccess(null); }}
        >
          Certificações ({certifications.length})
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "lang"}
          className={`role-btn ${activeTab === "lang" ? "active" : ""}`}
          onClick={() => { setActiveTab("lang"); setError(null); setSuccess(null); }}
        >
          Idiomas ({languages.length})
        </button>
      </div>

      {error && (
        <div role="alert" className="auth-error" style={{ marginBottom: "var(--space-3)" }}>
          {error}
        </div>
      )}

      {success && (
        <div role="status" className="apply-success-box" style={{ marginBottom: "var(--space-3)" }}>
          {success}
        </div>
      )}

      {/* ABA 1: EXPERIÊNCIAS */}
      {activeTab === "exp" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-3)" }}>
            <span style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>Histórico de atuação profissional</span>
            <button
              type="button"
              onClick={() => setShowAddExp(!showAddExp)}
              className="btn btn-secondary btn-sm"
              style={{ padding: "4px 10px", fontSize: "0.8125rem" }}
            >
              {showAddExp ? "Cancelar" : "+ Nova Experiência"}
            </button>
          </div>

          {showAddExp && (
            <form onSubmit={handleAddExp} className="auth-form" style={{ background: "rgba(15, 29, 69, 0.7)", padding: "var(--space-4)", borderRadius: "var(--radius-control)", marginBottom: "var(--space-4)" }}>
              <div className="form-group">
                <label htmlFor="exp-company">Empresa</label>
                <input id="exp-company" name="company_name" required placeholder="Nome da empresa" className="form-input" />
              </div>
              <div className="form-group">
                <label htmlFor="exp-title">Cargo / Função</label>
                <input id="exp-title" name="title" required placeholder="Ex.: Engenheiro Front-end" className="form-input" />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-3)" }}>
                <div className="form-group">
                  <label htmlFor="exp-start">Data de Início</label>
                  <input id="exp-start" name="start_date" type="date" required className="form-input" />
                </div>
                <div className="form-group">
                  <label htmlFor="exp-end">Data de Fim (ou atual)</label>
                  <input id="exp-end" name="end_date" type="date" className="form-input" />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="exp-desc">Descrição das atividades</label>
                <textarea id="exp-desc" name="description" rows={2} placeholder="Principais realizações e tecnologias" className="form-input" />
              </div>
              <button type="submit" disabled={isPending} className="btn btn-primary btn-sm">
                {isPending ? "Salvando..." : "Salvar Experiência"}
              </button>
            </form>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
            {experiences.map((exp) => (
              <div key={exp.id} style={{ background: "rgba(7, 18, 46, 0.4)", border: "1px solid var(--color-border-subtle)", borderRadius: "var(--radius-control)", padding: "var(--space-3)", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <h4 style={{ fontSize: "0.9375rem", color: "var(--color-text-primary)", margin: 0 }}>{exp.title}</h4>
                  <div style={{ fontSize: "0.8125rem", color: "var(--color-electric-blue)" }}>{exp.company_name}</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                    {exp.start_date} até {exp.end_date || "Presente"}
                  </div>
                  {exp.description && <p style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)", marginTop: "var(--space-1)" }}>{exp.description}</p>}
                </div>
                <form onSubmit={handleRemoveExp}>
                  <input type="hidden" name="id" value={exp.id} />
                  <button type="submit" disabled={isPending} className="btn btn-ghost btn-sm" style={{ color: "#F87171", padding: "2px 6px", fontSize: "0.75rem" }}>Excluir</button>
                </form>
              </div>
            ))}
            {experiences.length === 0 && !showAddExp && (
              <div style={{ color: "var(--color-text-muted)", fontSize: "0.8125rem", padding: "var(--space-3)", textAlign: "center" }}>Nenhuma experiência registrada.</div>
            )}
          </div>
        </div>
      )}

      {/* ABA 2: FORMAÇÃO */}
      {activeTab === "edu" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-3)" }}>
            <span style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>Formação acadêmica e graduações</span>
            <button
              type="button"
              onClick={() => setShowAddEdu(!showAddEdu)}
              className="btn btn-secondary btn-sm"
              style={{ padding: "4px 10px", fontSize: "0.8125rem" }}
            >
              {showAddEdu ? "Cancelar" : "+ Nova Formação"}
            </button>
          </div>

          {showAddEdu && (
            <form onSubmit={handleAddEdu} className="auth-form" style={{ background: "rgba(15, 29, 69, 0.7)", padding: "var(--space-4)", borderRadius: "var(--radius-control)", marginBottom: "var(--space-4)" }}>
              <div className="form-group">
                <label htmlFor="edu-inst">Instituição de Ensino</label>
                <input id="edu-inst" name="institution" required placeholder="Ex.: USP, PUC, Alura" className="form-input" />
              </div>
              <div className="form-group">
                <label htmlFor="edu-degree">Grau / Curso</label>
                <input id="edu-degree" name="degree" required placeholder="Ex.: Bacharelado em Ciência da Computação" className="form-input" />
              </div>
              <div className="form-group">
                <label htmlFor="edu-field">Área de Estudo (opcional)</label>
                <input id="edu-field" name="field_of_study" placeholder="Ex.: Engenharia de Software" className="form-input" />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-3)" }}>
                <div className="form-group">
                  <label htmlFor="edu-start">Data de Início</label>
                  <input id="edu-start" name="start_date" type="date" required className="form-input" />
                </div>
                <div className="form-group">
                  <label htmlFor="edu-end">Data de Conclusão</label>
                  <input id="edu-end" name="end_date" type="date" className="form-input" />
                </div>
              </div>
              <button type="submit" disabled={isPending} className="btn btn-primary btn-sm">
                {isPending ? "Salvando..." : "Salvar Formação"}
              </button>
            </form>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
            {educations.map((edu) => (
              <div key={edu.id} style={{ background: "rgba(7, 18, 46, 0.4)", border: "1px solid var(--color-border-subtle)", borderRadius: "var(--radius-control)", padding: "var(--space-3)", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <h4 style={{ fontSize: "0.9375rem", color: "var(--color-text-primary)", margin: 0 }}>{edu.degree}</h4>
                  <div style={{ fontSize: "0.8125rem", color: "var(--color-electric-blue)" }}>{edu.institution}</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                    {edu.start_date} até {edu.end_date || "Em andamento"}
                  </div>
                </div>
                <form onSubmit={handleRemoveEdu}>
                  <input type="hidden" name="id" value={edu.id} />
                  <button type="submit" disabled={isPending} className="btn btn-ghost btn-sm" style={{ color: "#F87171", padding: "2px 6px", fontSize: "0.75rem" }}>Excluir</button>
                </form>
              </div>
            ))}
            {educations.length === 0 && !showAddEdu && (
              <div style={{ color: "var(--color-text-muted)", fontSize: "0.8125rem", padding: "var(--space-3)", textAlign: "center" }}>Nenhuma formação registrada.</div>
            )}
          </div>
        </div>
      )}

      {/* ABA 3: CERTIFICAÇÕES */}
      {activeTab === "cert" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-3)" }}>
            <span style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>Certificações e credenciais técnicas</span>
            <button
              type="button"
              onClick={() => setShowAddCert(!showAddCert)}
              className="btn btn-secondary btn-sm"
              style={{ padding: "4px 10px", fontSize: "0.8125rem" }}
            >
              {showAddCert ? "Cancelar" : "+ Nova Certificação"}
            </button>
          </div>

          {showAddCert && (
            <form onSubmit={handleAddCert} className="auth-form" style={{ background: "rgba(15, 29, 69, 0.7)", padding: "var(--space-4)", borderRadius: "var(--radius-control)", marginBottom: "var(--space-4)" }}>
              <div className="form-group">
                <label htmlFor="cert-name">Nome da Certificação</label>
                <input id="cert-name" name="name" required placeholder="Ex.: AWS Certified Solutions Architect" className="form-input" />
              </div>
              <div className="form-group">
                <label htmlFor="cert-org">Organização Emissora</label>
                <input id="cert-org" name="issuing_organization" required placeholder="Ex.: Amazon Web Services" className="form-input" />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-3)" }}>
                <div className="form-group">
                  <label htmlFor="cert-issue">Data de Emissão</label>
                  <input id="cert-issue" name="issue_date" type="date" required className="form-input" />
                </div>
                <div className="form-group">
                  <label htmlFor="cert-exp">Data de Expiração (se houver)</label>
                  <input id="cert-exp" name="expiration_date" type="date" className="form-input" />
                </div>
              </div>
              <button type="submit" disabled={isPending} className="btn btn-primary btn-sm">
                {isPending ? "Salvando..." : "Salvar Certificação"}
              </button>
            </form>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
            {certifications.map((c) => (
              <div key={c.id} style={{ background: "rgba(7, 18, 46, 0.4)", border: "1px solid var(--color-border-subtle)", borderRadius: "var(--radius-control)", padding: "var(--space-3)", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <h4 style={{ fontSize: "0.9375rem", color: "var(--color-text-primary)", margin: 0 }}>{c.name}</h4>
                  <div style={{ fontSize: "0.8125rem", color: "var(--color-electric-blue)" }}>{c.issuing_organization}</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>Emitida em {c.issue_date}</div>
                </div>
                <form onSubmit={handleRemoveCert}>
                  <input type="hidden" name="id" value={c.id} />
                  <button type="submit" disabled={isPending} className="btn btn-ghost btn-sm" style={{ color: "#F87171", padding: "2px 6px", fontSize: "0.75rem" }}>Excluir</button>
                </form>
              </div>
            ))}
            {certifications.length === 0 && !showAddCert && (
              <div style={{ color: "var(--color-text-muted)", fontSize: "0.8125rem", padding: "var(--space-3)", textAlign: "center" }}>Nenhuma certificação registrada.</div>
            )}
          </div>
        </div>
      )}

      {/* ABA 4: IDIOMAS */}
      {activeTab === "lang" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-3)" }}>
            <span style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>Idiomas e proficiência</span>
            <button
              type="button"
              onClick={() => setShowAddLang(!showAddLang)}
              className="btn btn-secondary btn-sm"
              style={{ padding: "4px 10px", fontSize: "0.8125rem" }}
            >
              {showAddLang ? "Cancelar" : "+ Novo Idioma"}
            </button>
          </div>

          {showAddLang && (
            <form onSubmit={handleAddLang} className="auth-form" style={{ background: "rgba(15, 29, 69, 0.7)", padding: "var(--space-4)", borderRadius: "var(--radius-control)", marginBottom: "var(--space-4)" }}>
              <div className="form-group">
                <label htmlFor="lang-name">Idioma</label>
                <input id="lang-name" name="language_name" required placeholder="Ex.: Inglês, Espanhol, Alemão" className="form-input" />
              </div>
              <div className="form-group">
                <label htmlFor="lang-prof">Proficiência</label>
                <select id="lang-prof" name="proficiency_level" className="form-input" defaultValue="Intermediário">
                  <option value="Básico">Básico</option>
                  <option value="Intermediário">Intermediário</option>
                  <option value="Avançado">Avançado</option>
                  <option value="Fluente">Fluente</option>
                  <option value="Nativo">Nativo</option>
                </select>
              </div>
              <button type="submit" disabled={isPending} className="btn btn-primary btn-sm">
                {isPending ? "Salvando..." : "Salvar Idioma"}
              </button>
            </form>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
            {languages.map((l) => (
              <div key={l.id} style={{ background: "rgba(7, 18, 46, 0.4)", border: "1px solid var(--color-border-subtle)", borderRadius: "var(--radius-control)", padding: "var(--space-3)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h4 style={{ fontSize: "0.9375rem", color: "var(--color-text-primary)", margin: 0 }}>{l.language_name}</h4>
                  <div style={{ fontSize: "0.8125rem", color: "var(--color-electric-blue)" }}>{l.proficiency_level}</div>
                </div>
                <form onSubmit={handleRemoveLang}>
                  <input type="hidden" name="id" value={l.id} />
                  <button type="submit" disabled={isPending} className="btn btn-ghost btn-sm" style={{ color: "#F87171", padding: "2px 6px", fontSize: "0.75rem" }}>Excluir</button>
                </form>
              </div>
            ))}
            {languages.length === 0 && !showAddLang && (
              <div style={{ color: "var(--color-text-muted)", fontSize: "0.8125rem", padding: "var(--space-3)", textAlign: "center" }}>Nenhum idioma registrado.</div>
            )}
          </div>
        </div>
      )}

      {/* ABA 5: COMPETÊNCIAS (RF06) */}
      {activeTab === "skills" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-3)" }}>
            <span style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>Competências técnicas e habilidades</span>
            <button
              type="button"
              onClick={() => setShowAddSkill(!showAddSkill)}
              className="btn btn-secondary btn-sm"
              style={{ padding: "4px 10px", fontSize: "0.8125rem" }}
            >
              {showAddSkill ? "Cancelar" : "+ Nova Competência"}
            </button>
          </div>

          {showAddSkill && (
            <form onSubmit={handleAddSkill} className="auth-form" style={{ background: "rgba(15, 29, 69, 0.7)", padding: "var(--space-4)", borderRadius: "var(--radius-control)", marginBottom: "var(--space-4)" }}>
              <div className="form-group">
                <label htmlFor="skill-name">Nome da Competência</label>
                <input id="skill-name" name="name" required maxLength={50} placeholder="Ex.: React, PostgreSQL, Docker, TypeScript" className="form-input" />
              </div>
              <button type="submit" disabled={isPending} className="btn btn-primary btn-sm">
                {isPending ? "Salvando..." : "Salvar Competência"}
              </button>
            </form>
          )}

          <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-2)" }}>
            {skills.map((s) => (
              <div
                key={s.id}
                style={{
                  background: "rgba(15, 29, 69, 0.8)",
                  border: "1px solid var(--color-border-medium)",
                  borderRadius: "9999px",
                  padding: "4px 12px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "var(--space-2)",
                  fontSize: "0.8125rem",
                  color: "var(--color-text-primary)",
                }}
              >
                <span>{s.name}</span>
                <form onSubmit={handleRemoveSkill} style={{ display: "inline" }}>
                  <input type="hidden" name="skillId" value={s.id} />
                  <button
                    type="submit"
                    disabled={isPending}
                    aria-label={`Remover ${s.name}`}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#F87171",
                      cursor: "pointer",
                      fontSize: "0.875rem",
                      padding: 0,
                      lineHeight: 1,
                    }}
                  >
                    ×
                  </button>
                </form>
              </div>
            ))}
            {skills.length === 0 && !showAddSkill && (
              <div style={{ color: "var(--color-text-muted)", fontSize: "0.8125rem", padding: "var(--space-3)", textAlign: "center", width: "100%" }}>
                Nenhuma competência adicionada ao perfil até o momento.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ABA 6: PROJETOS PROFISSIONAIS (RF06) */}
      {activeTab === "proj" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-3)" }}>
            <span style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>Projetos e portfólio técnico</span>
            <button
              type="button"
              onClick={() => setShowAddProj(!showAddProj)}
              className="btn btn-secondary btn-sm"
              style={{ padding: "4px 10px", fontSize: "0.8125rem" }}
            >
              {showAddProj ? "Cancelar" : "+ Novo Projeto"}
            </button>
          </div>

          {showAddProj && (
            <form onSubmit={handleAddProj} className="auth-form" style={{ background: "rgba(15, 29, 69, 0.7)", padding: "var(--space-4)", borderRadius: "var(--radius-control)", marginBottom: "var(--space-4)" }}>
              <div className="form-group">
                <label htmlFor="proj-name">Nome do Projeto</label>
                <input id="proj-name" name="name" required maxLength={100} placeholder="Ex.: Plataforma E-commerce, Chatbot AI" className="form-input" />
              </div>
              <div className="form-group">
                <label htmlFor="proj-tech">Tecnologias Utilizadas</label>
                <input id="proj-tech" name="technologies" maxLength={200} placeholder="Ex.: Next.js, Node.js, PostgreSQL, Tailwind" className="form-input" />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-3)" }}>
                <div className="form-group">
                  <label htmlFor="proj-repo">URL do Repositório (Opcional)</label>
                  <input id="proj-repo" name="repository_url" type="url" maxLength={255} placeholder="https://github.com/..." className="form-input" />
                </div>
                <div className="form-group">
                  <label htmlFor="proj-demo">URL de Demonstração (Opcional)</label>
                  <input id="proj-demo" name="demo_url" type="url" maxLength={255} placeholder="https://meuprojeto.com" className="form-input" />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="proj-desc">Descrição</label>
                <textarea id="proj-desc" name="description" rows={3} maxLength={500} placeholder="Descreva os objetivos, sua contribuição e arquitetura" className="form-input" />
              </div>
              <button type="submit" disabled={isPending} className="btn btn-primary btn-sm">
                {isPending ? "Salvando..." : "Salvar Projeto"}
              </button>
            </form>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
            {projects.map((p) => (
              <div
                key={p.id}
                style={{
                  background: "rgba(7, 18, 46, 0.4)",
                  border: "1px solid var(--color-border-subtle)",
                  borderRadius: "var(--radius-control)",
                  padding: "var(--space-3)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: "var(--space-3)",
                }}
              >
                <div>
                  <h4 style={{ fontSize: "0.9375rem", color: "var(--color-text-primary)", margin: 0 }}>{p.name}</h4>
                  {p.description && (
                    <p style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)", margin: "var(--space-1) 0", whiteSpace: "pre-line" }}>
                      {p.description}
                    </p>
                  )}
                  {p.url && (
                    <a
                      href={p.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontSize: "0.75rem", color: "var(--color-electric-blue)", textDecoration: "underline", display: "inline-block", marginTop: "var(--space-1)" }}
                    >
                      🔗 Acessar projeto
                    </a>
                  )}
                </div>
                <form onSubmit={handleRemoveProj}>
                  <input type="hidden" name="id" value={p.id} />
                  <button type="submit" disabled={isPending} className="btn btn-ghost btn-sm" style={{ color: "#F87171", padding: "2px 6px", fontSize: "0.75rem" }}>
                    Excluir
                  </button>
                </form>
              </div>
            ))}
            {projects.length === 0 && !showAddProj && (
              <div style={{ color: "var(--color-text-muted)", fontSize: "0.8125rem", padding: "var(--space-3)", textAlign: "center" }}>
                Nenhum projeto cadastrado no portfólio.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
