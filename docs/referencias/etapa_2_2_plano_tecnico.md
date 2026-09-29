# ETAPA 2.2 — Plano Técnico: Validadores Zod e Testes de Domínio
## DevJobs 2.0 · Relatório de Planejamento

> **Status:** PLANEJAMENTO — Aguardando Aprovação Humana
> **Data de elaboração:** 2026-09-26
> **Escopo:** RF01, RF02, RF06 (parcial — somente validadores de domínio)
> **Nenhum arquivo, dependência, banco, commit ou publicação foi alterado.**

---

## 1. Resumo Executivo

Esta etapa planeja a criação de **validadores Zod reutilizáveis** e **testes unitários de domínio** que formarão a base das futuras Server Actions e telas de cadastro/perfil do DevJobs 2.0.

O objetivo é estabelecer camadas de validação seguras, rastreáveis e desacopladas antes de qualquer implementação de UI ou integração com Supabase. Os validadores garantirão:

- normalização de entrada (trim, lowercase, remoção de pontuação);
- verificação de formato e regras de negócio aprovadas;
- tratamento de erros tipado e seguro, sem expor senhas ou dados sensíveis em logs;
- testes determinísticos sem dependência de banco, rede ou serviços externos.

**Esta etapa não altera banco de dados, não cria migrações, não modifica autorização e não implementa Server Actions.**

---

## 2. Estado Inicial do Git e do Repositório

| Item | Valor |
|---|---|
| Branch | `main` |
| Commit HEAD | `d45f00f` — *chore: sincronizar projeto DevJobs 2.0 com GitHub* |
| Estado da árvore | Limpa (sem alterações rastreadas) |
| Arquivos não rastreados | `AGENTS.md`, `CLAUDE.md` |
| Upstream | Sincronizado com `origin/main` |

**Divergência encontrada:** Os arquivos `AGENTS.md` e `CLAUDE.md` existem localmente mas não estão rastreados pelo Git. Não foram descartados nem modificados. Registro apenas para rastreabilidade.

**Confirmação:** O commit `d45f00f` corresponde ao estado esperado registrado no prompt. Sem divergência em relação ao estado esperado.

---

## 3. Arquivos e Padrões Encontrados

### 3.1 Estrutura real do projeto (verificada)

```text
F:\Estudos_e_Projetos\DevJobs 2.0\
├── app/
│   ├── layout.tsx
│   └── page.tsx
├── lib/
│   ├── errors.ts            ← Sistema de erros tipados (AppError, ValidationError, etc.)
│   ├── logger.ts            ← Logger estruturado com sanitização de campos sensíveis
│   └── supabase/
│       ├── client.ts        ← Browser Client (anon key apenas)
│       ├── server.ts        ← Server Client (anon key + cookies)
│       └── admin.ts         ← Admin Client (service role, server-only)
├── tests/
│   ├── setup.ts             ← @testing-library/jest-dom
│   └── unit/
│       ├── infrastructure.test.ts   ← Teste de sanidade (1 caso)
│       ├── proxy.test.ts            ← Testes do proxy.ts (4 casos)
│       └── supabase-clients.test.ts ← Testes dos clientes Supabase (8 casos)
├── supabase/
│   └── migrations/
│       ├── 00001_core_identity.sql
│       ├── 00002_candidate.sql
│       ├── 00003_company.sql
│       ├── 00004_recruitment.sql
│       ├── 00005_interviews.sql
│       ├── 00006_audit.sql
│       └── 00007_rls_policies.sql
├── proxy.ts
├── .env.example
├── package.json
├── vitest.config.ts
├── tsconfig.json
└── README.md
```

### 3.2 Padrões identificados

| Padrão | Observação |
|---|---|
| Alias `@/*` → `./` | Definido em `tsconfig.json` e `vitest.config.ts` |
| Ambiente de testes | `jsdom` por padrão; `// @vitest-environment node` para módulos Node.js |
| Mocks de dependências | Via `vi.mock(...)` com `vi.resetModules()` no `beforeEach` |
| Erros tipados | Hierarquia em `lib/errors.ts` — `AppError → ValidationError, DomainError, etc.` |
| Logger sanitizado | `lib/logger.ts` — lista de `SENSITIVE_KEYS` substituídas por `[REDACTED]` |
| Service Role | Exclusiva em `lib/supabase/admin.ts`, nunca exposta ao browser |
| Nomenclatura | `kebab-case` para arquivos, `PascalCase` para classes/tipos, `camelCase` para funções |

