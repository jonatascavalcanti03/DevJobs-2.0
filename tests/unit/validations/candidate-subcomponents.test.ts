import { describe, it, expect } from "vitest";
import {
  ExperienceSchema,
  EducationSchema,
  CertificationSchema,
  LanguageSchema,
  SkillSchema,
  ProjectSchema,
} from "@/lib/validations/profile/candidate-profile.schema";

describe("Candidate Subcomponents Schemas — RF06", () => {
  describe("ExperienceSchema", () => {
    it("aceita experiência válida com término posterior ao início", () => {
      const payload = {
        company_name: "Google",
        title: "Engenheiro de Software",
        start_date: "2022-01-01",
        end_date: "2024-05-01",
        description: "Desenvolvimento de sistemas de busca.",
      };
      const result = ExperienceSchema.safeParse(payload);
      expect(result.success).toBe(true);
    });

    it("aceita experiência em andamento (end_date omitido ou nulo)", () => {
      const payload = {
        company_name: "Google",
        title: "Tech Lead",
        start_date: "2024-06-01",
      };
      const result = ExperienceSchema.safeParse(payload);
      expect(result.success).toBe(true);
    });

    it("rejeita experiência quando data de término é anterior à data de início", () => {
      const payload = {
        company_name: "Google",
        title: "Desenvolvedor",
        start_date: "2023-01-01",
        end_date: "2022-01-01",
      };
      const result = ExperienceSchema.safeParse(payload);
      expect(result.success).toBe(false);
    });
  });

  describe("EducationSchema", () => {
    it("aceita formação válida", () => {
      const payload = {
        institution: "USP",
        degree: "Bacharelado",
        field_of_study: "Ciência da Computação",
        start_date: "2018-02-01",
        end_date: "2022-12-01",
      };
      const result = EducationSchema.safeParse(payload);
      expect(result.success).toBe(true);
    });

    it("rejeita formação com instituição vazia", () => {
      const payload = {
        institution: "",
        degree: "Bacharelado",
        start_date: "2018-02-01",
      };
      const result = EducationSchema.safeParse(payload);
      expect(result.success).toBe(false);
    });
  });

  describe("CertificationSchema", () => {
    it("aceita certificação técnica válida", () => {
      const payload = {
        name: "AWS Certified Architect",
        issuing_organization: "Amazon Web Services",
        issue_date: "2023-08-15",
      };
      const result = CertificationSchema.safeParse(payload);
      expect(result.success).toBe(true);
    });
  });

  describe("LanguageSchema", () => {
    it("aceita idioma e nível de proficiência", () => {
      const payload = {
        language_name: "Inglês",
        proficiency_level: "Fluente",
      };
      const result = LanguageSchema.safeParse(payload);
      expect(result.success).toBe(true);
    });
  });

  describe("SkillSchema", () => {
    it("aceita competência válida com nome preenchido", () => {
      const payload = { name: "TypeScript" };
      const result = SkillSchema.safeParse(payload);
      expect(result.success).toBe(true);
    });

    it("rejeita competência com nome vazio ou com apenas espaços", () => {
      const payload = { name: "   " };
      const result = SkillSchema.safeParse(payload);
      expect(result.success).toBe(false);
    });

    it("rejeita competência com tamanho excessivo (> 50 caracteres)", () => {
      const payload = { name: "A".repeat(51) };
      const result = SkillSchema.safeParse(payload);
      expect(result.success).toBe(false);
    });
  });

  describe("ProjectSchema", () => {
    it("aceita projeto válido com todas as informações e URLs válidas", () => {
      const payload = {
        name: "DevJobs Platform",
        description: "Plataforma de recrutamento para desenvolvedores.",
        technologies: "Next.js, TypeScript, Supabase",
        repository_url: "https://github.com/empresa/devjobs",
        demo_url: "https://devjobs.com.br",
      };
      const result = ProjectSchema.safeParse(payload);
      expect(result.success).toBe(true);
    });

    it("aceita projeto sem URLs opcionais", () => {
      const payload = {
        name: "API de Pagamentos",
        description: "Microsserviço de conciliação bancária.",
      };
      const result = ProjectSchema.safeParse(payload);
      expect(result.success).toBe(true);
    });

    it("rejeita projeto com URL inválida", () => {
      const payload = {
        name: "Projeto Teste",
        repository_url: "nao-e-uma-url",
      };
      const result = ProjectSchema.safeParse(payload);
      expect(result.success).toBe(false);
    });

    it("rejeita projeto com nome vazio", () => {
      const payload = {
        name: "   ",
      };
      const result = ProjectSchema.safeParse(payload);
      expect(result.success).toBe(false);
    });
  });
});
