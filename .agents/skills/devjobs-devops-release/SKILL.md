---
name: devjobs-devops-release
description: DevOps e releases do DevJobs 2.0. Use ao planejar ou revisar Git, CI, variáveis de ambiente, Vercel, builds, configuração por ambiente, observabilidade, rollback e publicação em produção.
---

# DevOps e Release do DevJobs 2.0

- Inspecione scripts, configuração, branch, estado Git e ambiente antes de propor pipeline, release ou deploy. Não assuma que infraestrutura antiga é a arquitetura aprovada.
- Separe configuração pública de segredos; nunca exponha Service Role, chaves de provedor ou credenciais em navegador, repositório, logs, artefatos ou relatório.
- Use variáveis por ambiente e valide presença sem imprimir valores. Documente somente nomes, finalidade e escopo de cada segredo quando autorizado.
- Trate lint, typecheck, testes relevantes e build como gates de release conforme os comandos existentes; reporte resultados reais, não resultados esperados.
- Planeje publicação com checklist: alterações aprovadas, migrations e compatibilidade, configuração, observabilidade, smoke checks, risco, responsável e rollback viável.
- Preserve histórico Git; não faça commit, push, tag, deploy, rollback ou alteração remota sem autorização explícita.
- Ao definir CI, Vercel ou monitoramento, não invente fornecedores, pipelines, permissões ou alertas já existentes. Solicite decisão para lacunas arquiteturais.
- Após uma operação autorizada, registre ambiente, versão, comandos, resultado, incidentes e pendências sem registrar segredos.
