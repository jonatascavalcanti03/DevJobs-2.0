# Engenharia Visual — Landing Page Imersiva

## Limite do planejamento

Esta especificação organiza a experiência pública de apresentação e suas transições. Não cria rota, componente, conteúdo factual, contrato de busca, autenticação ou fluxo empresarial. Os vínculos abaixo preservam os RFs oficiais sem expandi-los. A rastreabilidade canônica segue o fluxo: `RF → RN → Caso de Uso → Entidades → API → Tela → Teste → Diagrama`.

## Narrativa e Detalhamento das Seções (LP-01 a LP-06)

### LP-01 — Hero / Apresentação
- **Objetivo**: Explicar a proposta de valor do DevJobs 2.0 e orientar a explorar oportunidades ou acessar jornadas aplicáveis.
- **Direção e Composição**: Estética Signal Indigo com composição híbrida. Cenário-base independente (`AST-01`, existente e otimizado em `public/images/visual/`), com overlays opcionais de primeiro plano (`AST-07`, desenvolvedor recortado) e atmosfera (`AST-13`).
- **Navegação e Cabeçalho**: Header transparente integrado à composição cinematográfica; logo à esquerda, navegação por âncoras/seções ao centro e acesso à conta à direita.
- **Tipografia e Conteúdo**: Título principal de impacto em 2 ou 3 linhas sobre gradiente escuro de proteção (`#07122E`) para assegurar legibilidade sem depender de contraste puro da imagem.
- **Ações e CTAs**:
  - CTA Principal: "Explorar vagas" (conduz a RF20 quando disponível).
  - CTA Secundário: "Sou uma empresa" (encaminhamento institucional/informativo para LP-02/LP-05; não pressupõe cadastro ativo nem altera o contrato de RF02).
- **Comportamento e Scroll**: Rolagem natural sem scroll-jacking; micro-animações discretas que respeitam `prefers-reduced-motion`.
- **Limites**: Sem estatísticas de contratação, depoimentos ou números fictícios embutidos na cena.

### LP-02 — Benefícios
- **Objetivo**: Apresentar os pilares de valor da plataforma separados expressamente por público-alvo, sem promessas não implementadas.
- **Estrutura e Layout**: Grid em duas colunas no desktop (Candidatos vs. Empresas), com empilhamento vertical progressivo em telas menores (tablet e mobile).
- **Blocos Editoriais Aprovados**:
  - **Área do Candidato**:
    1. Perfil profissional (vínculo conceitual RF06).
    2. Busca e filtros de vagas (vínculo conceitual RF20/RF21).
    3. Compatibilidade e recomendações (vínculo conceitual RF26/RF27).
    4. Explicações sobre compatibilidade (vínculo conceitual RF28).
    5. Candidaturas (vínculo conceitual RF29/RF33).
    6. Análise consultiva de currículo por IA (vínculo conceitual RF14).
  - **Área da Empresa**:
    1. Perfil empresarial (vínculo com modelo de empresa sob governança).
    2. Publicação e edição de vagas (vínculo conceitual RF16/RF17).
    3. Acompanhamento de candidaturas (vínculo conceitual RF30).
    4. Organização do processo seletivo.
    5. Gestão de entrevistas (vínculo conceitual RF31).
- **Limites e Regras**:
  - "Aprendizado" e tópicos consultivos são editoriais; não criam novos RFs, rotas ou contratos de execução de IA fora dos limites formais.
  - Não expor campos de cadastro não aprovados de RF02.

### LP-03 — Como Funciona
- **Objetivo**: Guiar o visitante pela sequência de engajamento do ecossistema em 4 etapas editoriais fluidas.
- **Etapas Editoriais**:
  1. *Crie seu perfil* (RF01/RF06).
  2. *Descubra oportunidades* (RF20).
  3. *Encontre conexões entre competências e vagas* (RF26/RF27/RF28).
  4. *Acompanhe o processo* (RF29/RF33).
- **Composição Visual**: Nós conectados, ícones ilustrativos e linhas desenvolvidas em CSS/SVG puro sobrepostos ao gráfico decorativo `AST-03`.
- **Limites**: A sequência editorial é pedagógica; não cria regras de transição obrigatórias, nem restringe acessos diretos.

