---
title: "ETAPA 2.2 — Plano revisado: validadores Zod e testes de domínio"
status: "Aguardando aprovação humana"
data: "2026-09-26"
---

# ETAPA 2.2 — Plano revisado: validadores Zod e testes de domínio

## 1. Objetivo e limite da etapa

Planejar validadores Zod puros, tipos inferidos e testes unitários de domínio para partes aprovadas de RF01, RF02 e RF06. Esta etapa não cria UI, Server Actions, Route Handlers, integração com Supabase, migrations, RLS, APIs, dependências ou alterações em requisitos oficiais.

O plano registra decisões humanas recebidas nesta revisão. Ele não é autorização para implementação. Em particular, RF02 permanece bloqueado até aprovação explícita do seu contrato.

## 2. Fontes e estado verificado

| Fonte | Uso nesta revisão |
|---|---|
| `docs/referencias/DevJobs 2.0 - Requisitos Funcionais e Regras de Neg├│cio UML.pdf` | RF01, RF02, RF05, RF06 e RF16; limites funcionais confirmados |
| `docs/referencias/etapa_2_2_plano_tecnico.md` | Arquitetura e matriz original a reconciliar; não é fonte de aprovação por si só |
| `README.md` | Arquitetura mestre, separação de clientes Supabase, segurança, UX/UI, qualidade e rastreabilidade |
| `supabase/migrations/00001_core_identity.sql` a `00007_rls_policies.sql` | Estrutura, constraints, RLS e limites de persistência |
| `package.json` e `vitest.config.ts` | Versões instaladas e comandos de validação existentes |

Estado no início da revisão: raiz `F:/Estudos_e_Projetos/DevJobs 2.0`, branch `main`, commit `d45f00fe35560aa0439d7392cd9e3dc78e722713` (`d45f00f`). A árvore já possuía `.agents/`, `AGENTS.md`, `CLAUDE.md` e `docs/` não rastreados; foram preservados. Não houve reset, limpeza, commit ou push.

## 3. Decisões e pendências

| ID | Assunto | Estado | Registro operacional |
|---|---|---|---|
| DEC-22-01 / DP-2 | RF01, credenciais mínimas | **APROVADA** | Nesta etapa, o schema de credenciais de candidato recebe somente `email` e `password`. Isso não limita todo RF01 a esses campos. |
| DEC-22-02 / DP-1 | Senha | **APROVADA** | Mínimo 8, pelo menos uma maiúscula, minúscula, número e símbolo ASCII de pontuação. Símbolos aceitos: `!"#$%&'()*+,-./:;<=>?@[\\]^_\`{|}~`. Espaço não pertence ao conjunto e não satisfaz a regra de símbolo. Esta é decisão técnica aprovada; o detalhe não foi comprovado como texto integral de RNF02. |
| DEC-22-03 | Datas | **APROVADA** | Entrada `YYYY-MM-DD`, data real de calendário, distinção entre omitido e `null`; em experiência e formação, `end_date >= start_date` quando informado e não nulo. Datas futuras continuam permitidas. Não há regra entre emissão e expiração de certificação. |
| DEC-22-04 / DP-9 | Skills | **APROVADA** | Criação, busca, seleção, resolução em banco e contrato de API ficam adiados. RF06 continua prevendo suporte futuro a skills. |
| DEC-22-05 | Matriz de testes | **APROVADA** | Manter 65 testes unitários executáveis e uma nota documental, fora da contagem. |
| DP-3 / RF02 | Contrato de cadastro de empresa | **PENDENTE DE APROVAÇÃO HUMANA** | Há evidência de CNPJ obrigatório, dados institucionais e `User` COMPANY pendente, mas não de lista exaustiva nem momento de coleta. Bloqueia schema e testes de RF02. |
| DP-4 | Limites de campos do perfil | **SEM EVIDÊNCIA — LIMITE CONSERVADOR** | Não adicionar `.min()` ou `.max()` além de obrigatoriedade estrutural comprovada. |
| DP-5 | Datas de início futuras | **RESOLVIDA POR DEC-22-03** | Não proibir datas futuras. |
| DP-6 | Relação de datas em certificação | **RESOLVIDA POR DEC-22-03** | Não exigir `expiration_date >= issue_date`. |
| DP-7 | URL de credencial | **SEM EVIDÊNCIA — LIMITE CONSERVADOR** | Não exigir URL válida para `credential_url`. |
| DP-8 | Enum de proficiência | **SEM EVIDÊNCIA — LIMITE CONSERVADOR** | Não criar enum; `proficiency_level` permanece texto obrigatório. |
| DP-10 | URL de projeto | **SEM EVIDÊNCIA — LIMITE CONSERVADOR** | Não exigir URL válida para `projects.url`. |

