# QA Visual — Critérios de Aceite Futuros

Nenhum item abaixo está validado nesta etapa. A validação exige implementação e evidência verificável.

> **Distinção obrigatória:** Este documento descreve critérios de aceite para **verificação futura**. Nenhum teste de software foi executado. Revisões documentais (coerência, referências cruzadas, completude) são verificações documentais, não testes funcionais.

## Capturas e Roteiro de Inspeção por Viewport

- **Desktop (1440 px)**:
  - Hero com AST-01 completo, header com alinhamento logo/links/acesso, legibilidade do título sobre gradiente.
  - LP-02 em duas colunas paralelas (Candidatos vs. Empresas).
  - LP-03 com nós e conectores horizontais em SVG/CSS.
  - LP-04 em lista horizontal com no máximo 8 vagas, scroll funcional, presença de badges discretos de "Destaque" e "Recente", ordenação cronológica decrescente de publicação, deduplicação visual e botões de salvar/remover vaga funcionais por clique e teclado.
  - LP-05 painéis de comunidade integrados e LP-06 com CTAs e rodapé institucional expandido.
- **Tablet (768 px)**:
  - Header adaptado com navegação recolhida/compacta e acesso à conta visível.
  - Transição suave entre seções e rebalanceamento das 2 colunas de LP-02.
  - LP-04 com touch-scroll fluido, teto de 8 vagas e botões de salvar com target de toque adequado.
- **Mobile (360 px)**:
  - Header em menu drawer acessível (abertura, foco, escape e fechamento).
  - Hero com títulos e CTAs verticais empilhados no topo sem corte de texto.
  - LP-02 totalmente empilhada em coluna única (Candidatos primeiro, Empresas depois).
  - LP-03 em sequência vertical.
  - LP-04 lista horizontal com scroll-snap de 1 card visível, teto de 8 vagas, sem quebra horizontal do restante da página (sem scroll horizontal indesejado no `body`).
  - Botão de salvar vaga acionável com área de toque mínima de 44×44 px sem depender de hover.
  - Estados de interface de LP-04: skeleton de carregamento, estado vazio (mensagem discreta com link para explorar vagas), estado de erro com botão de nova tentativa.

## Critérios de Aceite Formais

1. Coerência com a paleta Signal Indigo e com a especificação arquitetural aprovada.
2. Conteúdo textual legível sobre todos os cenários; contraste medido contra a referência WCAG 2.2 AA (mínimo 4,5:1 texto comum, 3:1 texto grande), sem declarar conformidade antes dos testes reais com ferramentas automatizadas (ex.: axe/lighthouse).
3. Ausência total de overflow horizontal na viewport global (`overflow-x: hidden` no contêiner da página, permitindo apenas scroll local na lista de LP-04).
4. Navegação 100% acessível por teclado: `Tab`, `Shift+Tab`, `Enter`, `Space`, foco visível evidente e skip links.
5. `prefers-reduced-motion`: transições instantâneas ou simplificadas, sem parallax e sem escala, preservando a totalidade das informações e ações.
6. Scroll nativo e natural, sem interceptação de roda de mouse ou scroll-jacking; nenhum controle funcional depende de hover.
7. Composição da vitrine de LP-04 conforme `DEC-LP04-01`:
   - Exibição de no máximo 8 vagas elegíveis.
   - Vagas recentes delimitadas estritamente a menos de 7 dias de publicação (`< 7d`).
   - Ordenação pela publicação mais recente primeiro, desempate pela primeira publicação cronológica e critério de estabilidade secundário (ID da vaga).
   - Selo "Destaque" visual sem prioridade de ordenação sobre a recência.
   - Deduplicação estrita na lista de vagas de LP-04: nenhuma vaga que seja simultaneamente recente e destacada aparece repetida.
8. Interação de salvar vagas (DEC-LP04-01):
   - Consistência bidirecional de estado entre o cartão da lista e a página de detalhes da vaga.
   - Persistência efetiva do salvamento para usuários autenticados.
   - Redirecionamento de visitantes anônimos para login com retorno automático à vaga após autenticação.
9. Estados de tela de LP-04: skeleton com dimensões estáveis; estado vazio elegante com mensagem discreta e link direto para explorar vagas; estado de erro com mensagem segura e botão de tentar novamente.
10. Assets carregam nas dimensões e proporções reservadas, evitando *Cumulative Layout Shift* (CLS < 0,1).
11. Isolamento estrito entre dados reais e decorativos: cards, vagas, filtros e ações são componentes React reais; nenhum texto ou número é "estampado" em imagem de asset.
12. Nenhuma métrica, depoimento, vaga fake ou resultado simulado é exibido.
13. Orçamentos de peso respeitados conforme `RESPONSIVE_SPEC.md`: hero desktop ≤ 500 KB, mobile ≤ 250 KB; overlays ≤ 100 KB; recursos abaixo da dobra diferidos com *lazy loading*.

## Critérios de Aceite para Telas Futuras — Pendentes de Detalhamento

Os critérios abaixo são projeções baseadas nas propostas visuais selecionadas (DEC-VIS-01 a DEC-VIS-66). Serão detalhados quando as respectivas telas receberem especificação completa.

### Busca e Filtros (RF20/RF21)

- Barra de busca funcional com retorno de resultados.
- Filtros aplicáveis individualmente e em combinação.
- Estados: carregando, resultados, nenhum resultado (com ação alternativa), erro.
- Critérios de ordenação implementados conforme definição funcional aprovada (pendente — ver PEND-VIS-04 em [VISUAL_GOVERNANCE.md](./VISUAL_GOVERNANCE.md)).
- Paginação estável sem perda de estado dos filtros ao navegar.

### Candidatura (RF29/RF31)

- Botão de candidatura acessível e com estados claros.
- Prevenção visual de candidatura duplicada (RF31).
- Sucesso exibido somente após confirmação do servidor.
- Estado de "já candidatado" mantido consistentemente entre listagem e detalhes.

### Notificações

- Agrupamento temporal com limites sem ambiguidade (pendente de definição — ver PEND-VIS-01 em [VISUAL_GOVERNANCE.md](./VISUAL_GOVERNANCE.md)).
- Contagem de não lidas sincronizada com o servidor.
- Marcar como lida refletido imediatamente e confirmado pelo servidor.
- Preferências persistidas e recuperáveis entre sessões.

### Regra transversal — Interface e autorização

- Nenhuma operação que altere dados exibe sucesso antes da confirmação do servidor (ver PEND-VIS-05 em [VISUAL_GOVERNANCE.md](./VISUAL_GOVERNANCE.md)).

---

## Verificações Documentais vs. Testes de Software

| Tipo | Descrição | Executável nesta etapa? |
|---|---|---|
| **Verificação documental** | Revisão de coerência, referências cruzadas, completude e rastreabilidade entre documentos | Sim |
| **Teste funcional** | Execução de funcionalidade implementada contra critérios de aceite | Não — requer implementação |
| **Teste visual** | Captura de tela e comparação com especificação | Não — requer implementação |
| **Teste de acessibilidade** | Execução de ferramentas automatizadas (axe, lighthouse) | Não — requer implementação |
| **Teste de desempenho** | Medição de CLS, peso de assets, tempo de carregamento | Não — requer implementação |

Não declarar testes de software aprovados quando apenas verificações documentais foram realizadas.
