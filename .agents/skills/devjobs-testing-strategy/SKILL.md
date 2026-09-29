---
name: devjobs-testing-strategy
description: Estratégia de testes do DevJobs 2.0. Use ao planejar ou revisar testes unitários, integração, RLS, autorização, jornadas completas, cobertura baseada em risco e regressão.
---

# Estratégia de Testes do DevJobs 2.0

- Relacione cenários a RF, regra de negócio, risco e comportamento observável antes de escolher a camada de teste.
- Use unitários para regras puras e validação; integração para banco, Supabase, RLS e serviços; E2E para jornadas críticas. Não simule uma camada quando o risco pertence à outra.
- Cubra sucesso, falha, limite, duplicidade, autorização permitida e negada, isolamento entre empresas e regressão quando aplicáveis.
- Mantenha testes determinísticos: isole rede, relógio, segredos e estado externo quando não forem parte explícita do cenário.
- Ao testar RLS ou autorização, use identidades e recursos de propriedade distinta; não considere mock de UI como prova de segurança.
- Não converta uma observação documental em teste executável sem entrada, ação e asserção concretas.
- Distingua casos planejados, implementados, executados, aprovados, falhos e bloqueados. Registre evidências reais e riscos residuais.
- Use `devjobs-quality-gates` para escolher e relatar comandos existentes; não declare cobertura ou execução sem resultado verificável.