## 4. Banco: fatos confirmados e limites

| Área | Estrutura confirmada | Consequência no plano |
|---|---|---|
| `public.users` | `role user_role NOT NULL`; `email TEXT NOT NULL UNIQUE`; `email = LOWER(email)` | Zod valida sintaxe e normaliza conforme contrato; unicidade e constraint de minúsculas são garantias de persistência, não prova de formato completo no banco. |
| `company_profiles` | `cnpj TEXT NOT NULL UNIQUE`, `company_name TEXT NOT NULL`, `trading_name TEXT`, `website TEXT`, `description TEXT`, status padrão `PENDING`; regex somente `^\d{14}$` | Banco não valida dígitos verificadores, existência, atividade ou regularidade do CNPJ. |
| `experiences` | empresa, cargo e início obrigatórios; fim e descrição anuláveis; `end_date IS NULL OR end_date >= start_date` | Schema valida calendário, omitido versus `null` e a mesma relação cronológica. |
| `educations` | instituição, grau e início obrigatórios; área e fim anuláveis; mesma constraint cronológica | Mesma estratégia de datas de experiências. |
| `certifications` | nome, emissor e emissão obrigatórios; expiração, identificador e URL anuláveis | Datas reais são validadas; nenhuma relação cronológica ou URL é inventada. |
| `languages` | nome e proficiência `TEXT NOT NULL` | Sem enum adicional. |
| `projects` | nome obrigatório; descrição e URL anuláveis | Sem validação de URL adicional. |
| RLS e papéis | `public.users.role` é autoritativo; policies aplicam identidade, vínculo e contexto | Zod não concede autorização e não substitui RLS ou verificações de servidor. |

## 5. Arquitetura e contratos previstos

Os validadores serão puros, sem import de `lib/supabase/`, banco, rede, segredo ou ambiente. Zod `3.25.76` suporta `z.string().date()`, `.strict()`, `.transform()`, `.safeParse()` e refinamentos necessários.

### 5.1 Compartilhados

| Schema | Contrato previsto |
|---|---|
| `EmailSchema` | Recebe string, aplica `trim()` e `toLowerCase()`, valida sintaxe. A transformação é decisão de contrato alinhada à constraint de persistência; o banco continua autoritativo para unicidade. |
| `PasswordSchema` | Recebe string de pelo menos 8 caracteres com maiúscula, minúscula, dígito e pelo menos um caractere do conjunto ASCII de pontuação definido em DEC-22-02. Espaço não é símbolo. Erros nunca repetem a senha. |
| `CnpjSchema` | Recebe string, remove espaços nas extremidades e pontuação de apresentação (`.`, `/`, `-`), exige 14 dígitos, rejeita repetidos e valida dígitos verificadores localmente. Não consulta rede nem atesta empresa existente, ativa ou regular. |

### 5.2 Cadastro de candidato — RF01

`CandidateRegisterSchema` receberá somente `{ email, password }`, será estrito e rejeitará `role`, `user_id`, `id` e qualquer chave não contratada. O papel CANDIDATE será definido posteriormente em fluxo confiável de servidor; payload não determina papel.

### 5.3 Cadastro de empresa — RF02: proposta bloqueada

