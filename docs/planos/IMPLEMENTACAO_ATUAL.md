# Implementação atual — autenticação e prévias visuais

Data: 2026-10-11

## Implementado nesta entrega

- cadastro de candidato com validação de e-mail e senha no servidor;
- normalização de e-mail e política de senha documentada no plano da ETAPA 2.2;
- migration `00008_auth_user_bootstrap.sql`, que cria o registro `public.users` a partir de `auth.users` com papel inicial `CANDIDATE`;
- remoção de `user_metadata.role` como fallback de autorização;
- redirecionamento pós-login limitado a caminhos internos;
- páginas de prévia: candidatos, empresas, recursos e sobre.

## Limites preservados

- RF02 (cadastro completo de empresa) não foi implementado: o contrato continua pendente.
- As páginas de empresas e recursos são prévias visuais; não criam dados, nem liberam funções de recrutamento.
- A migration precisa ser aplicada ao projeto Supabase antes de o novo fluxo de cadastro ser usado em produção.

## Verificação pendente

- validar a migration em ambiente Supabase de teste;
- executar testes de RLS com identidades distintas;
- concluir os validadores e testes restantes previstos na ETAPA 2.2.
