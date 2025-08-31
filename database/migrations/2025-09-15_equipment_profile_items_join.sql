-- Many-to-many entre perfiles de equipo y catálogo (relación explícita)

create table if not exists public.equipment_profile_items (
  profile_id uuid not null references public.equipment_profiles(id) on delete cascade,
  item_slug text not null references public.equipment_items_catalog(slug) on delete restrict,
  added_at timestamptz default now(),
  primary key (profile_id, item_slug)
);

alter table public.equipment_profile_items enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where tablename='equipment_profile_items' and policyname='epi_read_own') then
    create policy epi_read_own on public.equipment_profile_items for select using (auth.uid() = profile_id);
  end if;
  if not exists (select 1 from pg_policies where tablename='equipment_profile_items' and policyname='epi_insert_own') then
    create policy epi_insert_own on public.equipment_profile_items for insert with check (auth.uid() = profile_id);
  end if;
  if not exists (select 1 from pg_policies where tablename='equipment_profile_items' and policyname='epi_delete_own') then
    create policy epi_delete_own on public.equipment_profile_items for delete using (auth.uid() = profile_id);
  end if;
end $$;

-- Backfill desde equipment_profiles.items (array de slugs) si existe
do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema='public' and table_name='equipment_profiles' and column_name='items'
  ) then
    insert into public.equipment_profile_items (profile_id, item_slug)
    select ep.id, unnest(ep.items)
    from public.equipment_profiles ep
    on conflict do nothing;
  end if;
end$$;

-- Vista de conveniencia para obtener items como array
create or replace view public.v_equipment_profile_items as
select epi.profile_id as id, array_agg(epi.item_slug order by epi.item_slug) as items
from public.equipment_profile_items epi
group by epi.profile_id;