**Proposta para aprovação humana, não contrato vigente:** separar credenciais de dados institucionais e submetê-los de forma atômica no cadastro inicial:

| Grupo | Obrigatórios propostos | Opcionais propostos | Não aceitos do cliente |
|---|---|---|---|
| Credenciais | `email`, `password` | — | `role`, `id`, `user_id` |
| Dados institucionais | `cnpj`, `company_name` | `trading_name` omitido ou `null`; `website` e `description` coletados posteriormente até decisão funcional | `verification_status`, `company_id` e quaisquer chaves desconhecidas |

Compatibilidade: `cnpj` e `company_name` atendem aos `NOT NULL` de `company_profiles`; `trading_name`, `website` e `description` são anuláveis. O servidor, e não o payload, deverá determinar o papel COMPANY e o status PENDING.

Impacto de fluxo a definir na aprovação: criação de Auth e de registros públicos ocorre em sistemas distintos; a implementação deve prever uma sequência recuperável, idempotência e compensação explícita se Auth for criado e a persistência pública falhar. A criação de membership e seu papel não são inferidos por este plano, pois não estão definidos pelo contrato de RF02 consultado.

Enquanto esta proposta não for aprovada, não criar `CompanyRegisterSchema` nem `company-register.test.ts`.

### 5.4 Perfil profissional — RF06

`candidate-profile.schema.ts` organizará exports independentes; não exigirá envio conjunto de entidades. IDs de candidato são derivados do contexto de servidor, embora sejam obrigatórios para persistência no banco.

| Schema independente | Campos e contrato previsto |
|---|---|
| Perfil-base | `headline`, `short_summary`, `location`: texto opcional e anulável; sem limites não aprovados. |
| Experiência | `company_name`, `title`, `start_date` obrigatórios; `end_date` e `description` opcionais/anuláveis. Datas `YYYY-MM-DD` reais; relação de datas aprovada. |
| Formação | `institution`, `degree`, `start_date` obrigatórios; `field_of_study` e `end_date` opcionais/anuláveis. Datas e relação como em experiências. |
| Certificação | `name`, `issuing_organization`, `issue_date` obrigatórios; `expiration_date`, `credential_id`, `credential_url` opcionais/anuláveis; datas reais, sem relação emissão-expiração e sem regra de URL. |
| Idioma | `language_name`, `proficiency_level` obrigatórios como texto; sem enum. |
| Projeto | `name` obrigatório; `description`, `url` opcionais/anuláveis; sem regra de URL. |
| Skills | Adiado por DEC-22-04; sem schema, banco, busca, seleção ou contrato nesta etapa. |

Currículos e Storage permanecem fora do escopo desta etapa.

## 6. Segurança

- `CandidateRegisterSchema` e o futuro `CompanyRegisterSchema` devem usar `.strict()` ou mecanismo equivalente que produza falha de validação para `role` e demais chaves não permitidas; remoção silenciosa não é aceitável.
- Testes devem provar rejeição de `role: "ADMIN"` nos dois schemas de cadastro; o cenário de empresa permanece planejado e bloqueado por RF02.
- Autoridade continua em identidade autenticada, `public.users.role`, ownership/membership, contexto de recurso, RLS e autorização de servidor.
- `user_metadata.role`, estado do cliente e payload nunca concedem privilégio. `SUPABASE_SERVICE_ROLE_KEY` permanece exclusiva do servidor.

## 7. Matriz reconciliada de testes unitários — 65 executáveis

O plano original listava 66 linhas: 65 testes executáveis e uma nota documental sobre CNPJ. Seu critério de aceite citava incorretamente 52. DEC-22-05 mantém 65 testes; a nota não é teste.

Para acomodar os casos obrigatórios de calendário e datas sem elevar a contagem, esta matriz realoca cenários redundantes de e-mail, senha e CNPJ para o perfil. O total não muda. Os oito cenários de empresa são condicionais à aprovação de RF02 e não autorizam sua implementação antes dela.

### `tests/unit/validations/email.test.ts` — 10

