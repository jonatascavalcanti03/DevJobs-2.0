---
name: devjobs-database-engineering
description: Engenharia de banco do DevJobs 2.0. Use ao analisar ou alterar PostgreSQL, Supabase, modelo relacional, migrations, constraints, índices, integridade referencial, tipos gerados ou preservação de histórico.
---

# Banco de Dados do DevJobs 2.0

- Leia as migrations versionadas e as fontes de requisitos antes de propor tabelas, colunas, constraints, índices ou relações.
- Diferencie requisito funcional, validação de aplicação, constraint existente e decisão pendente. Não infira regras apenas do nome de uma coluna.
- Preserve chaves estrangeiras, unicidade, nulabilidade, histórico e relações que impedem exclusões indevidas; avalie impacto de cascades antes de alterá-las.
- Planeje migrations incrementais, revisáveis e reversíveis quando possível. Nunca execute reset, migração destrutiva, backfill irreversível ou alteração de dados sem autorização explícita.
- Considere índices a partir de consultas e volume comprovados; não adicione otimizações especulativas.
- Gere ou atualize tipos apenas contra o esquema efetivamente aprovado e verificado; não os use como substitutos de constraints ou RLS.
- Encaminhe RLS, grants e acessos privilegiados para `devjobs-supabase-security`; registre impacto em API, testes e documentação.
- Separe auditoria e planejamento de implementação. Ao concluir, informe migrations examinadas, impacto nos dados, validações realizadas e decisões humanas pendentes.