### 3.3 Padrão de teste existente (referência)

Os testes unitários existentes usam:

```typescript
// @vitest-environment node  (quando não há DOM)
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

describe("Grupo", () => {
  beforeEach(() => { vi.resetModules(); });
  afterEach(() => { vi.restoreAllMocks(); });

  it("deve ...", () => {
    expect(...).toBe(...);
  });
});
```

---

## 4. Dependências Relevantes e Situação do Zod

### 4.1 Zod

| Item | Valor |
|---|---|
| Declarado em `package.json` | `"zod": "^3.25.76"` (dependência de produção) |
| Versão resolvida no lockfile | `3.25.76` |
| Instalado em `node_modules` | **Sim** (confirmado pelo lockfile) |
| Ação necessária | **Nenhuma — Zod já está instalado** |

**Nota sobre compatibilidade:** Zod 3.25.x é compatível com TypeScript 5.x (`strict: true`), com inferência via `z.infer<typeof Schema>`, `.safeParse()`, `.parse()`, `.refine()` e transformações via `.transform()`. Não há breaking changes entre 3.x que afetem o escopo desta etapa.

### 4.2 Outras dependências relevantes

| Dependência | Versão | Uso planejado |
|---|---|---|
| `vitest` | `^3.2.4` | Execução dos testes unitários |
| `typescript` | `^5` | Inferência de tipos Zod |
| `@testing-library/jest-dom` | `^6.6.3` | Setup de testes (já configurado) |

---

## 5. Escopo Incluído e Excluído

### 5.1 Incluído nesta etapa

- Validador de e-mail (normalização + formato)
- Validador de senha (regras aprovadas: 8 chars, maiúscula, minúscula, número, símbolo)
- Validador de CNPJ (normalização + 14 dígitos + dígitos verificadores + rejeição de sequências repetidas)
- Schema de entrada para cadastro de candidato (RF01) — campos expressamente definidos
- Schema de entrada para cadastro de empresa (RF02) — campos expressamente definidos
- Schemas parciais de perfil profissional (RF06) — apenas dados com regras definidas e aprovadas
- Testes unitários para cada validador
- Tipos TypeScript inferidos pelo Zod

### 5.2 Explicitamente excluído desta etapa

| Item excluído | Motivo |
|---|---|
| Server Actions | Etapa futura |
| Formulários / componentes React | Etapa futura |
| Integração com Supabase Auth | Etapa futura |
| Consulta de situação cadastral da empresa (CNPJ real) | Verificação oficial — RF16 |
| Autorização baseada em papel | Papel vem de `public.users.role`; esta etapa não acessa banco |
| Novas migrations | Sem necessidade demonstrada — banco já modelado |
| Schema de `role` recebido do cliente | Proibido por princípio de segurança |
| Campos sem respaldo documental em RF01/RF02/RF06 | Não inventar requisitos |
| Validação de `cpf` | Não mencionado nos requisitos aprovados para esta etapa |
| Testes de integração ou E2E | Fora do escopo desta etapa |
| Validações de datas sem regra explícita | Sem respaldo documental |

---

## 6. Arquitetura Proposta e Justificativa

### 6.1 Localização dos módulos

```text
lib/
└── validations/
    ├── shared/
    │   ├── email.schema.ts        ← Validador reutilizável de e-mail
    │   ├── password.schema.ts     ← Validador reutilizável de senha
    │   └── cnpj.schema.ts         ← Validador reutilizável de CNPJ
    ├── candidate/
    │   └── register.schema.ts     ← Schema de entrada RF01
    ├── company/
    │   └── register.schema.ts     ← Schema de entrada RF02
    └── profile/
        └── candidate-profile.schema.ts  ← Schema parcial RF06
```

**Justificativa da localização:**
- `lib/` é o diretório já estabelecido para utilitários de domínio.
- A subpasta `validations/` segue o padrão de `supabase/` — grupo funcional dentro de `lib/`.
- `shared/` separa validadores reutilizáveis dos schemas compostos por módulo.
- Não há necessidade de camada adicional de abstração: o conjunto é pequeno.

### 6.2 Separação de responsabilidades

| Camada | O que faz |
|---|---|
| `shared/*.schema.ts` | Validador atômico: normalização + regra pura de domínio |
| `<modulo>/register.schema.ts` | Composição de campos para um caso de uso específico |
| `tests/unit/validations/` | Testes unitários, sem dependência externa |