### LP-04 — Vagas em Destaque
- **Objetivo**: Apresentar uma amostra dinâmica de oportunidades abertas, demonstrando valor imediato e conduzindo à busca completa (RF20).
- **Vínculos com Requisitos**:
  - `RF20`: Listagem/busca pública de vagas como destino natural e fonte das oportunidades ativas e elegíveis.
  - `RF17`: Edição de vaga (edição de vaga existente **não reinicia** o cômputo de recência).
  - `RF18`: Republicação de vaga (ação de republicar **reinicia** o cômputo do período de recência).
  - *Salvamento de vagas*: A funcionalidade de salvar vagas e a entidade `SavedJob` permanecem como **pendência de rastreabilidade formal** (não associar a um RF oficial até definição formal de produto/requisitos).
- **Layout e Composição**:
  - Exibição estrita em **lista horizontal** (scroll/carrossel horizontal contido), **não em grade (grid) de cartões**.
  - Cenário de fundo `AST-04` com área central livre para que a lista de vagas reais receba foco e legibilidade.
  - Adaptação responsiva preservada: desktop com controles visíveis, tablet com touch-scroll nativo e mobile com scroll-snap (1 card visível) e botões de área mínima 44×44 px.
- **Regras de Negócio e Composição da Vitrine (Aprovadas por DEC-LP04-01)**:
  - **Volume de Exibição**: Exibir no máximo **8 vagas** na vitrine horizontal.
  - **Critério de Recência**: Uma vaga é considerada recente quando tiver sido publicada há **menos de 7 dias** (`agora - published_at < 7 dias`, limite estritamente exclusivo).
  - **Ciclo de Vida da Recência**:
    - Republicar vaga (RF18) **reinicia** o período de recência.
    - Editar vaga (RF17) **não reinicia** o período de recência.
  - **Critério de Ordenação**:
    1. Ordenar pela publicação mais recente primeiro (`published_at DESC`).
    2. Em caso de empate exato em data e hora (`published_at`), priorizar a vaga que tiver sido publicada primeiro (critério cronológico de criação/publicação original).
    3. Se o empate ainda persistir, utilizar critério estável adicional, como o identificador da vaga (`id`). *Nota técnica de implementação*: o sentido específico de ordenação do ID (crescente ou decrescente) constitui detalhe de implementação para definição técnica posterior, sem necessidade de decisão de produto.
  - **Selo Visual de Destaque**: O selo ou badge "Destaque" possui papel puramente visual e informativo; ele **não confere prioridade de ordenação** sobre a recência.
  - **Deduplicação Estrita**: Vagas que sejam simultaneamente recentes e destacadas são deduplicadas na exibição, não podendo aparecer repetidas.
  - **Elegibilidade**: Somente vagas publicadas, ativas e elegíveis no banco de dados devem ser retornadas.
- **Interação de Salvar Vagas (DEC-LP04-01)**:
  - Permitir salvar e remover vagas diretamente no card da lista horizontal e também na página de detalhes da vaga.
  - **Sincronização Bidirecional**: O estado de salvamento deve ser rigorosamente consistente e sincronizado entre a lista e a página de detalhes.
  - **Persistência para Autenticados**: Para usuários autenticados, a persistência ocorre de forma associada à sua conta.
  - **Comportamento para Visitantes Anônimos**: Ao acionar a ação de salvar vaga sem autenticação, o visitante deve ser redirecionado para a tela de login/cadastro e, após autenticar-se com sucesso, retornar à vaga pretendida com o estado atualizado.
- **Estados de Interface Padronizados**:
  - **Apresentação Normal**: Lista horizontal com até 8 vagas ordenadas, selos discretos e scroll fluido.
  - **Carregamento**: Skeleton horizontal estruturado com dimensões e proporções estáveis para evitar layout shift (CLS).
  - **Vazio**: Caso não haja vagas elegíveis ativas, manter a seção no layout exibindo mensagem discreta e amigável acompanhada de link direto para explorar vagas (RF20).
  - **Erro**: Mensagem de feedback segura informando impossibilidade temporária de carregar as oportunidades, com opção de tentar novamente (*retry*).
- **Pendências de Governança Remanescentes da LP-04**:
  1. *Rastreabilidade oficial de salvar vagas*: A entidade de domínio `SavedJob` está prevista tecnicamente, mas carece de confirmação formal de sua relação com a matriz de Requisitos Funcionais (ex.: criação de RF específico ou extensão formal de RF20/RF26) antes da implementação de backend.
  2. *Tratamento de falhas de persistência*: Definição pontual de política de feedback visual e reversão otimista em caso de erro na ação de salvar/remover vaga.

