---
name: devjobs-implementation
description: Implementação orientada à arquitetura do DevJobs 2.0. Use ao criar ou modificar código, schemas, Server Actions, rotas, componentes ou integrações no projeto Next.js, TypeScript e Supabase.
---

# Implementação do DevJobs 2.0

- Antes de codificar, leia `AGENTS.md`, as fontes oficiais relevantes e os padrões existentes no workspace. Para mudanças Next.js, leia também a documentação local da versão instalada.
- Respeite Next.js 16, React, TypeScript, Supabase, Zod e as versões instaladas; não adicione dependências ou abstrações sem necessidade aprovada.
- Separe código de navegador, servidor e administração. Mantenha a Service Role isolada no servidor.
- Valide entradas com Zod na fronteira apropriada, sem transformar validação de payload em autorização.
- Derive tipos de schemas quando aplicável e mantenha validadores puros, sem acesso desnecessário a rede, banco, segredo ou ambiente.
- Preserve convenções, aliases, tratamento de erros e estrutura já existentes. Evite refatorações fora do escopo.
- Confirme constraints de migrations antes de espelhar regras no código; não invente campos, enums, limites ou regras funcionais.
- Quando requisito, contrato ou decisão estiver incompleto, pare no limite seguro e solicite decisão humana.
- Em mudanças estruturais autorizadas, atualize documentação e diagramas afetados. Não faça commit, push ou ação destrutiva automaticamente.
