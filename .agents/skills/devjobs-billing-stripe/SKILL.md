---
name: devjobs-billing-stripe
description: Billing Stripe do DevJobs 2.0. Use ao planejar ou implementar assinaturas, pagamentos, webhooks, eventos Stripe, confirmação de entitlement, idempotência, reconciliação e acesso a recursos pagos.
---

# Billing e Stripe do DevJobs 2.0

- Trate o servidor e eventos autenticados do provedor como fonte de verdade para pagamento, assinatura e entitlement. Nunca aceite URL de retorno, estado do navegador ou chamada do cliente como confirmação.
- Verifique assinatura de webhook com o corpo e segredo corretos antes de processar eventos; mantenha segredos somente no servidor e fora de logs e respostas.
- Projete processamento idempotente por identificador de evento e registre duplicatas, ordem inesperada, falhas e reconciliação sem liberar benefício antecipadamente.
- Atualize acesso pago somente após confirmação confiável e persistida; trate cancelamento, atraso, reembolso e estado desconhecido conforme regras aprovadas.
- Separe criação de checkout, recepção de webhook, caso de uso de billing e consulta de entitlement. A autorização de recursos pagos deve ser revalidada no servidor.
- Não invente produtos, preços, planos, tabelas, endpoints ou transições de assinatura. Solicite aprovação para regra comercial ou retenção de dados financeira.
- Planeje testes de assinatura inválida, evento duplicado, entrega fora de ordem, reprocessamento e acesso negado com `devjobs-testing-strategy`.