| # | Cenário | Asserção esperada |
|---:|---|---|
| E01 | E-mail simples válido | sucesso, saída normalizada |
| E02 | Maiúsculas | sucesso, saída em minúsculas |
| E03 | Espaços externos | sucesso, saída sem espaços externos |
| E04 | Sem `@` | falha |
| E05 | Sem domínio | falha |
| E06 | Sem parte local | falha |
| E07 | Vazio | falha |
| E08 | Apenas espaços | falha após `trim()` |
| E09 | Dois `@` | falha |
| E10 | Ponto ao fim do domínio | falha |

### `tests/unit/validations/password.test.ts` — 12

| # | Cenário | Asserção esperada |
|---:|---|---|
| P01 | Senha com todos os critérios | sucesso |
| P02 | Exatamente 8 caracteres | sucesso |
| P03 | Símbolo ASCII alternativo permitido | sucesso |
| P04 | Sete caracteres | falha de mínimo |
| P05 | Sem maiúscula | falha |
| P06 | Sem minúscula | falha |
| P07 | Sem dígito | falha |
| P08 | Espaço como único candidato a símbolo | falha; espaço não satisfaz a regra |
| P09 | Somente minúsculas | falha |
| P10 | Vazia | falha |
| P11 | Apenas espaços | falha |
| P12 | Erro de senha inválida | mensagem e metadados não contêm a senha |

### `tests/unit/validations/cnpj.test.ts` — 9

| # | Cenário | Asserção esperada |
|---:|---|---|
| J01 | CNPJ matematicamente válido formatado | sucesso e saída com 14 dígitos |
| J02 | CNPJ válido sem pontuação | sucesso |
| J03 | Espaços externos | sucesso após normalização |
| J04 | Sequência repetida | falha |
| J05 | Dígito verificador incorreto | falha |
| J06 | Treze dígitos | falha |
| J07 | Quinze dígitos | falha |
| J08 | Letras | falha |
| J09 | Vazio | falha |

**Nota documental, fora da contagem:** êxito matemático do CNPJ não comprova existência, situação ativa ou regularidade da empresa; RF16 cobre verificação institucional e não será consultado por teste unitário.

### `tests/unit/validations/candidate-register.test.ts` — 6

| # | Cenário | Asserção esperada |
|---:|---|---|
| R01 | `{ email, password }` aprovado | sucesso, e-mail normalizado |
| R02 | E-mail inválido | falha no campo `email` |
| R03 | Senha inválida | falha no campo `password` |
| R04 | `role: "ADMIN"` | falha explícita por chave proibida |
| R05 | `user_id` ou `id` enviado pelo cliente | falha explícita por chave proibida |
| R06 | Campos obrigatórios ausentes | falha |

### `tests/unit/validations/company-register.test.ts` — 8 condicionais a RF02

| # | Cenário | Asserção esperada após aprovação do contrato |
|---:|---|---|
| C01 | Credenciais, CNPJ e `company_name` válidos | sucesso e normalizações previstas |
| C02 | CNPJ inválido | falha em `cnpj` |
| C03 | E-mail inválido | falha em `email` |
| C04 | Senha inválida | falha em `password` |
| C05 | `company_name` ausente | falha |
| C06 | `trading_name: null` | sucesso |
| C07 | `role: "ADMIN"` | falha explícita por chave proibida |
| C08 | `verification_status` ou identificador privilegiado | falha explícita por chave proibida |

### `tests/unit/validations/candidate-profile.test.ts` — 20