### 6.3 Convenções de tipos TypeScript

```typescript
// Padrão de inferência — a ser aplicado em cada schema
export const EmailSchema = z.string()...;
export type Email = z.infer<typeof EmailSchema>;

// Para schemas de entrada de formulário
export const CandidateRegisterSchema = z.object({...});
export type CandidateRegisterInput = z.infer<typeof CandidateRegisterSchema>;
```

**Regra:** O tipo TypeScript é **sempre inferido do schema Zod**, nunca definido manualmente em paralelo.

### 6.4 Tratamento seguro de erros de validação

Padrão planejado para Server Actions futuras (não implementado nesta etapa):

```typescript
const result = Schema.safeParse(input);
if (!result.success) {
  const fields = result.error.flatten().fieldErrors;
  throw new ValidationError("Dados inválidos", { fields });
}
```

- `safeParse` nunca lança exceção.
- Mensagens de erro **nunca incluem o valor da senha ou dados sensíveis**.
- O `logger.ts` já sanitiza `password` e `senha` — os validadores respeitam essa convenção.

### 6.5 Estratégia de desacoplamento do Supabase

- Os validadores **não importam** nenhum módulo de `lib/supabase/`.
- Os testes **não configuram** variáveis de ambiente do Supabase.
- Os testes **não usam** `vi.mock("@supabase/ssr")` ou equivalente.
- Resultado: testes são determinísticos, executam offline e não dependem de estado externo.

---

## 7. Lista Proposta de Arquivos a Criar ou Modificar

### 7.1 Arquivos a CRIAR

| Arquivo | Responsabilidade |
|---|---|
| `lib/validations/shared/email.schema.ts` | Normalização (trim + lowercase) e validação de formato |
| `lib/validations/shared/password.schema.ts` | Validação de senha conforme regras aprovadas; sem logar valor |
| `lib/validations/shared/cnpj.schema.ts` | Normalização, 14 dígitos, dígitos verificadores, rejeição de repetidas |
| `lib/validations/candidate/register.schema.ts` | Schema de entrada RF01 |
| `lib/validations/company/register.schema.ts` | Schema de entrada RF02 com CNPJ |
| `lib/validations/profile/candidate-profile.schema.ts` | Schema parcial RF06 |
| `tests/unit/validations/email.test.ts` | Testes do validador de e-mail |
| `tests/unit/validations/password.test.ts` | Testes do validador de senha |
| `tests/unit/validations/cnpj.test.ts` | Testes do validador de CNPJ |
| `tests/unit/validations/candidate-register.test.ts` | Testes do schema RF01 |
| `tests/unit/validations/company-register.test.ts` | Testes do schema RF02 |
| `tests/unit/validations/candidate-profile.test.ts` | Testes do schema parcial RF06 |

### 7.2 Arquivos a MODIFICAR

Nenhum arquivo existente precisa ser modificado para implementar esta etapa.

> O `README.md` deverá ser atualizado após aprovação e implementação para registrar a ETAPA 2.2 como APROVADA. Essa atualização ocorre na etapa de implementação, não no planejamento.

---

## 8. Matriz de Validadores e Regras

### 8.1 E-mail

| Campo | Regra | Fonte |
|---|---|---|
| `email` | Trim (remover espaços) | Normalização padrão |
| `email` | Conversão para minúsculas | Constraint `email_lower_ck` em `00001_core_identity.sql` |
| `email` | Formato válido de endereço de e-mail | Validação de domínio |
| `email` | Não pode ser vazio após normalização | Obrigatoriedade |

**Nota técnica:** A constraint `CONSTRAINT email_lower_ck CHECK (email = LOWER(email))` confirma que o banco rejeita e-mails com maiúsculas. A normalização previne esse erro antes de chegar ao banco.

### 8.2 Senha

| Campo | Regra | Fonte |
|---|---|---|
| `password` | Mínimo de 8 caracteres | Requisito aprovado ETAPA 2.0.1 |
| `password` | Pelo menos 1 letra maiúscula | Requisito aprovado ETAPA 2.0.1 |
| `password` | Pelo menos 1 letra minúscula | Requisito aprovado ETAPA 2.0.1 |
| `password` | Pelo menos 1 número | Requisito aprovado ETAPA 2.0.1 |
| `password` | Pelo menos 1 símbolo | Requisito aprovado ETAPA 2.0.1 |
| `password` | **Nunca** incluir valor em mensagens de erro | Segurança — `lib/logger.ts` SENSITIVE_KEYS |
| `password` | **Nunca** logar o valor | Segurança — `lib/logger.ts` SENSITIVE_KEYS |

