---
name: devjobs-api-engineering
description: Engenharia de API do DevJobs 2.0. Use ao criar ou revisar Route Handlers, Server Actions, contratos de entrada e saída, erros, mutações, idempotência e autorização de operações no servidor.
---

# API do DevJobs 2.0

- Defina o caso de uso e o contrato aprovado antes de criar Route Handler ou Server Action; valide entrada e saída nos limites apropriados com Zod.
- Mantenha regras críticas, identidade e autorização no servidor. Nunca derive autoridade de payload, `user_metadata.role`, estado do navegador ou parâmetros manipuláveis.
- Obtenha a identidade da sessão, verifique papel oficial, propriedade ou membership e contexto do recurso; aplique RLS como defesa complementar.
- Retorne erros tipados e seguros, sem vazar segredos, dados de terceiros ou detalhes internos. Distinga validação, autenticação, autorização, conflito e falha operacional.
- Para mutações críticas, trate repetição, concorrência e idempotência conforme a regra aprovada; use constraints do banco como garantia final quando aplicável.
- Separe mapeamento HTTP ou formulário, validação, caso de uso e acesso a dados. Não faça a UI ou o cliente Supabase executar lógica de negócio privilegiada.
- Inspecione os clientes Supabase existentes antes de usá-los e preserve a separação browser, servidor e administração.
- Planeje testes de contrato, autorização, erros e repetição em conjunto com `devjobs-testing-strategy`; solicite aprovação quando endpoint, campo ou permissão não estiver documentado.
