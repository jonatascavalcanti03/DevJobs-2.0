---
name: devjobs-frontend-engineering
description: Engenharia de interfaces do DevJobs 2.0. Use ao criar ou modificar páginas, layouts, componentes, formulários, navegação e fluxos de interface em Next.js e React.
---

# Front-end do DevJobs 2.0

- Confira versões instaladas, estrutura real e componentes existentes antes de criar novos padrões ou dependências.
- Prefira Server Components; use Client Components somente quando interação, estado do navegador ou APIs de cliente forem necessários. Não amplie o limite cliente sem justificativa.
- Separe apresentação, validação de entrada, acesso a dados e regra de negócio. Componentes não devem se tornar fonte de autorização.
- Integre formulários aos contratos de validação e às ações de servidor aprovadas; não confie em dados, papéis ou permissões recebidos do navegador.
- Respeite a separação entre cliente Supabase de navegador, servidor e administração, incluindo o isolamento da Service Role.
- Trate carregamento, erro, vazio, sucesso e prevenção de submissão duplicada nos fluxos pertinentes.
- Crie componentes reutilizáveis apenas quando houver repetição ou fronteira de responsabilidade clara; evite abstrações prematuras e refatorações fora do escopo.
- Preserve acessibilidade e responsividade como requisitos de implementação. Solicite decisão humana quando contrato, conteúdo ou comportamento estiver incompleto.
- Não altere arquitetura, dependências, segurança ou documentação de produto sem autorização; em mudança estrutural autorizada, indique os diagramas e documentos impactados.