**Decisão pendente DP-1:** O requisito aprovado define "símbolo" mas não enumera os caracteres aceitos. **Proposta:** qualquer caractere que não seja letra (a-z, A-Z) nem dígito (0-9). A ser confirmado antes da implementação.

### 8.3 CNPJ

| Campo | Regra | Fonte |
|---|---|---|
| `cnpj` | Remover pontuação (`.`, `/`, `-`) e espaços | Normalização |
| `cnpj` | Exatamente 14 dígitos após normalização | Constraint `check_cnpj_format` em `00003_company.sql` |
| `cnpj` | Dígitos verificadores matematicamente válidos | Validação de domínio |
| `cnpj` | Rejeitar sequências repetidas (ex.: `00000000000000`) | Validação de domínio |
| `cnpj` | **Não** consultar APIs externas | Restrição de escopo |
| `cnpj` | **Não** afirmar existência/regularidade da empresa | Restrição semântica |

**Distinção obrigatória:**
- **Validação matemática (esta etapa):** verifica dígitos verificadores. Um CNPJ pode ser matematicamente válido mas inexistente ou cancelado.
- **Verificação oficial (RF16 — etapa futura):** consulta situação cadastral. **Não implementado nesta etapa.**

### 8.4 Schema de Cadastro de Candidato (RF01)

| Campo | Tipo | Regra |
|---|---|---|
| `email` | string | Validador de e-mail (normalizado) |
| `password` | string | Validador de senha |

**Decisão pendente DP-2:** Não há campos adicionais obrigatórios identificados nos requisitos aprovados para o cadastro inicial. Se houver campos adicionais no RF01, devem ser identificados na documentação oficial antes da implementação.

### 8.5 Schema de Cadastro de Empresa (RF02)

| Campo | Tipo | Regra |
|---|---|---|
| `email` | string | Validador de e-mail (normalizado) |
| `password` | string | Validador de senha |
| `cnpj` | string | Validador de CNPJ (normalizado + verificado) |
| `company_name` | string | Não vazio |
| `trading_name` | string ou null | Opcional (nullable no banco) |

**Decisão pendente DP-3:** Não está claro se o cadastro inicial coleta todos esses campos ou apenas email/senha, com dados da empresa preenchidos posteriormente. A ser confirmado com a documentação do RF02.

### 8.6 Schema Parcial de Perfil Profissional (RF06)

#### Perfil base (`candidate_profiles`)

| Campo | Tipo | Regra |
|---|---|---|
| `headline` | string ou null | Opcional |
| `short_summary` | string ou null | Opcional |
| `location` | string ou null | Opcional |

**Decisão pendente DP-4:** Sem limites de caracteres definidos nos requisitos aprovados. Não serão adicionados limites arbitrários.

#### Experiências (`experiences`)

| Campo | Tipo | Regra |
|---|---|---|
| `company_name` | string | Obrigatório (NOT NULL no banco) |
| `title` | string | Obrigatório (NOT NULL no banco) |
| `start_date` | date | Obrigatório (NOT NULL no banco) |
| `end_date` | date ou null | Opcional — null indica emprego atual |
| Relação datas | — | `end_date >= start_date` quando presente (constraint `check_exp_dates`) |
| `description` | string ou null | Opcional |

**Nota:** `check_exp_dates` no banco fornece respaldo explícito para validar a relação entre datas.

**Decisão pendente DP-5:** Sem regra explícita sobre `start_date` futuro. Sem respaldo, não será adicionada restrição.

#### Formação (`educations`)

| Campo | Tipo | Regra |
|---|---|---|
| `institution` | string | Obrigatório |
| `degree` | string | Obrigatório |
| `field_of_study` | string ou null | Opcional |
| `start_date` | date | Obrigatório |
| `end_date` | date ou null | Opcional — null indica curso em andamento |
| Relação datas | — | `end_date >= start_date` quando presente (constraint `check_edu_dates`) |

#### Certificações (`certifications`)

| Campo | Tipo | Regra |
|---|---|---|
| `name` | string | Obrigatório |
| `issuing_organization` | string | Obrigatório |
| `issue_date` | date | Obrigatório |
| `expiration_date` | date ou null | Opcional |
| `credential_id` | string ou null | Opcional |
| `credential_url` | string ou null | Opcional |