| # | Cenário | Asserção esperada |
|---:|---|---|
| F01 | Perfil-base com textos | sucesso |
| F02 | Perfil-base com todos os campos `null` | sucesso |
| F03 | Experiência válida, fim e descrição omitidos | sucesso; omitido é preservado como ausência do input |
| F04 | Experiência com `end_date` e descrição `null` | sucesso |
| F05 | Experiência com `2023-02-29` | falha de data de calendário |
| F06 | Experiência com fim anterior ao início | falha de intervalo |
| F07 | Experiência sem `company_name` | falha |
| F08 | Formação válida, fim e área omitidos | sucesso |
| F09 | Formação com `end_date` e `field_of_study` `null` | sucesso |
| F10 | Formação com `2024-04-31` | falha de data de calendário |
| F11 | Formação com fim anterior ao início | falha de intervalo |
| F12 | Formação sem `degree` | falha |
| F13 | Certificação com opcionais omitidos | sucesso |
| F14 | Certificação com opcionais `null` | sucesso |
| F15 | Certificação com `issue_date` impossível | falha de data de calendário |
| F16 | Expiração anterior à emissão e expiração impossível | primeira entrada aceita; segunda falha somente por calendário, não por relação cronológica |
| F17 | Idioma com proficiência textual não enumerada | sucesso |
| F18 | Idioma sem `proficiency_level` | falha |
| F19 | Projeto com opcionais `null` e URL não formatada | sucesso; nenhuma regra de URL foi adicionada |
| F20 | Projeto sem `name` | falha |

**Total:** 10 + 12 + 9 + 6 + 8 + 20 = **65 testes unitários executáveis**, dos quais 8 são condicionais à aprovação de RF02. Nenhum foi criado ou executado nesta revisão.

## 8. Rastreabilidade

| RF | Regra/decisão | Schema planejado | Testes |
|---|---|---|---|
| RF01 | DEC-22-01, DEC-22-02, e-mail normalizado; campos privilegiados rejeitados | `EmailSchema`, `PasswordSchema`, `CandidateRegisterSchema` | E01–E10, P01–P12, R01–R06 |
| RF02 | CNPJ local; proposta de credenciais e perfil institucional; papel/status fora do payload | `CnpjSchema`, futuro `CompanyRegisterSchema` | J01–J09; C01–C08 condicionais |
| RF05 | Papel não é autoridade do cliente | Schemas de cadastro estritos | R04–R05, C07–C08 condicionais |
| RF06 | Componentes independentes, datas e nulabilidade conforme migrations; skills adiadas | Schemas de perfil independentes | F01–F20 |
| RF16 | Verificação institucional externa ao validador local | Nenhum nesta etapa | Nota documental de CNPJ; sem rede |

## 9. Arquivos previstos para implementação futura

| Caminho | Estado |
|---|---|
| `lib/validations/shared/email.schema.ts` | Planejado |
| `lib/validations/shared/password.schema.ts` | Planejado |
| `lib/validations/shared/cnpj.schema.ts` | Planejado; não verifica instituição |
| `lib/validations/candidate/register.schema.ts` | Planejado e respaldado por DEC-22-01 |
| `lib/validations/company/register.schema.ts` | **Bloqueado por RF02** |
| `lib/validations/profile/candidate-profile.schema.ts` | Planejado; exports separados por entidade |
| `tests/unit/validations/email.test.ts` | Planejado |
| `tests/unit/validations/password.test.ts` | Planejado |
| `tests/unit/validations/cnpj.test.ts` | Planejado |
| `tests/unit/validations/candidate-register.test.ts` | Planejado |
| `tests/unit/validations/company-register.test.ts` | **Bloqueado por RF02** |
| `tests/unit/validations/candidate-profile.test.ts` | Planejado |

## 10. Gates e critérios de aceite da futura implementação

Comandos existentes, a executar somente durante a implementação autorizada:

```bash
npm run lint
npm run typecheck
npm run test:unit
npm test
npm run build
```

Aceite futuro:

- schemas e testes somente nos caminhos aprovados;
- sem import de Supabase, banco, rede, segredo ou ambiente em validadores unitários;
- e-mail normalizado e sintaticamente validado; banco preserva unicidade e constraints;
- todas as regras de senha de DEC-22-02, inclusive espaço não contado como símbolo;
- CNPJ determinístico com verificadores e sem alegação institucional;
- `role: "ADMIN"` e demais chaves privilegiadas rejeitados explicitamente nos cadastros implementados;
- datas impossíveis e intervalos inválidos de experiência/formação rejeitados;
- nulabilidade e campos obrigatórios coerentes com migrations e contratos aprovados;
- nenhuma enumeração, limite, relação de certificação ou validação de URL não aprovada;
- 65 testes executáveis reconciliados, sem contar a nota documental;
- RF02 não implementado até aprovação específica;
- gates reportados com resultados reais, sem declarar aprovação antecipada.

