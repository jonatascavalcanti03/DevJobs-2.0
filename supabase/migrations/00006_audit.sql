-- Migration 00006: Audit

CREATE TABLE public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity TEXT NOT NULL,
    entity_id UUID NOT NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indices
CREATE INDEX idx_audit_logs_actor_user_id ON public.audit_logs(actor_user_id);
CREATE INDEX idx_audit_logs_entity_entity_id ON public.audit_logs(entity, entity_id);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at);

-- No updates or deletes allowed on audit logs
CREATE RULE no_update_audit_logs AS ON UPDATE TO public.audit_logs DO INSTEAD NOTHING;
CREATE RULE no_delete_audit_logs AS ON DELETE TO public.audit_logs DO INSTEAD NOTHING;