**Decisões pendentes DP-6/DP-7:** Sem regra explícita para `expiration_date >= issue_date` e sem definição de que `credential_url` deve ser URL válida. Ambos registrados como pendentes.

#### Idiomas (`languages`)

| Campo | Tipo | Regra |
|---|---|---|
| `language_name` | string | Obrigatório |
| `proficiency_level` | string | Obrigatório |

**Decisão pendente DP-8:** Sem enum definido para `proficiency_level`. Será aceito como string livre até decisão contrária.

#### Competências (`candidate_skills`)

O cadastro de habilidades envolve relação `candidate_id ↔ skill_id` — abordagem a ser definida na Server Action futura. Esta etapa registra apenas que a validação requer UUID válido para cada `skill_id`.

**Decisão pendente DP-9:** Fluxo de criação/seleção de skills não definido nos requisitos aprovados.

#### Projetos (`projects`)

| Campo | Tipo | Regra |
|---|---|---|
| `name` | string | Obrigatório |
| `description` | string ou null | Opcional |
| `url` | string ou null | Opcional |

**Decisão pendente DP-10:** Sem regra explícita de que `url` deve ser URL válida.

#### Currículo (`resumes`)

Upload de arquivo — fora do escopo de validação Zod desta etapa. Pertence à etapa de Storage.

---

## 9. Plano de Testes

> **Atenção:** Os testes abaixo são **planejados**. Nenhum teste foi executado nesta etapa de planejamento.

Os testes serão colocados em `tests/unit/validations/` e executados com `npm run test:unit`.

### 9.1 `email.test.ts` — Validador de E-mail

| # | Caso de teste | Entrada | Resultado esperado |
|---|---|---|---|
| 1 | E-mail válido simples | `"usuario@exemplo.com"` | Válido, retorna `"usuario@exemplo.com"` |
| 2 | E-mail com domínio composto | `"user@sub.dominio.com.br"` | Válido |
| 3 | E-mail com maiúsculas — normalização | `"USUARIO@EXEMPLO.COM"` | Válido, retorna `"usuario@exemplo.com"` |
| 4 | E-mail com espaços antes/depois | `"  user@ex.com  "` | Válido, retorna `"user@ex.com"` |
| 5 | E-mail com espaços e maiúsculas | `"  USER@EX.COM  "` | Válido, retorna `"user@ex.com"` |
| 6 | E-mail inválido — sem @ | `"usuariosemdominio"` | Inválido |
| 7 | E-mail inválido — sem domínio | `"usuario@"` | Inválido |
| 8 | E-mail inválido — sem usuário | `"@dominio.com"` | Inválido |
| 9 | E-mail vazio | `""` | Inválido |
| 10 | Apenas espaços | `"   "` | Inválido (após trim, string vazia) |
| 11 | E-mail com dois @ | `"a@b@c.com"` | Inválido |
| 12 | E-mail com ponto no final do domínio | `"a@b."` | Inválido |
| 13 | E-mail válido com + no usuário | `"user+tag@email.com"` | Válido |
| 14 | E-mail válido com números | `"user123@domain456.com"` | Válido |

### 9.2 `password.test.ts` — Validador de Senha

> **Regra de segurança:** Nenhum caso de teste deve registrar ou expor o valor da senha em mensagens de erro ou contexto de log.

| # | Caso de teste | Entrada | Resultado esperado |
|---|---|---|---|
| 1 | Senha válida — todos os critérios | `"Senha@123"` | Válida |
| 2 | Senha válida — símbolo diferente | `"Pass#word1"` | Válida |
| 3 | Exatamente 8 caracteres (limite inferior) | `"Abc!1234"` | Válida |
| 4 | Senha longa e complexa | `"MinhaSenh@Muito_Forte_2026!"` | Válida |
| 5 | 7 caracteres (abaixo do mínimo) | `"Abc!123"` | Inválida — muito curta |
| 6 | Sem letra maiúscula | `"senha@123"` | Inválida |
| 7 | Sem letra minúscula | `"SENHA@123"` | Inválida |
| 8 | Sem número | `"SenhaForte!"` | Inválida |
| 9 | Sem símbolo | `"SenhaForte1"` | Inválida |
| 10 | Apenas letras minúsculas | `"senhaforte"` | Inválida |
| 11 | Apenas números | `"12345678"` | Inválida |
| 12 | String vazia | `""` | Inválida |
| 13 | Apenas espaços | `"        "` | Inválida |
| 14 | Mensagem de erro não contém o valor | Qualquer senha inválida | Mensagem de erro não inclui o valor da senha |
| 15 | 9 caracteres (acima do mínimo) | `"Abc!12345"` | Válida |

