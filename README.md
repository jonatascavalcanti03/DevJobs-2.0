# DevJobs 2.0

Plataforma SaaS de recrutamento e conexão profissional, reconstruída do zero com foco em segurança, integridade de dados, escalabilidade, experiência do usuário e rastreabilidade técnica.

> **Status atual:** arquitetura e infraestrutura base aprovadas. Implementação funcional em evolução por etapas controladas.

## Visão geral

O DevJobs 2.0 é uma nova versão do projeto DevJobs, construída como um **greenfield**. O objetivo é oferecer uma plataforma que conecte candidatos e empresas em um fluxo de recrutamento estruturado, com recursos de busca, candidatura, pipeline seletivo, entrevistas, comunicação, matching, recomendações, inteligência artificial e assinaturas.

O projeto está sendo desenvolvido seguindo uma estratégia de implementação incremental:

`Requisitos → Regras de Negócio → Casos de Uso → Modelo de Domínio → Banco → API → Segurança → UX/UI → Implementação → Testes → Documentação → Diagramas`

Cada etapa é implementada, testada, revisada e aprovada antes do avanço para a próxima.

---

## Objetivos do projeto

- Conectar candidatos e empresas em um único ambiente.
- Estruturar o processo de recrutamento de ponta a ponta.
- Oferecer busca de vagas tradicional e por linguagem natural.
- Utilizar matching e recomendações baseados no perfil e nos requisitos das vagas.
- Permitir acompanhamento do processo seletivo por pipeline.
- Garantir controle de acesso e isolamento entre empresas.
- Proteger dados profissionais e documentos sensíveis.
- Integrar pagamentos e assinaturas de forma segura.
- Disponibilizar auditoria e rastreabilidade das operações críticas.
- Preparar a plataforma para evolução e escala.

---

## Arquitetura

A arquitetura aprovada utiliza:

| Tecnologia | Função |
|---|---|
| Next.js 16.3.5 | Aplicação web, frontend e backend |
| React 19.1.0 | Interface |
| TypeScript | Tipagem e segurança do código |
| Supabase PostgreSQL | Banco de dados |
| Supabase Auth | Autenticação e sessões |
| Supabase Storage | Armazenamento de arquivos |
| PostgreSQL RLS | Isolamento e proteção de dados |
| pgvector | Busca semântica e matching |
| Stripe | Assinaturas e pagamentos |
| Vercel | Hospedagem e deploy |
| GitHub | Versionamento e colaboração |
| Zod | Validação de dados |
| Vitest | Testes automatizados |

### Princípios arquiteturais

- Supabase é a plataforma principal de dados e autenticação.
- Vercel é utilizada para hospedagem e deploy.
- RLS é combinada com autorização no backend.
- Service Role nunca é exposta ao navegador.
- Identidade e sessão são tratadas pelo Supabase Auth.
- A função `public.users.role` é a fonte de autoridade para o papel do usuário.
- Estado de autorização não é armazenado em cache de memória do processo.
- Dados históricos importantes não devem depender de exclusões em cascata destrutivas.
- Migrações são versionadas.
- Mudanças estruturais precisam permanecer rastreáveis.

---

## Papéis da plataforma

O modelo oficial possui três papéis principais:

### CANDIDATE

Responsável pelo perfil profissional e pelas candidaturas.

### COMPANY

Representa a organização que publica vagas e participa dos processos seletivos.

Dentro da empresa existem níveis de associação, incluindo **OWNER** e **ADMIN**, enquanto **MEMBER** possui permissões operacionais restritas.

> Um COMPANY MEMBER não possui permissão para criar, editar, excluir ou gerenciar vagas.

### ADMIN

Responsável pelas operações administrativas da plataforma dentro do escopo autorizado.

---

## Requisitos funcionais oficiais

O projeto utiliza a numeração oficial definida na documentação acadêmica.

| ID | Requisito |
|---|---|
| RF01 | Cadastro de Candidato |
| RF02 | Cadastro de Empresa |
| RF03 | Autenticação |
| RF04 | Recuperação de Acesso |
| RF05 | Controle de Perfis |
| RF06 | Perfil Profissional |
| RF14 | Análise de Currículo por IA |
| RF15 | Perfil da Empresa |
| RF16 | Verificação de Empresa |
| RF17 | Publicação de Vagas |
| RF18 | Edição de Vagas |
| RF20 | Busca de Vagas |
| RF21 | Filtros de Vagas |
| RF22 | Busca em Linguagem Natural |
| RF26 | Recomendação de Vagas |
| RF27 | Matching Candidato-Vaga |
| RF28 | Explicação do Matching |
| RF29 | Candidatura |
| RF31 | Prevenção de Duplicidade |
| RF33 | Pipeline Seletivo (Kanban) |
| RF36 | Gestão de Entrevistas |
| RF38 | Comunicação Interna |
| RF44 | Gestão de Assinaturas |
| RF48 | Administração Geral |
| RF50 | Auditoria |

