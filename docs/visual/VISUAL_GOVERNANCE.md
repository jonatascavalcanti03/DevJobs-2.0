# Governança Visual — DevJobs 2.0

## Escopo e fonte de verdade

Esta documentação especifica planejamento visual. Ela não cria requisitos funcionais, contratos de API, permissões, campos de formulário, assets ou código.

Rastreabilidade canônica: `RF → RN → Caso de Uso → Entidades → API → Tela → Teste → Diagrama`.

### Terminologia obrigatória

| Termo | Significado |
|---|---|
| **Proposta visual selecionada** | Opção de design escolhida durante conversa de planejamento. Não é uma decisão formalmente aprovada. |
| **Decisão formalmente aprovada** | Decisão com aprovação explícita do responsável pelo projeto. Recebe status **APROVADA** e não pode ser alterada sem autorização. |
| **Pendência** | Lacuna que requer definição ou decisão humana antes de avançar. |
| **Implementação verificada** | Funcionalidade efetivamente implementada e verificada no repositório. |

Não transformar proposta visual em decisão formalmente aprovada sem autorização explícita.

---

## Decisões e propostas visuais

### Decisões formalmente aprovadas

| ID | Assunto | Estado | Fonte |
|---|---|---|---|
| DEC-LP04-01 | Regras complementares da vitrine de vagas LP-04 | **APROVADA** | Decisão de Produto e UI/UX — Consolidação LP-04 |

**DEC-LP04-01** inclui: volume de exibição (máx. 8 vagas), critério de recência (< 7 dias), ciclo de vida da recência (RF17 não reinicia, RF18 reinicia), ordenação (`published_at DESC`, desempates), selo visual sem prioridade de ordenação, deduplicação estrita, elegibilidade, interação de salvar vagas (sincronização bidirecional, persistência para autenticados, redirecionamento de anônimos) e estados de interface (normal, carregamento, vazio, erro).

O conteúdo completo desta decisão está detalhado em [VISUAL_ENGINEERING.md](./VISUAL_ENGINEERING.md), seção LP-04. Não alterar sem autorização explícita.

### Decisões de planejamento visual (aprovadas como referência)

| ID | Assunto | Estado | Registro |
|---|---|---|---|
| DPV-01 | Direção visual Signal Indigo | Aprovada como referência de planejamento | `docs/planos/ETAPA_2_2_PLANO_REVISADO.md`, Seção 13 |
| DPV-02 | Fundação visual e navegação responsiva | Aprovada somente para planejamento | `docs/planos/ETAPA_2_2_PLANO_REVISADO.md`, Seção 13 |
| DPV-03 | Composição híbrida do hero (AST-01 base + overlays) | Aprovada somente para planejamento | `docs/planos/ETAPA_2_2_PLANO_REVISADO.md`, Seção 13 |
| DPA-01 | Estrutura Supabase canônica | Auditoria obrigatória, decisão pendente | `docs/planos/ETAPA_2_2_PLANO_REVISADO.md`, Seção 13 |

### Propostas visuais selecionadas (DEC-VIS-01 a DEC-VIS-66)

As escolhas DEC-VIS-01 a DEC-VIS-66 foram selecionadas durante as conversas de planejamento visual. **Não são decisões formalmente aprovadas.** Representam as opções escolhidas pelo responsável durante o processo de design, pendentes de aprovação formal quando necessário.

As propostas preservam as seguintes direções selecionadas:

| Área | Escolhas preservadas | Referência documental |
|---|---|---|
| Identidade visual | Estética cinematográfica e imersiva Signal Indigo | [VISUAL_LANGUAGE.md](./VISUAL_LANGUAGE.md) |
| Paleta de cores | Azul profundo, índigo, violeta, azul elétrico, luzes quentes | [VISUAL_LANGUAGE.md](./VISUAL_LANGUAGE.md) |
| Tema | Híbrido — áreas escuras e superfícies claras | [VISUAL_LANGUAGE.md](./VISUAL_LANGUAGE.md) |
| Cabeçalho | Integrado ao hero, transparente | [VISUAL_ENGINEERING.md](./VISUAL_ENGINEERING.md), LP-01 |
| Hero | Título amplo, CTAs, composição com AST-01 | [VISUAL_ENGINEERING.md](./VISUAL_ENGINEERING.md), LP-01 |
| Seções LP-01 a LP-06 | Estrutura editorial e visual da landing page | [VISUAL_ENGINEERING.md](./VISUAL_ENGINEERING.md) |
| Cards de vagas | Vitrine horizontal, busca, filtros e paginação | [VISUAL_ENGINEERING.md](./VISUAL_ENGINEERING.md), LP-04 |
| Detalhes da vaga e candidatura | Fluxo visual planejado | Pendente de detalhamento |
| Central de notificações | Agrupamento temporal e preferências | Pendente — ver Seção "Pendências" |
| Responsividade | Desktop, tablet e mobile | [RESPONSIVE_SPEC.md](./RESPONSIVE_SPEC.md) |
| Acessibilidade | WCAG AA como referência, teclado, foco | [VISUAL_QA.md](./VISUAL_QA.md) |
| Estados de interface | Carregamento, vazio, erro, indisponível, sucesso | [VISUAL_ENGINEERING.md](./VISUAL_ENGINEERING.md) |
| Animações | Suaves, respeito a `prefers-reduced-motion` | [MOTION_SPEC.md](./MOTION_SPEC.md) |