### 9.3 `cnpj.test.ts` — Validador de CNPJ

| # | Caso de teste | Entrada | Resultado esperado |
|---|---|---|---|
| 1 | CNPJ válido com pontuação | `"11.222.333/0001-81"` | Válido, retorna `"11222333000181"` |
| 2 | CNPJ válido sem pontuação | `"11222333000181"` | Válido |
| 3 | CNPJ válido — outro exemplo | `"45.723.174/0001-27"` | Válido |
| 4 | CNPJ com espaços | `" 11.222.333/0001-81 "` | Válido após normalização |
| 5 | Sequência repetida `00000000000000` | `"00000000000000"` | Inválido |
| 6 | Sequência repetida `11111111111111` | `"11111111111111"` | Inválido |
| 7 | Sequência repetida `99999999999999` | `"99999999999999"` | Inválido |
| 8 | Dígito verificador errado | `"11222333000182"` | Inválido |
| 9 | 13 dígitos | `"1122233300018"` | Inválido |
| 10 | 15 dígitos | `"112223330001810"` | Inválido |
| 11 | Com letras | `"112223330001AB"` | Inválido |
| 12 | String vazia | `""` | Inválido |
| 13 | CNPJ válido não implica empresa existente | — | Documentado no tipo: validação matemática apenas |

### 9.4 `candidate-register.test.ts` — Schema RF01

| # | Caso de teste | Entrada | Resultado esperado |
|---|---|---|---|
| 1 | Input válido | `{ email: "cand@ex.com", password: "Senha@123" }` | Válido, e-mail normalizado |
| 2 | E-mail inválido | `{ email: "invalido", password: "Senha@123" }` | Inválido — campo `email` |
| 3 | Senha inválida | `{ email: "cand@ex.com", password: "curta" }` | Inválido — campo `password` |
| 4 | E-mail com maiúsculas | `{ email: "CAND@EX.COM", password: "Senha@123" }` | Válido, email = `"cand@ex.com"` |
| 5 | Campo `role` presente | `{ email: "...", password: "...", role: "ADMIN" }` | Schema rejeita ou ignora `role` |
| 6 | Campos faltando | `{}` | Inválido |

### 9.5 `company-register.test.ts` — Schema RF02

| # | Caso de teste | Entrada | Resultado esperado |
|---|---|---|---|
| 1 | Input válido com pontuação no CNPJ | `{ email: "...", password: "Senha@123", cnpj: "11.222.333/0001-81", company_name: "Empresa LTDA" }` | Válido, CNPJ normalizado |
| 2 | CNPJ sem pontuação | `{ ..., cnpj: "11222333000181" }` | Válido |
| 3 | CNPJ inválido | `{ ..., cnpj: "11111111111111" }` | Inválido — campo `cnpj` |
| 4 | E-mail inválido | `{ email: "invalido", ... }` | Inválido — campo `email` |
| 5 | Senha inválida | `{ ..., password: "fraca" }` | Inválido — campo `password` |
| 6 | `company_name` ausente | `{ email: "...", password: "...", cnpj: "..." }` | Inválido |
| 7 | `trading_name` nulo | `{ ..., trading_name: null }` | Válido |
| 8 | Campo `role` presente | `{ ..., role: "COMPANY" }` | Schema rejeita ou ignora `role` |

### 9.6 `candidate-profile.test.ts` — Schema Parcial RF06

