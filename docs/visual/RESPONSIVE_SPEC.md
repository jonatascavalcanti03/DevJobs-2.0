# Especificação de Responsividade e Desempenho

| Faixa | Composição e Seções (LP-01 a LP-06) | Cenários e assets | Navegação e Interação |
|---|---|---|---|
| Desktop (≥1024 px) | LP-01: Hero panorâmico com texto à esquerda; LP-02: Grid de 2 colunas amplas (Candidatos vs. Empresas); LP-03: Fluxo horizontal com 4 nós conectados em CSS/SVG; LP-04: Lista horizontal de até 8 vagas (DEC-LP04-01) com controles de navegação e botões para salvar vaga; LP-05: Painéis de ecossistema em disposição lado a lado; LP-06: Bloco centralizado de CTA com rodapé multinível expandido. | Cenário completo com área livre para texto; AST-01 base com overlays opcionais AST-07 e AST-13; AST-02 a AST-06 aplicados. | Header completo, links de ancoragem visíveis, indicador de seção e acesso à conta. |
| Tablet (768–1023 px) | LP-01: Hero com altura intermediária adaptada; LP-02: Colunas balanceadas ou empilhamento suave de blocos de benefícios; LP-03: 4 etapas adaptadas a grid 2×2 ou sequência linear; LP-04: Lista horizontal de até 8 vagas com touch-scroll nativo; LP-05: Painéis em 2 colunas contidas; LP-06: CTA condensado com rodapé em grid de 2 a 3 blocos. | Reenquadrar cenários com foco no centro/esquerda, reduzir camadas de partículas ou overlays secundários (ex.: ocultar AST-11/AST-12 se comprometer legibilidade). | Navegação recolhível em menu compacto sem esconder ações principais de explorar vagas. |
| Mobile (360–767 px) | LP-01: Uma coluna vertical com título, subtítulo e CTAs empilhados no topo antes da imagem de fundo; LP-02: Empilhamento estrito em 1 coluna (Candidatos primeiro, Empresas em seguida); LP-03: Sequência vertical de 4 passos com conectores verticais; LP-04: Lista horizontal de até 8 vagas com visualização de cartão único ou cartão e meio visível (scroll-snap); LP-05: Painéis empilhados; LP-06: CTAs verticais e rodapé linear unificado. | Crop mobile focado em contraste; manter apenas AST-01/AST-06 estáticos; desativar overlays pesados. | Menu em drawer acessível via teclado; ações táteis com área de toque mínima de 44×44 px; sem dependência de hover para salvar vagas ou exibir detalhes. |

## Regras

- Reservar proporção/dimensões dos assets para prevenir layout shift.
- Carregar prioritariamente apenas a imagem necessária à área inicial; diferir cenários subsequentes.
- Para conexão limitada ou dispositivos modestos, reduzir camadas, desativar parallax e usar alternativa estática.
- O cenário não pode comprometer contraste, ordem de leitura, foco ou ações essenciais.

## Critérios mensuráveis propostos — aguardando aprovação

- Contraste: usar WCAG 2.2 nível AA como referência futura; mínimo de 4,5:1 para texto normal e 3:1 para texto grande e componentes gráficos essenciais.
- Legibilidade: conteúdo interativo e texto não podem depender exclusivamente de áreas claras/escuros da imagem; aplicar overlay de contraste quando a verificação falhar.
- Peso: hero desktop até 500 KB e hero mobile até 250 KB; overlays decorativos até 100 KB cada; valores são orçamentos propostos, sujeitos a revisão após testes reais.
- Carregamento: priorizar apenas o cenário-base do hero; diferir recursos abaixo da dobra e overlays opcionais.
- Formatos: avaliar AVIF/WebP para cenários e WebP com alpha ou PNG para transparência, conforme qualidade, compatibilidade e peso medidos.