Não alterar as opções escolhidas por preferência pessoal ou conveniência técnica. Alterações requerem autorização do responsável pelo projeto.

---

## Pendências que requerem decisão humana

### PEND-VIS-01 — Agrupamento temporal das notificações

A proposta DEC-VIS-57 prevê os grupos: Hoje, Ontem, Últimos 7 dias e Anteriores.

**Problema identificado:** A definição pode gerar sobreposição ou ambiguidade temporal. "Ontem" e "Últimos 7 dias" podem se sobrepor dependendo da interpretação.

**Limites não definidos:**
- Fuso horário a ser utilizado (UTC, fuso do servidor ou fuso do usuário).
- Momento exato de corte entre "Hoje" e "Ontem" (meia-noite de qual fuso?).
- Se "Últimos 7 dias" inclui ou exclui "Hoje" e "Ontem".
- Tratamento de horários de verão e transições de fuso.

**Alternativas possíveis (para avaliação humana, nenhuma selecionada):**

1. **Exclusão sequencial**: Hoje (00:00 do dia corrente até agora) → Ontem (00:00 a 23:59:59 do dia anterior) → Últimos 7 dias (do dia D-2 até D-6, excluindo Hoje e Ontem) → Anteriores (tudo antes de D-6).
2. **Cumulativa com prioridade**: Hoje tem prioridade, depois Ontem, e "Últimos 7 dias" inclui apenas os dias não cobertos pelas categorias anteriores.
3. **Baseada em horas absolutas**: "Últimas 24h", "24–48h", "2–7 dias", "> 7 dias" — sem dependência de meia-noite.

**Status:** Pendente de decisão humana. Não definir limites sem autorização.

### PEND-VIS-02 — Contratos de persistência das notificações

Lacunas técnicas que precisam de definição antes da implementação:

| Operação | Lacuna |
|---|---|
| Marcar notificação como lida | Contrato de API, confirmação do servidor, feedback visual |
| Marcar todas como lidas | Idempotência, escopo (todas ou apenas as visíveis?), confirmação |
| Contagem de não lidas | Atualização após cada operação, consistência com o servidor |
| Sincronização painel/histórico | Consistência entre visão compacta e histórico expandido |
| Persistência de preferências | Armazenamento, escopo por canal, validação |
| Múltiplas abas/sessões | Sincronização em tempo real ou ao recarregar? |
| Falhas de rede | Novas tentativas, feedback ao usuário, estado intermediário |
| Prevenção de duplicatas | Garantia de idempotência nas operações |
| Confirmação do servidor | Não exibir sucesso antes da resposta do servidor |

**Status:** Não implementar endpoints, tabelas, políticas ou serviços nesta etapa. Não inventar contratos de API definitivos.

### PEND-VIS-03 — Rastreabilidade de vagas salvas (SavedJob)

Os requisitos funcionais oficiais (RF01–RF50) não possuem um requisito explicitamente dedicado à entidade ou funcionalidade `SavedJob`.

O `README.md` lista `SavedJob` no grupo de entidades "Descoberta" (linha 180), e a `DEC-LP04-01` aprova a interação visual de salvar vagas. No entanto, falta a formalização na matriz de RFs.

**Impactos potenciais da lacuna:**

| Área | Impacto |
|---|---|
| Requisitos e regras de negócio | Sem RF oficial, a funcionalidade não possui regras formalizadas |
| Casos de uso | Nenhum UC oficial cobre salvar/remover vagas |
| Modelo de domínio | Entidade existe no README, mas sem vínculo oficial a RF |
| Persistência | Tabela e políticas RLS não formalizadas por RF |
| APIs e autorização | Endpoints não possuem respaldo de RF |
| Interfaces | Implementação visual aprovada por DEC-LP04-01, mas sem RF |
| Testes | Sem critérios de aceite derivados de RF |
| Diagramas | Fluxos e sequências sem âncora em RF oficial |

**Status:** Pendente de decisão formal. Não criar RF novo. Não atribuir artificialmente a outro RF. Manter questão aberta para encaminhamento pelo responsável.

### PEND-VIS-04 — Critérios de ordenação da busca