| # | Caso de teste | Entrada | Resultado esperado |
|---|---|---|---|
| 1 | Experiência válida com encerramento | `{ company_name: "Emp", title: "Dev", start_date: "2022-01-01", end_date: "2023-01-01" }` | Válido |
| 2 | Experiência sem encerramento (atual) | `{ company_name: "Emp", title: "Dev", start_date: "2022-01-01", end_date: null }` | Válido |
| 3 | `end_date` anterior a `start_date` | `{ ..., start_date: "2023-01-01", end_date: "2022-01-01" }` | Inválido |
| 4 | `company_name` ausente | `{ title: "Dev", start_date: "..." }` | Inválido |
| 5 | Formação em andamento | `{ institution: "UFMG", degree: "BSc", start_date: "2020-03-01", end_date: null }` | Válido |
| 6 | Certificação válida | `{ name: "AWS SAA", issuing_organization: "Amazon", issue_date: "2024-01-01" }` | Válido |
| 7 | Idioma válido | `{ language_name: "Inglês", proficiency_level: "Avançado" }` | Válido |
| 8 | Projeto sem URL | `{ name: "DevJobs", description: "..." }` | Válido |
| 9 | Perfil base com campos nulos | `{ headline: null, short_summary: null, location: null }` | Válido |
| 10 | Campos obrigatórios ausentes em experiência | `{}` | Inválido |

---

## 10. Matriz de Rastreabilidade RF → Regra → Validador → Teste