## 11. Impacto, riscos e próximo passo

| Área | Impacto desta revisão documental |
|---|---|
| Banco, migrations, RLS e grants | Nenhum; somente inspeção e referência às regras existentes. |
| API, Server Actions e Auth | Nenhum; contratos futuros registrados. |
| Segurança | Reforço de planejamento: rejeição explícita de payload privilegiado e manutenção de autoridade no servidor. |
| UI/UX | Nenhum; estados futuros dependem dos contratos aprovados. |
| Documentação e UML | Este plano foi criado; não há alteração de modelo ou fluxo aprovada que exija diagrama nesta revisão. |

Riscos e dependências:

1. **RF02 bloqueia** o schema e os oito testes condicionais de empresa; aprovar o contrato e a estratégia de compensação Auth → registros públicos é obrigatório.
2. Os documentos não aprovam criação/seleção de skills; DEC-22-04 mantém a dependência para etapa posterior.
3. Nenhum teste ou gate foi executado nesta fase de governança.
4. A implementação completa não está autorizada: exige aprovação humana deste plano e, separadamente, do contrato RF02. Após isso, a autorização explícita do usuário continua necessária para iniciar código.

## 12. Declaração de integridade

Nesta revisão foi criado somente este documento de planejamento. O PDF e o plano original em `docs/referencias/` foram preservados. Não foram alterados código, testes, migrations, banco, RLS, APIs, UI, dependências, configurações ou README. Não houve commit ou push.

**ETAPA 2.2 — PLANO ATUALIZADO, AGUARDANDO APROVAÇÃO HUMANA**

## 13. Registro posterior de decisões de planejamento visual

**Data:** 2026-09-28  
**Natureza:** registro de decisão humana para planejamento; não autoriza implementação, alteração de código, integração, migrations, RLS, schemas, testes, dependências ou configuração.

| ID | Assunto | Estado | Registro operacional |
|---|---|---|---|
| DPV-01 | Direção visual do produto | **APROVADA COMO REFERÊNCIA DE PLANEJAMENTO** | Signal Indigo é a direção para o planejamento visual imersivo: azul profundo/índigo, destaques azul elétrico e violeta, luzes quentes e cenários digitais. Não aprova definitivamente telas, tokens, imagens, animações, componentes ou implementação. |
| DPV-02 | Prioridade do frontend | **APROVADA SOMENTE PARA PLANEJAMENTO** | Fundação visual e navegação responsiva são a prioridade de planejamento. Esta decisão não autoriza criação de páginas, componentes, CSS, rotas, contratos de API, Server Actions, integração de formulários ou funcionalidades. |
| DPA-01 | Clientes Supabase | **AUDITORIA OBRIGATÓRIA, DECISÃO PENDENTE** | `lib/supabase/` e `infrastructure/supabase/` devem ser auditados antes de propor uma estrutura canônica. Não apagar, migrar, duplicar ou alterar arquivos até aprovação humana da recomendação. |
| DPV-03 | Composição híbrida do hero | **APROVADA SOMENTE PARA PLANEJAMENTO** | `AST-01` é cenário-base completo e independente. `AST-07` (personagem) e `AST-13` (camada atmosférica) são overlays opcionais, usados somente se acrescentarem valor perceptível. A decisão não aprova arquivos gerados nem implementação. |

Limites preservados:

- O contrato de cadastro de empresa do **RF02** continua pendente de aprovação humana; nenhuma tela, schema, teste ou integração de cadastro de empresa está autorizada.
- O status geral deste plano continua **Aguardando aprovação humana**. A prioridade visual registrada acima não equivale à aprovação da implementação da ETAPA 2.2.
