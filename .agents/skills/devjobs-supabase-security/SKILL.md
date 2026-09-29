---
name: devjobs-supabase-security
description: Segurança Supabase do DevJobs 2.0. Use ao revisar ou implementar autenticação, autorização, RLS, grants, migrations, dados pessoais, currículos, papéis ou isolamento entre empresas.
---

# Segurança Supabase do DevJobs 2.0

- Inspecione migrations, RLS, grants e políticas reais antes de afirmar permissões ou restrições.
- Valide a cadeia: identidade autenticada, papel oficial, propriedade ou membership, contexto do recurso e RLS mais autorização de backend.
- Nunca confie em `role`, `user_id`, `candidate_id`, `company_id` ou status sensível enviados pelo cliente como fonte de autoridade.
- Trate `public.users.role` e os vínculos de empresa como fontes de autoridade no servidor; preserve o isolamento entre empresas.
- Mantenha currículos e dados profissionais protegidos conforme as políticas existentes e o contexto de candidatura autorizado.
- Mantenha `SUPABASE_SERVICE_ROLE_KEY` exclusivamente no servidor, sem prefixo público, log, resposta HTTP ou navegador.
- Ao alterar comportamento autorizado, planeje ou execute testes de acesso permitido e negado, propriedade, escalonamento de privilégio e regressão.
- Não altere banco, grants, RLS ou migrations sem autorização explícita e análise de impacto em segurança, dados, API e documentação.
- Não faça commit, push ou comandos destrutivos automaticamente.