| RF | Regra de Negócio | Validador | Arquivo de teste |
|---|---|---|---|
| RF01 | E-mail normalizado e com formato válido | `EmailSchema` | `email.test.ts`, `candidate-register.test.ts` |
| RF01 | Senha com critérios de complexidade | `PasswordSchema` | `password.test.ts`, `candidate-register.test.ts` |
| RF01 | `role` não aceito como entrada do cliente | `CandidateRegisterSchema` | `candidate-register.test.ts` (caso #5) |
| RF02 | E-mail normalizado e com formato válido | `EmailSchema` | `email.test.ts`, `company-register.test.ts` |
| RF02 | Senha com critérios de complexidade | `PasswordSchema` | `password.test.ts`, `company-register.test.ts` |
| RF02 | CNPJ com 14 dígitos e verificadores válidos | `CnpjSchema` | `cnpj.test.ts`, `company-register.test.ts` |
| RF02 | CNPJ normalizado (sem pontuação) | `CnpjSchema` | `cnpj.test.ts` (casos 1, 4) |
| RF02 | CNPJ não implica verificação oficial | `CnpjSchema` | `cnpj.test.ts` (caso 13) |
| RF06 | `end_date >= start_date` em experiências | `ExperienceSchema` | `candidate-profile.test.ts` (caso 3) |
| RF06 | `end_date >= start_date` em formação | `EducationSchema` | `candidate-profile.test.ts` |
| RF06 | Campos obrigatórios conforme banco | `ExperienceSchema`, etc. | `candidate-profile.test.ts` |

---

## 11. Impactos em Banco, Segurança, API, UX/UI, Documentação e UML

### 11.1 Banco de Dados e Migrations

**Impacto: Nenhum.**

As migrations existentes (`00001` a `00007`) já modelam todas as tabelas e constraints relevantes. Os validadores Zod implementam na aplicação as mesmas regras que o banco impõe via constraints (`email_lower_ck`, `check_cnpj_format`, `check_exp_dates`, `check_edu_dates`). Não há necessidade de novas migrations.

### 11.2 RLS e Políticas

**Impacto: Nenhum.**

Os validadores operam antes do dado chegar ao banco. As políticas de RLS em `00007_rls_policies.sql` não são afetadas.

### 11.3 API e Server Actions Futuras

**Impacto: Preparatório (sem alteração).**

Os schemas planejados serão a entrada das Server Actions futuras. Nenhuma rota ou Server Action é criada nesta etapa.

### 11.4 UX/UI Futura

**Impacto: Preparatório (sem alteração).**

Os tipos inferidos e mensagens de erro dos schemas serão usados pelos formulários futuros. A UX/UI não é implementada nesta etapa.

### 11.5 Segurança

**Impacto estrutural: Nenhum. Impacto de reforço: positivo.**

- Normalização previne inconsistências (e-mail com maiúsculas, CNPJ com formatação variável).
- Validação de senha previne senhas fracas.
- Schemas não aceitam `role` como entrada, reforçando que autorização vem do banco.
- Nenhuma mudança em políticas de segurança, proxy ou clientes Supabase.

### 11.6 Documentação

**Impacto: Nenhum nesta etapa.**

O `README.md` será atualizado somente após aprovação humana e implementação.

### 11.7 Diagramas UML

**Impacto: Nenhum nesta etapa.**

Os validadores são utilitários de aplicação que não alteram o modelo de domínio, entidades, relacionamentos ou fluxos. A etapa 2.2 não introduz novas entidades ou associações.

---

## 12. Riscos, Decisões Pendentes e Mitigação

### 12.1 Decisões Pendentes

| # | Decisão | Impacto | Ação recomendada |
|---|---|---|---|
| DP-1 | Definição exata de "símbolo" para senha | Altera regex do validador | Confirmar antes da implementação |
| DP-2 | Campos do RF01 no momento do cadastro | Altera `CandidateRegisterSchema` | Verificar documentação oficial |
| DP-3 | Fluxo do RF02: dados coletados no cadastro ou depois | Altera `CompanyRegisterSchema` | Verificar documentação oficial |
| DP-4 | Limites de caracteres para `headline` e `short_summary` | Pode adicionar `.max()` | Verificar requisitos do RF06 |
| DP-5 | Regra de `start_date` futura em experiências | Pode adicionar validação | Verificar requisitos do RF06 |
| DP-6 | Regra `expiration_date >= issue_date` em certificações | Pode adicionar refinement | Verificar requisitos do RF06 |
| DP-7 | `credential_url` deve ser URL válida | Pode adicionar `.url()` | Verificar requisitos do RF06 |
| DP-8 | Enum de `proficiency_level` para idiomas | Pode restringir para valores predefinidos | Verificar requisitos do RF06 |
| DP-9 | Fluxo de criação/seleção de skills | Altera validação de `candidate_skills` | Verificar requisitos do RF06 |
| DP-10 | `url` de projeto deve ser URL válida | Pode adicionar `.url()` | Verificar requisitos do RF06 |

### 12.2 Riscos

| Risco | Probabilidade | Severidade | Mitigação |
|---|---|---|---|
| Decisões pendentes não resolvidas atrasam implementação | Média | Alta | Resolver DPs antes de iniciar |
| Schema diverge de campos reais do formulário futuro | Baixa | Média | Campos opcionais por padrão |
| Regex de símbolo muito restritiva | Baixa | Média | Definição ampla + testes de limite |
| Testes acoplados a implementação interna | Baixa | Baixa | Testar via `.safeParse()`, não internals |

---

## 13. Critérios de Aceitação da Futura Implementação

A implementação desta etapa será considerada concluída quando:

- [ ] Todos os 12 arquivos listados na Seção 7 foram criados.
- [ ] `email.schema.ts` normaliza (trim + lowercase) e valida formato.
- [ ] `password.schema.ts` aplica as 5 regras sem logar o valor.
- [ ] `cnpj.schema.ts` normaliza, valida 14 dígitos, verifica verificadores e rejeita repetidas.
- [ ] Schemas de cadastro (RF01 e RF02) não aceitam o campo `role` como entrada.
- [ ] Todos os 52 casos de teste planejados na Seção 9 foram implementados.
- [ ] `npm run lint` passa sem erros.
- [ ] `npm run typecheck` passa sem erros.
- [ ] `npm run test:unit` passa sem erros.
- [ ] `npm run build` passa sem erros.
- [ ] Nenhum validador importa módulo de `lib/supabase/`.
- [ ] Nenhum teste depende de variáveis de ambiente do Supabase.
- [ ] Mensagens de erro de senha nunca incluem o valor da senha.
- [ ] Tipos TypeScript inferidos pelo Zod, sem duplicação manual.
- [ ] Decisões pendentes resolvidas incorporadas ou documentadas.
- [ ] `README.md` atualizado para refletir ETAPA 2.2 como APROVADA.

---

## 14. Comandos de Validação para a Etapa de Implementação

```bash
# 1. Lint
npm run lint

# 2. Tipagem estática
npm run typecheck

# 3. Testes unitários
npm run test:unit

# 4. Todos os testes (sem regressão nos existentes)
npm test

# 5. Build de produção
npm run build
```

Todos os comandos devem retornar código de saída `0` para que a implementação seja considerada válida.

---

## 15. Declaração de Integridade

> **Declaração explícita:** Nenhum arquivo do projeto foi criado, modificado ou excluído durante a elaboração deste plano. Nenhuma dependência foi instalada ou removida. Nenhuma migration foi criada ou alterada. Nenhum commit ou push foi realizado. Nenhum dado do banco de dados foi alterado. Nenhuma configuração de ambiente foi modificada.
>
> Esta etapa consistiu exclusivamente em leitura e análise do estado atual do repositório, seguida da elaboração do presente plano técnico em documento externo.

---

## ETAPA 2.2 — PLANEJAMENTO CONCLUÍDO, AGUARDANDO APROVAÇÃO HUMANA
