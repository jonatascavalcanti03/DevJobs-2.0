// @vitest-environment node
import { describe, it, expect, beforeEach, vi } from "vitest";

// Mocks do Supabase Server Client e Next Cache
const mockGetUser = vi.fn();
const mockFrom = vi.fn();
const mockUpload = vi.fn();
const mockRemove = vi.fn();
const mockCreateSignedUrl = vi.fn();
const mockStorageFrom = vi.fn(() => ({
  upload: mockUpload,
  remove: mockRemove,
  createSignedUrl: mockCreateSignedUrl,
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: {
      getUser: mockGetUser,
    },
    from: mockFrom,
    storage: {
      from: mockStorageFrom,
    },
  })),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

describe("RF06 — Upload Seguro e Gestão de Currículo em PDF", () => {
  const candidateUserId = "user-cand-001";
  const candidateProfileId = "prof-cand-001";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Helper para criar arquivo fake com cabeçalho PDF autêntico (%PDF-1.4)
  const createFakePdfFile = (name = "curriculo.pdf", size = 1024 * 100, isRealPdf = true) => {
    const bytes = new Uint8Array(size);
    if (isRealPdf) {
      // Magic bytes %PDF-
      bytes[0] = 0x25;
      bytes[1] = 0x50;
      bytes[2] = 0x44;
      bytes[3] = 0x46;
      bytes[4] = 0x2d;
    } else {
      bytes[0] = 0x00;
      bytes[1] = 0x01;
      bytes[2] = 0x02;
    }
    return new File([bytes], name, { type: "application/pdf" });
  };

  it("1. Upload válido pelo próprio candidato autenticado", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: candidateUserId } },
      error: null,
    });

    mockFrom.mockImplementation((table: string) => {
      if (table === "users") {
        return {
          select: () => ({
            eq: () => ({
              single: vi.fn().mockResolvedValue({ data: { role: "CANDIDATE" }, error: null }),
            }),
          }),
        };
      }
      if (table === "candidate_profiles") {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: vi.fn().mockResolvedValue({ data: { id: candidateProfileId }, error: null }),
            }),
          }),
        };
      }
      if (table === "resumes") {
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
              }),
            }),
          }),
          insert: vi.fn().mockResolvedValue({ data: { id: "resume-1" }, error: null }),
        };
      }
      return {};
    });

    mockUpload.mockResolvedValue({ data: { path: "candidate_prof-cand-001/uuid.pdf" }, error: null });

    const formData = new FormData();
    const pdfFile = createFakePdfFile("meu-curriculo.pdf", 1024 * 50);
    formData.append("resume", pdfFile);

    const { uploadResume } = await import("@/lib/actions/candidate-profile");
    const result = await uploadResume(formData);

    expect(result).toEqual({ success: true });
    expect(mockUpload).toHaveBeenCalled();
  });

  it("2. Rejeição de arquivo que não seja PDF autêntico (magic bytes ausentes)", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: candidateUserId } },
      error: null,
    });

    mockFrom.mockImplementation((table: string) => {
      if (table === "users") {
        return {
          select: () => ({
            eq: () => ({
              single: vi.fn().mockResolvedValue({ data: { role: "CANDIDATE" }, error: null }),
            }),
          }),
        };
      }
      if (table === "candidate_profiles") {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: vi.fn().mockResolvedValue({ data: { id: candidateProfileId }, error: null }),
            }),
          }),
        };
      }
      return {};
    });

    const formData = new FormData();
    // Arquivo com extensão .pdf mas conteúdo forjado (sem %PDF-)
    const fakeFile = createFakePdfFile("curriculo-falso.pdf", 500, false);
    formData.append("resume", fakeFile);

    const { uploadResume } = await import("@/lib/actions/candidate-profile");
    const result = await uploadResume(formData);

    expect(result.error).toBe("O arquivo enviado não é um PDF autêntico.");
    expect(mockUpload).not.toHaveBeenCalled();
  });

  it("3. Rejeição de arquivo acima do limite permitido de 5MB", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: candidateUserId } },
      error: null,
    });

    mockFrom.mockImplementation((table: string) => {
      if (table === "users") {
        return {
          select: () => ({
            eq: () => ({
              single: vi.fn().mockResolvedValue({ data: { role: "CANDIDATE" }, error: null }),
            }),
          }),
        };
      }
      if (table === "candidate_profiles") {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: vi.fn().mockResolvedValue({ data: { id: candidateProfileId }, error: null }),
            }),
          }),
        };
      }
      return {};
    });

    const formData = new FormData();
    // 6MB (acima do limite de 5MB)
    const bigFile = createFakePdfFile("curriculo-pesado.pdf", 6 * 1024 * 1024);
    formData.append("resume", bigFile);

    const { uploadResume } = await import("@/lib/actions/candidate-profile");
    const result = await uploadResume(formData);

    expect(result.error).toContain("5MB");
    expect(mockUpload).not.toHaveBeenCalled();
  });

  it("4. Bloqueio de tentativa de acesso ao currículo de outro candidato por usuário comum", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "outro-candidato-id" } },
      error: null,
    });

    // Mock do Supabase simulando RLS de public.resumes retornando null (não visível para quem não tem acesso)
    mockFrom.mockImplementation((table: string) => {
      if (table === "resumes") {
        return {
          select: () => ({
            eq: () => ({
              single: vi.fn().mockResolvedValue({ data: null, error: { message: "Row not found" } }),
            }),
          }),
        };
      }
      return {};
    });

    const { getResumeDownloadUrl } = await import("@/lib/actions/candidate-profile");
    const result = await getResumeDownloadUrl("resume-alheio-123");

    expect(result.error).toContain("permissão insuficiente");
    expect(mockCreateSignedUrl).not.toHaveBeenCalled();
  });

  it("5. Bloqueio de acesso a currículo por empresa sem candidatura autorizada", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "recrutador-sem-vinculo" } },
      error: null,
    });

    // Supabase RLS bloqueia e retorna erro/null
    mockFrom.mockImplementation((table: string) => {
      if (table === "resumes") {
        return {
          select: () => ({
            eq: () => ({
              single: vi.fn().mockResolvedValue({ data: null, error: { message: "Permission denied" } }),
            }),
          }),
        };
      }
      return {};
    });

    const { getResumeDownloadUrl } = await import("@/lib/actions/candidate-profile");
    const result = await getResumeDownloadUrl("resume-candidato-desconhecido");

    expect(result.error).toContain("permissão insuficiente");
    expect(mockCreateSignedUrl).not.toHaveBeenCalled();
  });

  it("6. Tratamento de falha ao persistir no banco: executa compensação e remove arquivo do Storage", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: candidateUserId } },
      error: null,
    });

    mockFrom.mockImplementation((table: string) => {
      if (table === "users") {
        return {
          select: () => ({
            eq: () => ({
              single: vi.fn().mockResolvedValue({ data: { role: "CANDIDATE" }, error: null }),
            }),
          }),
        };
      }
      if (table === "candidate_profiles") {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: vi.fn().mockResolvedValue({ data: { id: candidateProfileId }, error: null }),
            }),
          }),
        };
      }
      if (table === "resumes") {
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
              }),
            }),
          }),
          // Falha simulada ao salvar na base relacional
          insert: vi.fn().mockResolvedValue({
            data: null,
            error: { message: "Database timeout or constraint violation" },
          }),
        };
      }
      return {};
    });

    mockUpload.mockResolvedValue({ data: { path: "candidate_prof-cand-001/file.pdf" }, error: null });
    mockRemove.mockResolvedValue({ data: {}, error: null });

    const formData = new FormData();
    const validPdf = createFakePdfFile("curriculo-valido.pdf", 1024 * 30);
    formData.append("resume", validPdf);

    const { uploadResume } = await import("@/lib/actions/candidate-profile");
    const result = await uploadResume(formData);

    expect(result.error).toContain("Não foi possível vincular o currículo");
    // Compensação ativada: arquivo temporário no storage foi removido para não ficar órfão
    expect(mockRemove).toHaveBeenCalled();
  });
});