Os identificadores acima são mantidos deliberadamente conforme a documentação oficial. Lacunas na numeração não devem ser preenchidas com requisitos inventados.

---

## Modelo de domínio

Principais grupos de entidades:

### Identidade e governança

- User
- UserRole
- Account / Identity
- AuditLog

### Candidato

- CandidateProfile
- Experience
- Education
- Certification
- Language
- Skill
- CandidateSkill
- Project
- Resume

### Empresa

- CompanyProfile
- CompanyMember
- CompanyVerification

### Recrutamento

- Job
- JobSkill
- JobBenefit
- Application
- ApplicationStage
- ApplicationStageHistory

### Entrevistas

- Interview
- InterviewParticipant
- InterviewEvaluation

### Comunicação

- Conversation
- ConversationParticipant
- Message
- Notification

### Descoberta

- SavedJob
- JobAlert
- Match
- Recommendation

### Inteligência

- AiAnalysis
- Embedding / VectorRecord
- NaturalLanguageSearch

### Financeiro

- Subscription
- Payment
- StripeEvent

### Moderação e governança

- Report / ModerationCase
- AuditLog

---

## Banco de dados

O banco utiliza PostgreSQL no Supabase.

### Estado da base

A fundação inicial foi criada em sete migrations:

1. `00001_core_identity.sql`
2. `00002_candidate.sql`
3. `00003_company.sql`
4. `00004_recruitment.sql`
5. `00005_interviews.sql`
6. `00006_audit.sql`
7. `00007_rls_policies.sql`

A etapa de banco foi validada com:

- UUIDs;
- `timestamptz`;
- chaves estrangeiras;
- índices e constraints;
- RLS;
- políticas de acesso;
- função segura para consulta de papel em empresa;
- proteção das relações históricas;
- isolamento entre empresas.

### Histórico e integridade

Processos seletivos possuem histórico de transições e dados que precisam ser preservados.

A arquitetura evita exclusões em cascata onde elas poderiam destruir informações históricas importantes.

---

## Segurança

Segurança é uma prioridade transversal do DevJobs 2.0.

### Autenticação

A autenticação utiliza Supabase Auth.

No Next.js 16, a sincronização de sessão utiliza `proxy.ts` em conjunto com `@supabase/ssr`.

### Clientes Supabase

O projeto separa os clientes em três níveis:

```text
Browser Client
    ↓
Supabase Auth + RLS

Server Client
    ↓
Server Components / Server Actions / Route Handlers

Admin Client
    ↓
Operações administrativas específicas
    ↓
SERVER ONLY
```

### Service Role

`SUPABASE_SERVICE_ROLE_KEY`:

- nunca utiliza prefixo `NEXT_PUBLIC_`;
- permanece somente no servidor;
- não pode ser enviada ao navegador;
- não pode ser utilizada como substituta da autorização normal;
- não pode aparecer em logs ou respostas HTTP.

### Autorização

A autorização seguirá:

```text
Identidade
   ↓
Role oficial
   ↓
Membership / Ownership
   ↓
Contexto do recurso
   ↓
RLS + Backend Authorization
```

O client nunca é considerado fonte de autoridade.

---

## Privacidade de dados

Dados profissionais possuem diferentes níveis de visibilidade.

### Candidato

O candidato possui controle sobre seus próprios dados.

### Empresa

Empresas podem acessar informações profissionais detalhadas dentro do contexto autorizado de recrutamento.

Exemplo: acesso a currículo e dados detalhados associado a uma candidatura válida em vaga da própria empresa.

### Terceiros

Não possuem acesso a currículos privados ou informações detalhadas protegidas.

---

## Fluxos principais

### Aplicação

```text
Candidate
   ↓
Job ativo
   ↓
Validação do perfil
   ↓
Prevenção de duplicidade
   ↓
Application
   ↓
Pipeline
```

### Pipeline

```text
SUBMITTED
   ↓
SCREENING
   ↓
INTERVIEW
   ↓
ADVANCING
   ↓
HIRED

Alternativas:
REJECTED
WITHDRAWN
CLOSED
```

### Vaga

