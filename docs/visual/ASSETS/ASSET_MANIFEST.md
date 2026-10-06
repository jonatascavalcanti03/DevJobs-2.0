# Manifesto de Assets — Signal Indigo

## Convenções

- Estado atual dos itens: `AST-01` é **existente e otimizado** (`public/images/visual/01_hero_bg_desktop.webp` e `01_hero_bg_desktop_otimizado.webp`). Os demais itens (AST-02 a AST-17) permanecem **planejados** (nenhum outro arquivo físico foi gerado).
- Nome: `<ordem>_<seção>_<papel>_<variante>.<formato>` em minúsculas e `snake_case`.
- Cenários: avaliar AVIF/WebP; transparências: WebP com alpha ou PNG conforme o fluxo aprovado.
- As dimensões são propostas de produção, não especificação final.
- Não incluir texto, logotipos ou controles de interface dentro das imagens.
- Toda entrada deve funcionar sozinha, salvo quando a coluna indicar explicitamente um overlay **opcional**. Isso não cria ordem obrigatória de geração.

| ID | Nome proposto | Categoria / seção | Composição e uso | Proporção / formato | Transparência / variantes | Alt | Dependência |
|---|---|---|---|---|---|---|---|
| AST-01 | `01_hero_bg_desktop.webp` | Cenário / LP-01 | Cenário-base independente: estação de trabalho, janelas, cidade e pôr do sol; área livre à esquerda | 16:9, 2560×1440 | Não / mobile separada | Decorativo | Nenhuma; overlays opcionais AST-07 e AST-13 (Existente e otimizado em `public/images/visual/`) |
| AST-02 | `02_benefits_bg.webp` | Cenário / LP-02 | Ambiente digital profundo com luzes discretas | 16:9, 2560×1440 | Não / crop mobile | Decorativo | Nenhuma; AST-15 opcional |
| AST-03 | `03_flow_connections.webp` | Gráfico / LP-03 | Linhas e nós abstratos, sem texto | 3:2, 1800×1200 | Sim / opcional mobile | Decorativo | Nenhuma |
| AST-04 | `04_jobs_bg.webp` | Cenário / LP-04 | Cidade tecnológica com espaço central para cards reais | 16:9, 2560×1440 | Não / crop mobile | Decorativo | Nenhuma; AST-13 opcional se não duplicar cenário |
| AST-05 | `05_community_bg.webp` | Cenário / LP-05 | Trabalho compartilhado, cidade e vegetação, com contexto de colaboração/recrutamento sem criar tela empresarial | 16:9, 2560×1440 | Não / crop mobile | Decorativo | Nenhuma; AST-10 opcional |
| AST-06 | `06_cta_bg.webp` | Cenário / LP-06 | Panorama de encerramento com luz quente | 16:9, 2560×1440 | Não / crop mobile | Decorativo | Nenhuma; AST-13 opcional se não duplicar cenário |
| AST-07 | `hero_developer_foreground.webp` | Personagem / LP-01 | Desenvolvedor em primeiro plano, recorte lateral, overlay opcional do hero | 4:5, 1600×2000 | Sim / mobile opcional | Decorativo | Opcional sobre AST-01 |
| AST-08 | `candidate_portrait.webp` | Personagem / LP-02 | Candidato em contexto profissional | 4:5, 1200×1500 | Sim | Decorativo | Nenhuma |
| AST-09 | `recruiter_portrait.webp` | Personagem / LP-04 | Recrutador em ambiente tecnológico | 4:5, 1200×1500 | Sim | Decorativo | Nenhuma |
| AST-10 | `team_collaboration.webp` | Personagem / LP-05 | Equipe diversa em colaboração | 3:2, 1800×1200 | Não | Decorativo | Opcional sobre AST-05 |
| AST-11 | `desk_object_cluster.webp` | Objetos / LP-01 | Mesa, teclado, luminária e planta | 3:2, 1800×1200 | Sim | Decorativo | Opcional sobre AST-01 ou AST-07 |
| AST-12 | `monitor_glow.webp` | Objeto / LP-01 | Monitores abstratos, sem UI legível | 3:2, 1600×1067 | Sim | Decorativo | Opcional sobre AST-01 ou AST-07 |
| AST-13 | `hero_atmosphere_layer.webp` | Fundo / LP-01 | Camada atmosférica com luzes e profundidade, sem repetir estação, janelas ou cidade do cenário-base | 21:9, 2520×1080 | Sim | Decorativo | Opcional sobre AST-01; pode apoiar LP-04/LP-06 apenas sem duplicação |
| AST-14 | `sunset_gradient.webp` | Fundo / transversal | Gradiente índigo, violeta, laranja e rosa | 16:9, 1920×1080 | Não | Decorativo | Nenhuma |
| AST-15 | `ambient_particles.webp` | Fundo / transversal | Pontos luminosos discretos | 16:9, 1920×1080 | Sim | Decorativo | Nenhuma |
| AST-16 | `code_connection_lines.webp` | Gráfico / transversal | Linhas, nós e referências abstratas de programação | 3:2, 1800×1200 | Sim | Decorativo | Nenhuma |
| AST-17 | `card_ambient_texture.webp` | Gráfico / cards | Textura abstrata sem conteúdo | 4:3, 1200×900 | Não | Decorativo | Nenhuma |

