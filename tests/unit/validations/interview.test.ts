import { describe, it, expect } from "vitest";
import {
  ScheduleInterviewSchema,
  EvaluateInterviewSchema,
  UpdateInterviewStatusSchema,
} from "@/lib/validations/company/interview.schema";

describe("Interview Schemas (RF36)", () => {
  it("valida agendamento correto de entrevista", () => {
    const validData = {
      applicationId: "c389c922-bfbb-4c28-9418-5085e3532431",
      scheduledAt: "2026-11-20T14:30:00Z",
      durationMinutes: 60,
      meetingLink: "https://meet.google.com/abc-defg-hij",
    };
    const res = ScheduleInterviewSchema.safeParse(validData);
    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data.durationMinutes).toBe(60);
      expect(res.data.meetingLink).toBe("https://meet.google.com/abc-defg-hij");
    }
  });

  it("rejeita duração menor que 15 minutos", () => {
    const invalidData = {
      applicationId: "c389c922-bfbb-4c28-9418-5085e3532431",
      scheduledAt: "2026-11-20T14:30:00Z",
      durationMinutes: 10,
    };
    const res = ScheduleInterviewSchema.safeParse(invalidData);
    expect(res.success).toBe(false);
  });

  it("rejeita URL de reunião inválida", () => {
    const invalidData = {
      applicationId: "c389c922-bfbb-4c28-9418-5085e3532431",
      scheduledAt: "2026-11-20T14:30:00Z",
      durationMinutes: 45,
      meetingLink: "not-a-valid-url",
    };
    const res = ScheduleInterviewSchema.safeParse(invalidData);
    expect(res.success).toBe(false);
  });

  it("valida avaliação de entrevista com feedback e nota", () => {
    const validData = {
      interviewId: "c389c922-bfbb-4c28-9418-5085e3532431",
      feedback: "Candidato demonstrou excelente domínio em arquitetura distribuída.",
      score: 9.5,
    };
    const res = EvaluateInterviewSchema.safeParse(validData);
    expect(res.success).toBe(true);
  });

  it("rejeita nota fora da faixa de 0 a 10", () => {
    const invalidData = {
      interviewId: "c389c922-bfbb-4c28-9418-5085e3532431",
      feedback: "Bom candidato em geral.",
      score: 11,
    };
    const res = EvaluateInterviewSchema.safeParse(invalidData);
    expect(res.success).toBe(false);
  });

  it("valida transição de status da entrevista", () => {
    const validData = {
      interviewId: "c389c922-bfbb-4c28-9418-5085e3532431",
      status: "COMPLETED",
    };
    const res = UpdateInterviewStatusSchema.safeParse(validData);
    expect(res.success).toBe(true);
  });
});