```text
DRAFT
  ↓
ACTIVE
  ↓
PAUSED
  ↓
CLOSED
```

### Verificação da empresa

```text
PENDING
   ↓
APPROVED

ou

REJECTED
```

### Entrevista

```text
SCHEDULED
   ↓
CONFIRMED
   ↓
COMPLETED

Alternativas:
CANCELED
NO_SHOW
```

---

## Busca, matching e IA

A plataforma foi planejada para oferecer:

- busca tradicional de vagas;
- filtros estruturados;
- busca em linguagem natural;
- matching candidato-vaga;
- explicações do matching;
- recomendações;
- análise de currículo por IA.

### Princípio

IA possui papel consultivo e deve trabalhar dentro das regras de segurança e rastreabilidade da plataforma.

Uma análise de IA não deve alterar silenciosamente dados oficiais do candidato.

### Matching

O matching utiliza dados de perfil e requisitos da vaga para produzir indicadores de compatibilidade.

O resultado não representa garantia de contratação.

---

## Analytics e Insights

Analytics é uma camada transversal do produto.

### Candidato

Poderá acompanhar métricas como:

- candidaturas enviadas;
- processos em análise;
- entrevistas;
- avanços;
- processos encerrados;
- taxa de retorno;
- evolução do perfil;
- funil de candidatura.

### Empresa

Poderá acompanhar:

- vagas ativas;
- candidaturas recebidas;
- candidatos visualizados;
- triagem;
- entrevistas;
- avanços;
- conversões;
- tempo por etapa;
- volume por vaga;
- concentração de candidatos compatíveis.

### Regra importante

Analytics responde principalmente:

**“O que aconteceu?”**

Insights devem ajudar a interpretar:

**“O que os dados mostram?”**

Insights gerados por IA devem estar vinculados às métricas e fatos existentes e não inventar causalidades.

---

## Estrutura de implementação

A implementação está sendo realizada em etapas.

### ETAPA 0 — Fundação

Status: **APROVADA**

Fundação do projeto, stack, lint, TypeScript, testes e build.

### ETAPA 1 — Banco de dados

Status: **APROVADA**

Supabase, PostgreSQL, domínio inicial, RLS e policies.

### ETAPA 2.0 — Planejamento de autenticação e perfis

Status: **APROVADA**

Definição e validação da estratégia para RF01-RF06.

### ETAPA 2.0.1 — Correção do planejamento

Status: **APROVADA**

Correção das permissões de empresa, papel oficial, compensação Auth→Public, privacidade de currículos e regras de infraestrutura.

### ETAPA 2.1 — Infraestrutura Supabase

Status: **APROVADA**

Implementados e validados:

- Browser Client;
- Server Client;
- Admin Client;
- `proxy.ts`;
- integração de cookies;
- isolamento do Service Role;
- testes de infraestrutura.

Quality gates registrados:

- Lint: PASS
- Typecheck: PASS
- Tests: PASS
- Build: PASS

### Próxima etapa

**ETAPA 2.2 — Zod, Validators e Testes de Domínio**

Essa etapa será iniciada somente após aprovação humana.

---

## Governança de mudanças

Uma regra permanente do projeto:

> Qualquer alteração relevante deve atualizar documentação, código/estrutura e todos os diagramas afetados.

Isso inclui alterações em:

- requisitos;
- regras de negócio;
- entidades;
- relacionamentos;
- fluxos;
- APIs;
- permissões;
- arquitetura;
- UX/UI.

### Rastreabilidade

Cada funcionalidade deve ser rastreável por:

```text
RF
 ↓
RN
 ↓
Use Case
 ↓
Entidades
 ↓
API
 ↓
Tela
 ↓
Teste
 ↓
Diagrama
```

---

## Definition of Done

Uma funcionalidade só é considerada concluída quando:

- requisito identificado;
- regra de negócio validada;
- banco validado;
- API implementada;
- autorização validada;
- UX/UI implementada;
- estados de loading, erro e vazio tratados;
- responsividade validada;
- testes executados;
- documentação atualizada;
- diagramas atualizados;
- build validado;
- nenhuma regressão crítica conhecida.

---

## Engenharia visual

O projeto **não utiliza Figma como fonte de implementação**.

A abordagem visual segue:

```text
REFERÊNCIA VISUAL
      ↓
ANÁLISE GRÁFICA
      ↓
WIREFRAME
      ↓
PLANO VISUAL
      ↓
APROVAÇÃO
      ↓
IMPLEMENTAÇÃO DIRETA
      ↓
SCREENSHOT
      ↓
COMPARAÇÃO
      ↓
AJUSTES
      ↓
APROVAÇÃO FINAL
```

