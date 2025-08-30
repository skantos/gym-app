-- Enforce 1:1 relation between initial_survey and equipment_profiles
-- and cleanup unused columns in initial_survey

-- 1) Ensure required columns exist with expected types
alter table public.initial_survey
  add column if not exists equipment_type text,
  add column if not exists training_days text[] not null default '{}',
  add column if not exists gender text,
  add column if not exists current_physique text,
  add column if not exists weight_kg numeric,
  add column if not exists height_cm int4,
  add column if not exists aesthetic_goal text,
  add column if not exists days_per_week int4,
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

-- 2) Make user_id unique to enforce single survey per user
do $$ begin
  if not exists (
    select 1 from pg_indexes where schemaname='public' and tablename='initial_survey' and indexname='initial_survey_user_id_key'
  ) then
    alter table public.initial_survey add constraint initial_survey_user_id_key unique (user_id);
  end if;
end $$;

-- 3) Add FK from equipment_profiles.id to initial_survey.user_id (keeping existing FK to auth.users if present)
do $$ begin
  if not exists (
    select 1 from information_schema.table_constraints
    where table_schema='public' and table_name='equipment_profiles' and constraint_name='equipment_profiles_id_fkey_initial_survey'
  ) then
    alter table public.equipment_profiles
      add constraint equipment_profiles_id_fkey_initial_survey
      foreign key (id) references public.initial_survey(user_id) on delete cascade;
  end if;
end $$;

-- 4) Cleanup: drop unused columns from initial_survey (safe-guard with IF EXISTS)
alter table public.initial_survey
  drop column if exists goal,
  drop column if exists session_duration_minutes,
  drop column if exists equipment_access,
  drop column if exists experience,
  drop column if exists has_injury,
  drop column if exists injuries,
  drop column if exists mobility_restriction,
  drop column if exists training_preference,
  drop column if exists sleep_hours_range,
  drop column if exists split_preference,
  drop column if exists preferred_time,
  drop column if exists intensity,
  drop column if exists rest_preference,
  drop column if exists warmup_preference,
  drop column if exists supersets_preference,
  drop column if exists dropsets_preference;

-- 5) Optional CHECKs for enums
alter table public.initial_survey
  add constraint initial_survey_equipment_type_chk
    check (equipment_type in ('custom','commercial_gym','small_gym','calisthenics','no_equipment')) not valid;
alter table public.initial_survey validate constraint initial_survey_equipment_type_chk;


