import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright E2E Test Configuration
 * Documentação: https://playwright.dev/docs/test-configuration
 *
 * ETAPA 0: Configuração de infraestrutura apenas.
 * Nenhum teste de fluxo completo é implementado nesta etapa.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env["CI"],
  retries: process.env["CI"] ? 2 : 0,
  workers: process.env["CI"] ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: process.env["PLAYWRIGHT_BASE_URL"] || "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  // Em desenvolvimento local, inicia o servidor antes dos testes
  // Descomente quando os testes E2E forem implementados nas próximas etapas:
  // webServer: {
  //   command: "npm run dev",
  //   url: "http://localhost:3000",
  //   reuseExistingServer: !process.env["CI"],
  // },
});