A linguagem visual considera:

- cor;
- tipografia;
- espaçamento;
- grid;
- superfícies;
- bordas;
- radius;
- sombras;
- glow;
- iconografia;
- ilustração;
- fotografia;
- motion;
- interação;
- responsividade;
- acessibilidade.

Referências externas servem para análise visual e não devem ser copiadas como identidade de marca.

---

## Testes

O projeto possui estratégia em múltiplas camadas:

### Unitários

Validação de regras isoladas, validators, segurança e domínio.

### Integração

Validação da comunicação entre componentes, banco e serviços.

### Segurança

Testes específicos para:

- autorização;
- isolamento entre empresas;
- acesso a currículos;
- prevenção de privilege escalation;
- Service Role;
- duplicidade;
- integridade histórica.

### E2E

Validação de jornadas completas do usuário.

---

## Deploy

O deploy da aplicação será realizado na:

**Vercel**

O repositório oficial é:

**GitHub — DevJobs-2.0**

O banco e serviços principais permanecem no:

**Supabase**

Integrações externas são desacopladas sempre que possível para permitir evolução futura.

---

## Ambiente local

### Pré-requisitos

- Node.js;
- npm;
- acesso ao projeto Supabase;
- variáveis de ambiente configuradas.

### Instalação

```bash
npm install
```

### Desenvolvimento

```bash
npm run dev
```

### Validação

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

### Variáveis de ambiente

Utilize `.env.local` localmente.

Base:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Nunca publique valores reais de secrets.

---

## Estrutura esperada do projeto

A estrutura continuará evoluindo por etapas, mas alguns diretórios possuem responsabilidades definidas:

```text
.
├── app/
├── lib/
│   └── supabase/
│       ├── client.ts
│       ├── server.ts
│       └── admin.ts
├── tests/
│   └── unit/
├── supabase/
│   └── migrations/
├── proxy.ts
├── .env.example
├── package.json
└── README.md
```

A estrutura real do código deve sempre prevalecer sobre exemplos documentais quando novos módulos forem incorporados.

---

## Histórico de decisões importantes

### Greenfield

O DevJobs 2.0 está sendo reconstruído do zero.

Problemas do sistema anterior servem como referências de risco e aprendizado, não como base para copiar a implementação.

### Stripe

Fluxos financeiros não devem ativar benefícios apenas pela chamada de endpoints do frontend.

A validação de pagamentos deve ocorrer no backend por mecanismos confiáveis, incluindo Webhooks assinados e idempotência quando aplicável.

### Autorização

Role enviada pelo frontend nunca pode determinar permissões.

A autoridade deve ser obtida de fontes confiáveis do backend/banco.

### Dados históricos

Histórico de candidaturas e transições precisa ser preservado.

---

## Documentação do projeto

A documentação completa do DevJobs 2.0 mantém:

- requisitos;
- regras de negócio;
- casos de uso;
- arquitetura;
- banco de dados;
- segurança;
- API;
- UX/UI;
- testes;
- rastreabilidade;
- diagramas UML;
- decisões arquiteturais;
- histórico de mudanças.

A documentação é parte do produto e deve evoluir junto com o código.

---

## Contribuição

Antes de implementar qualquer nova funcionalidade:

1. verificar os requisitos e regras existentes;
2. verificar as entidades e relacionamentos afetados;
3. avaliar impacto em segurança;
4. definir alterações de banco/API;
5. atualizar documentação e diagramas quando necessário;
6. implementar;
7. executar os quality gates;
8. registrar as decisões;
9. revisar o relatório antes de avançar para outra etapa.

Mudanças arquiteturais silenciosas não são permitidas.

---

## Licença

Este projeto está em desenvolvimento para fins acadêmicos e de engenharia de software.

A licença definitiva será definida conforme a necessidade do projeto.

---

## Estado atual

**DevJobs 2.0**

```text
ETAPA 0      ✅ APROVADA
ETAPA 1      ✅ APROVADA
ETAPA 2.0    ✅ APROVADA
ETAPA 2.0.1  ✅ APROVADA
ETAPA 2.1    ✅ APROVADA
ETAPA 2.2    ⏳ PRÓXIMA ETAPA
```

---

### Regra principal do projeto

> **Nada avança para a próxima etapa sem revisão do resultado da etapa anterior.**

O objetivo é manter o DevJobs 2.0 consistente entre **requisitos, banco, segurança, código, testes, UX/UI e documentação**.
