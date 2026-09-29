---
name: devjobs-frontend-quality
description: Qualidade de interface do DevJobs 2.0. Use ao verificar responsividade, acessibilidade, formulários, navegação, estados de interface, inspeção visual manual ou capturas de tela de páginas Next.js.
---

# Qualidade de Front-end do DevJobs 2.0

- Verifique layouts em telas pequenas, médias e grandes; procure overflow, desalinhamento, corte, sobreposição e áreas de toque inadequadas.
- Avalie teclado completo, foco visível, ordem de foco, rótulos, semântica, mensagens de erro associadas e contraste suficiente.
- Exercite formulários válidos e inválidos, submissão repetida e os estados de carregamento, erro, vazio e sucesso aplicáveis.
- Verifique menus, diálogos, navegação, fechamento, retorno de foco e demais interações do escopo.
- Use capturas de tela quando houver ferramenta disponível e compare-as com a referência ou especificação aprovada. Registre inspeção manual separadamente de teste automatizado.
- Acione os comandos e gates existentes adequados ao escopo conforme `devjobs-quality-gates`; não substitua evidência de execução por suposição visual.
- Declare resultado aprovado somente com evidência real. Informe limitações de ambiente, cenários não verificados e riscos restantes.
- Não instale ferramentas ou dependências, nem modifique código, configuração ou arquitetura durante uma inspeção sem solicitação explícita.
