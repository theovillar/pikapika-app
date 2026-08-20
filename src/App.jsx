-- ============================================================
-- ORÉE — Chat de groupe entre les participants d'une même sortie
-- Fermé automatiquement 5h après le début de la sortie.
-- À coller dans Supabase > SQL Editor > New query > Run
-- ============================================================

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  activity_id bigint not null references public.activities(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  content text not null check (char_length(content) between 1 and 500),
  created_at timestamptz not null default now()
);

create index if not exists idx_messages_activity on public.messages(activity_id, created_at);

alter table public.messages enable row level security;

-- Fonction : la sortie est-elle encore "ouverte" (moins de 5h après son début) ?
create or replace function public.activity_chat_open(aid bigint)
returns boolean
language sql
stable
as $$
  select exists (
    select 1 from public.activities a
    where a.id = aid and now() < a.starts_at + interval '5 hours'
  );
$$;

-- Fonction : la personne participe-t-elle à cette sortie ?
create or replace function public.is_participant(aid bigint)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.registrations r
    where r.activity_id = aid and r.user_id = auth.uid()
  );
$$;

-- Lecture : réservée aux participants (même après la fermeture, pour relire l'historique)
create policy "Les participants lisent les messages de leur sortie"
on public.messages for select
using (public.is_participant(activity_id));

-- Écriture : uniquement les participants, et seulement tant que le chat est ouvert
create policy "Les participants écrivent tant que le chat est ouvert"
on public.messages for insert
with check (
  auth.uid() = user_id
  and public.is_participant(activity_id)
  and public.activity_chat_open(activity_id)
);

-- Chacun peut supprimer ses propres messages
create policy "Chacun supprime ses propres messages"
on public.messages for delete
using (auth.uid() = user_id);

-- Vue enrichie : message + pseudo/photo de l'auteur
create or replace view public.messages_with_author as
select
  m.id, m.activity_id, m.user_id, m.content, m.created_at,
  p.display_name as author_name,
  p.avatar_url as author_avatar,
  p.genre as author_genre
from public.messages m
join public.profiles p on p.id = m.user_id;

grant select on public.messages_with_author to authenticated;