## Prompts individuais

Todos os prompts exigem: estilo ilustrativo cinematográfico próprio, sem texto, logotipos, marcas de terceiros ou controles de interface, estética Signal Indigo e espaço negativo para conteúdo real.

| Asset | Prompt de geração planejado |
|---|---|
| AST-01 | Cena panorâmica 16:9 de uma estação de trabalho de desenvolvedor em ambiente digital escuro, cidade tecnológica ao pôr do sol ao fundo, índigo profundo, azul elétrico, violeta, luzes laranja e rosa, mesa e vegetação sutis, composição com área livre à esquerda para texto, sem texto ou logotipos. |
| AST-02 | Fundo panorâmico 16:9 abstrato e cinematográfico para benefícios de plataforma tecnológica, arquitetura digital profunda, gradientes Signal Indigo, pontos luminosos moderados, grande área central legível, sem personagens, texto ou interface. |
| AST-03 | Ilustração transparente 3:2 de linhas e nós abstratos conectando quatro etapas profissionais, índigo e azul elétrico com brilho discreto, sem rótulos, texto, ícones de produto ou interface. |
| AST-04 | Cena panorâmica 16:9 de cidade tecnológica ao entardecer vista de ambiente de trabalho, azul profundo e luzes quentes, região central limpa para cards reais de vagas, sem cards desenhados, texto ou logotipos. |
| AST-05 | Cena panorâmica 16:9 de equipe diversa de tecnologia colaborando em espaço de trabalho com plantas, monitores abstratos e cidade ao fundo, Signal Indigo e luz de pôr do sol, sem texto ou marca. |
| AST-06 | Panorama cinematográfico 16:9 de encerramento, horizonte urbano tecnológico, azul marinho, índigo e luzes quentes suaves, área central livre para CTA real, sem texto, botão ou logotipo. |
| AST-07 | Personagem ilustrado em recorte transparente 4:5, desenvolvedor em estação de trabalho, roupa casual profissional, luz de monitor azul e contraluz quente, pose voltada levemente à direita, sem texto ou interface. |
| AST-08 | Personagem ilustrado em recorte transparente 4:5, candidato de tecnologia confiante em ambiente profissional, iluminação índigo e quente, postura natural, sem texto ou logotipos. |
| AST-09 | Personagem ilustrado em recorte transparente 4:5, recrutador de tecnologia analisando contexto de trabalho, paleta Signal Indigo, luz suave, sem documentos legíveis, texto ou marca. |
| AST-10 | Ilustração cinematográfica 3:2 de equipe diversa de desenvolvimento em colaboração, cenário tecnológico escuro e acolhedor, cidade e vegetação discretas, sem texto, logo ou UI. |
| AST-11 | Composição transparente 3:2 de mesa, teclado, luminária, planta e acessórios de trabalho em estilo Signal Indigo, sem tela com interface legível ou texto. |
| AST-12 | Composição transparente 3:2 de monitores estilizados emitindo luz azul e violeta, perspectiva lateral, telas abstratas sem texto, código ou interface. |
| AST-13 | Camada atmosférica panorâmica transparente 21:9 para sobrepor a um cenário-base já completo, pontos de luz e profundidade sutis em azul profundo e tons quentes, sem cidade, estação de trabalho, janelas, texto ou marcas. |
| AST-14 | Fundo panorâmico 16:9 de gradiente atmosférico Signal Indigo, azul profundo para índigo, violeta, laranja e rosa de pôr do sol, sem objetos ou texto. |
| AST-15 | Camada transparente 16:9 de partículas e pontos luminosos muito discretos, azul elétrico e violeta, baixa densidade, sem texto ou símbolos. |
| AST-16 | Camada transparente 3:2 de linhas geométricas e nós inspirados em conexões profissionais e programação, brilho moderado azul elétrico, sem texto, logotipos ou botões. |
| AST-17 | Textura abstrata 4:3 para fundo de card, índigo escuro com linhas e luzes extremamente sutis, contraste baixo, sem conteúdo, texto ou ícones. |

## Otimização e aprovação

- Produzir versões mobile apenas quando o crop desktop comprometer personagem, área de texto ou contraste.
- Validar peso, nitidez, transparência e contraste sobrepostos antes de selecionar entrega final.
- Estado do ciclo: `planejado → gerado → revisado → aprovado`; não avançar estado sem evidência.

## Consistência de personagens — guia incorporado ao manifesto

Não há guia separado. AST-07 a AST-10 devem manter estilo ilustrativo cinematográfico, paleta Signal Indigo com luz quente de apoio, vestuário casual-profissional sem marcas, proporções naturais, expressão acessível e ausência de texto/interface. Cada prompt preserva o papel específico; qualquer variação substancial exige revisão antes de ser usada como personagem recorrente.