### LP-05 — Comunidade DevJobs
- **Objetivo**: Evidenciar o ecossistema integrado que aproxima profissionais, competências e empresas de tecnologia.
- **Composição Visual**:
  - Painéis ilustrativos construídos em React/CSS sobrepostos ao cenário `AST-05` e apoiados por iluminação azul/violeta Signal Indigo.
  - Transição suave e orgânica a partir de LP-04.
- **Limites e Regras Rígidas**:
  - Não criar feed social, chat comunitário, fórum ou área logada de rede social.
  - Não apresentar estatísticas fictícias (ex.: "10.000 contratações"), depoimentos forjados ou métricas inventadas.
  - Distinção nítida entre representações editoriais conceituais e funcionalidades de software ativas.

### LP-06 — Chamada Final (CTA) e Rodapé
- **Objetivo**: Concluir a narrativa imersiva com direcionamentos claros para os dois públicos.
- **Composição**: Fundo panorâmico crepuscular `AST-06` com área central livre para os blocos de ação.
- **Ações e CTAs**:
  - CTA Principal: "Explorar vagas" (conduz a RF20).
  - CTA Secundário: "Sou uma empresa" (direcionamento informativo/institucional; não antecipa fluxo de cadastro até a aprovação de RF02).
- **Rodapé Institucional**:
  - Logo DevJobs 2.0, links institucionais existentes, termos de uso, privacidade e navegação de retorno.
  - Não criar links mortos ou rotas fictícias para páginas que não existem no projeto.
- **Governança do RF02**: Preservada integralmente a pendência de aprovação humana do contrato de cadastro de empresa (DP-3). Nenhum formulário ou mutação de empresa é criado nesta especificação.

---

## Matriz de Rastreabilidade Preliminar (Seções da Landing Page)

| Seção | Elementos de Interface | RF/RN Vinculado | Casos de Uso Relacionados | Dependências e Pendências de Decisão |
|---|---|---|---|---|
| **LP-01** | Hero, CTAs "Explorar vagas" e "Sou uma empresa" | RF20, RF01, RF03 | UC01, UC03, UC20 | Destino do CTA secundário dependente da aprovação de RF02; sem dados simulados. |
| **LP-02** | Grid editorial Candidatos vs. Empresas | RF06, RF14, RF16, RF20, RF26, RF27, RF28, RF29, RF30, RF31, RF33 | UC06, UC14, UC16, UC20, UC26-28, UC29-33 | Caráter estritamente informativo; nenhum fluxo novo ou contrato criado. |
| **LP-03** | 4 etapas com nós e conexões CSS/SVG | RF01, RF06, RF20, RF26, RF29, RF33 | UC01, UC06, UC20, UC29 | Jornada visual ilustrativa; sem regras sequenciais obrigatórias. |
| **LP-04** | Vitrine em lista horizontal de vagas recentes/destaque (máx. 8), ação de salvar vaga na lista e detalhes | RF20, RF17, RF18 | UC20, UC21, UC17, UC18 | Aprovada por `DEC-LP04-01`. **Pendência**: rastreabilidade formal de `SavedJob` na matriz oficial de RFs e tratamento pontual de falhas de persistência. |
| **LP-05** | Painéis ecossistema tecnologia | Não possui RF exclusivo | Contexto transversal | Sem rede social/chat; sem métricas inventadas. |
| **LP-06** | CTA final e Rodapé institucional | RF20, RF01 | UC20, UC01 | Bloqueio do fluxo empresarial preservado até decisão em RF02; links reais apenas. |

---

## Navegação Planejada

- **Header público**: Marca à esquerda, links de ancoragem centralizados para as 6 seções, botão para busca de vagas e link de acesso à conta à direita.
- **Indicador de seção**: Auxílio decorativo/informativo; não substitui o scroll nativo, foco por teclado ou links acessíveis de navegação direta.
- **Controle de Acesso**: A interface pública não define papéis nem assume autorização. A segurança em áreas internas futuras depende de RLS e verificação de sessão pelo servidor.

---

## Estados de Interface Padronizados

