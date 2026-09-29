---
name: devjobs-ai-matching
description: IA e matching do DevJobs 2.0. Use ao planejar ou implementar análise de currículo, embeddings, pgvector, busca em linguagem natural, recomendação, matching e explicabilidade dos resultados.
---

# IA e Matching do DevJobs 2.0

- Comece pelos RFs e dados aprovados. Trate IA como camada consultiva; ela não altera silenciosamente dados oficiais nem decide contratação.
- Isole o fornecedor por adaptador e contrato interno. Não acople regras de domínio a SDK, modelo ou formato proprietário sem decisão aprovada.
- Envie somente os dados necessários e autorizados; aplique identidade, contexto de candidatura e políticas de privacidade antes de processar currículo ou perfil.
- Defina entradas, versão de modelo ou estratégia, falhas, retentativas e observabilidade antes de persistir embeddings ou resultados. Não invente tabelas, vetores ou fluxos inexistentes.
- Baseie matching em critérios rastreáveis de perfil e vaga; apresente explicações verificáveis, limites e incerteza. Não invente causalidade, compatibilidade ou garantia de emprego.
- Trate consulta em linguagem natural como entrada não confiável e converta-a para parâmetros estruturados validados antes de buscar dados.
- Reavalie cache, invalidação e reprocessamento somente quando a regra de negócio aprovada exigir; preserve auditabilidade de operações sensíveis.
- Planeje avaliações determinísticas, casos de falha e proteção contra vazamento de dados com `devjobs-testing-strategy` e `devjobs-supabase-security`.
