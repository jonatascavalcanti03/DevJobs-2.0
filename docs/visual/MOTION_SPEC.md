# Especificação de Motion e Scroll

## Princípios

Movimento deve orientar compreensão, não reter o usuário. A rolagem normal permanece sob controle do usuário: sem scroll-jacking, rolagem artificial ou conteúdo essencial oculto.

| Seção | Condição e estado inicial | Elementos / propriedades propostas | Estado final e saída | Mobile / `prefers-reduced-motion` | Duração / easing propostos |
|---|---|---|---|---|---|
| LP-01 Hero | Visível no carregamento; texto e CTA já legíveis | Cenário-base, overlay e indicador; somente `transform` sutil em camadas decorativas e `opacity` do overlay | Cenário permanece legível; overlay reduz luz ao avançar para LP-02 | Sem parallax; cenário e conteúdo estáticos | Overlay 240 ms, `ease-out`; parallax máximo 2% do deslocamento |
| LP-02 Benefícios | Card entra no viewport sem impedir leitura prévia | Cards: `opacity` e `translateY`; fundo: `opacity` discreta | Cards ficam estáveis; fundo transita para LP-03 | Cards já visíveis, sem sequência | 220 ms por card, intervalo proposto de 60 ms, `ease-out` |
| LP-03 Como funciona | Cada etapa entra na área visível | Etapa atual: `opacity`/`transform`; linha decorativa: `opacity` e escala horizontal | Etapa permanece destacada; linha termina antes de LP-04 | Etapas empilhadas e linha estática ou ausente | 240 ms, `ease-out` |
| LP-04 Vagas | Seção entra no viewport; lista horizontal de cards legível antes de efeito | Superfície e cards horizontais: `opacity`/`translateY` curto; scroll horizontal fluido | Cards estáveis na lista; cenário atenuado ao conduzir LP-05 | Lista horizontal com scroll nativo/estático; sem hover obrigatório | 200 ms, `ease-out` |
| LP-05 Comunidade | Conteúdo principal entra antes de decoração | Camadas decorativas: `opacity` e `transform` curto | Luz quente reduzida para LP-06 sem ocultar texto | Remover camadas não essenciais | 260 ms, `ease-out` |
| LP-06 CTA | Conteúdo e ação já disponíveis ao entrar no viewport | Overlay de iluminação: `opacity`; cenário: escala máxima sutil | Estado estável; não bloqueia a rolagem após CTA | Sem escala ou transição; cenário estático | 240 ms, `ease-out`; escala máxima proposta de 1,02 |

## Parâmetros propostos

- Durações, easing e intensidades da tabela são propostas de planejamento, não tokens finais aprovados.
- Propriedades preferidas: `transform` e `opacity`.
- Detecção futura: avaliar `IntersectionObserver`; não vincular cada evento de scroll a trabalho pesado.
- Biblioteca de animação: não escolhida; qualquer dependência exige autorização prévia.

## Acessibilidade e desempenho

- `prefers-reduced-motion` deve remover parallax, escala e revelações sequenciais sem remover conteúdo.
- A experiência funcional não depende de animação, hover ou GPU avançada.
- Evitar animação contínua de propriedades que provoquem layout/repaint desnecessário.