| Estado | Comportamento Visual | Regra de Governança |
|---|---|---|
| **Carregando** | Skeleton com dimensões e proporções estáveis (ex.: cartões da lista horizontal de LP-04) | Não simular dados ou texto fictício durante o carregamento. |
| **Vazio** | Mensagem objetiva e próxima ação clara (ex.: botão para limpar filtros ou explorar todas as vagas) | Não ocultar controles nem culpar o sistema sem instrução útil. |
| **Erro** | Alerta contido com opção de nova tentativa quando suportado | Não expor detalhes internos de erros de banco, APIs ou stack traces. |
| **Indisponível** | Fallback estático e elegante garantindo legibilidade do conteúdo editorial | Não quebrar o layout nem impedir a navegação contínua da página. |
| **Acesso negado** | Mensagem compreensível e redirecionamento seguro | Nunca vazar regras de permissão ou dados protegidos para anônimos. |
| **Sucesso** | Confirmação discreta (ex.: feedback tátil/visual ao salvar vaga) | Depende de confirmação efetiva da persistência ou operação segura. |

---

## Telas Planejadas Além da Landing Page — Pendentes de Detalhamento

As propostas visuais DEC-VIS-01 a DEC-VIS-66 incluem direções para telas além da landing page. As seções abaixo registram o escopo previsto e as pendências. Nenhuma constitui decisão formalmente aprovada, salvo quando indicado.

### Busca e Filtros (RF20/RF21)

**Vínculo de rastreabilidade:** RF20 (Busca de Vagas), RF21 (Filtros de Vagas).

Direções selecionadas nas propostas visuais:
- Barra de busca com campo de texto e filtros expansíveis.
- Filtros por localização, tipo de contrato, faixa salarial, nível de experiência, tecnologias.
- Resultados em lista com cards de vaga.
- Paginação ou scroll infinito.
- Estados: carregando, resultados encontrados, nenhum resultado, erro.

**Pendências (ver PEND-VIS-04 em VISUAL_GOVERNANCE.md):**
- Critérios de ordenação da busca (Mais recentes, Relevância, Salário) sem definição funcional e técnica.
- Não confundir a ordenação da busca geral com a ordenação da vitrine LP-04 (DEC-LP04-01).
- Comportamento de filtros combinados e desempates não especificados.

### Detalhes da Vaga e Fluxo de Candidatura (RF29/RF31)

**Vínculo de rastreabilidade:** RF29 (Candidatura), RF31 (Prevenção de Duplicidade).

Direções selecionadas nas propostas visuais:
- Página de detalhes com informações completas da vaga.
- Botão de candidatura com estados (disponível, já candidatado, carregando, erro).
- Botão de salvar vaga sincronizado com a vitrine LP-04 (DEC-LP04-01).
- Prevenção visual de candidatura duplicada (RF31).

**Pendências:**
- O estado visual de "já candidatado" depende de confirmação do servidor, não apenas de estado local.
- Rastreabilidade de `SavedJob` pendente (PEND-VIS-03 em VISUAL_GOVERNANCE.md).

### Central de Notificações e Preferências

**Vínculo de rastreabilidade:** Propostas DEC-VIS-54 a DEC-VIS-63 (estimado).

Direções selecionadas nas propostas visuais:
- Painel compacto (dropdown/sidebar) com notificações recentes.
- Histórico expandido de notificações.
- Agrupamento temporal (Hoje, Ontem, Últimos 7 dias, Anteriores).
- Indicador de contagem de não lidas.
- Ação de marcar como lida (individual e em lote).
- Preferências de notificação por canal.

**Pendências (ver PEND-VIS-01 e PEND-VIS-02 em VISUAL_GOVERNANCE.md):**
- Agrupamento temporal com limites ambíguos — decisão humana necessária.
- Contratos de persistência não definidos.
- Sincronização entre painel compacto e histórico não especificada.
- Consistência em múltiplas abas/sessões não definida.

---

## Relação entre Estados Visuais e Autorização

Os estados de interface descritos neste documento são **representações visuais** que orientam a experiência do usuário. Eles **não substituem** verificações de segurança do servidor.

Princípios obrigatórios:
- Operações que alteram dados (candidatura, salvar vaga, marcar notificação, alterar preferência) devem exibir sucesso **somente após confirmação do servidor**.
- A autorização deve ser verificada no backend e, quando aplicável, nas políticas de banco de dados (RLS).
- O frontend pode indicar estado de carregamento e oferecer feedback otimista, mas deve reverter visualmente em caso de falha do servidor.
- Detalhes de autorização e permissão nunca devem ser expostos na interface para usuários não autorizados.

Referência completa: PEND-VIS-05 em [VISUAL_GOVERNANCE.md](./VISUAL_GOVERNANCE.md).