A proposta visual prevê opções de ordenação, incluindo exemplos como: Mais recentes, Relevância e Salário.

**Não confundir com a ordenação da vitrine LP-04**, que já está definida pela DEC-LP04-01 (`published_at DESC` com desempates específicos).

**Perguntas pendentes para cada critério:**

| Critério | Perguntas |
|---|---|
| Mais recentes | Baseado em `published_at`? Inclui republicações? Tratamento de empate? |
| Relevância | Algoritmo? Fatores? Peso de matching (RF26/RF27)? Personalizado por usuário? |
| Salário | Campo obrigatório? Tratamento de vagas sem salário? Faixa vs. valor fixo? |
| Todos | Compatibilidade com filtros ativos? Desempates? Paginação estável? |

**Status:** Não inventar algoritmos de relevância ou critérios definitivos. Cada critério precisa de definição funcional e técnica antes da implementação.

### PEND-VIS-05 — Limites entre interface e autorização

Os estados visuais **não substituem** as verificações de segurança do servidor.

| Operação | Regra |
|---|---|
| Candidatura | Sucesso somente após confirmação do servidor |
| Salvar vaga | Sucesso somente após persistência confirmada |
| Marcar notificação como lida | Atualizar UI somente após resposta do servidor |
| Alterar preferências | Persistir somente após confirmação do servidor |

A autorização deve ser verificada no backend e, quando aplicável, nas políticas de banco de dados (RLS). A interface pode indicar estados de carregamento, mas não deve presumir sucesso antes da confirmação.

**Status:** Não implementar nem alterar mecanismos de segurança nesta etapa documental.

---

## Regras de decisão

- Proposta visual não é decisão aprovada.
- Cada asset é planejado até receber arquivo, revisão e aprovação explícita.
- Dados, métricas, depoimentos, faixas salariais e resultados só podem ser exibidos quando reais, autorizados e disponíveis no contrato correspondente.
- Interface, conteúdo e assets devem permanecer separados: cards, filtros, botões e navegação serão elementos reais de interface, não imagens achatadas.
- Implementação futura será direta em Next.js/React; Figma não é parte obrigatória do fluxo.

---

## Pendências externas ao escopo visual

| Área | Pendência | Ação recomendada |
|---|---|---|
| ETAPA 2.2 | Plano de validadores Zod aguardando aprovação humana | Aprovar antes de implementar |
| RF02 | Contrato de cadastro de empresa pendente | Decisão humana necessária |
| DPA-01 | Auditoria de clientes Supabase | Executar antes de definir estrutura canônica |

Estas pendências estão documentadas em [ETAPA_2_2_PLANO_REVISADO.md](../planos/ETAPA_2_2_PLANO_REVISADO.md) e não devem ser resolvidas no escopo visual.

---

## Documentos relacionados

- [VISUAL_ENGINEERING.md](./VISUAL_ENGINEERING.md): narrativa, telas, LP-01 a LP-06, rastreabilidade e limites funcionais.
- [VISUAL_LANGUAGE.md](./VISUAL_LANGUAGE.md): linguagem e tokens propostos.
- [VISUAL_REFERENCES.md](./VISUAL_REFERENCES.md): referência conceitual e critérios de aprovação.
- [MOTION_SPEC.md](./MOTION_SPEC.md): animações e scroll.
- [RESPONSIVE_SPEC.md](./RESPONSIVE_SPEC.md): adaptação por viewport e desempenho.
- [VISUAL_QA.md](./VISUAL_QA.md): critérios de aceite futuros e roteiro de inspeção.
- [ASSETS/ASSET_MANIFEST.md](./ASSETS/ASSET_MANIFEST.md): biblioteca planejada de assets individuais.
- [ETAPA_2_2_PLANO_REVISADO.md](../planos/ETAPA_2_2_PLANO_REVISADO.md): plano técnico e decisões de planejamento DPV-01/02/03 e DPA-01.

---

## Histórico de alterações documentais

| Data | Alteração | Motivo | Documentos afetados |
|---|---|---|---|
| 2026-09-28 | Criação inicial dos documentos visuais | Consolidação do planejamento visual Signal Indigo | Todos em `docs/visual/` |
| 2026-09-28 | Registro de DPV-01, DPV-02, DPV-03 e DPA-01 | Registro de decisões humanas de planejamento | `ETAPA_2_2_PLANO_REVISADO.md`, `VISUAL_GOVERNANCE.md` |
| 2026-09-29 | Consolidação e revisão documental | Incorporação de pendências (notificações, SavedJob, ordenação, interface/autorização), clarificação de terminologia, melhoria de rastreabilidade | `VISUAL_GOVERNANCE.md`, `VISUAL_ENGINEERING.md`, `VISUAL_QA.md` |
