---
name: devjobs-quality-gates
description: Qualidade e verificação do DevJobs 2.0. Use ao planejar, executar, interpretar ou relatar lint, typecheck, testes, build, cobertura, regressões e critérios de aceite.
---

# Quality Gates do DevJobs 2.0

- Leia `package.json` e as configurações de teste antes de indicar comandos; use apenas scripts realmente existentes.
- Execute gates proporcionais à mudança: lint, typecheck, testes relevantes e build quando autorizados e aplicáveis.
- Verifique e reporte o resultado real de cada comando. Diferencie executado, não executado, aprovado, falho e bloqueado.
- Teste cenários positivos, negativos, autorização e regressão quando forem relevantes ao escopo.
- Mantenha testes unitários isolados de banco, rede, segredos e ambiente, salvo quando a natureza do teste exigir integração explícita.
- Não declare cobertura, sucesso ou ausência de regressão sem evidência de execução.
- Ao concluir, informe arquivos alterados, comandos executados, resultados, falhas, riscos e decisões pendentes.
- Em mudanças estruturais autorizadas, confirme documentação e diagramas afetados. Não faça commit, push ou comandos destrutivos automaticamente.
