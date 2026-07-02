-- ================================================================
-- Gym Log — schema completo
-- Ejecutar en el SQL Editor de tu proyecto Supabase
-- ================================================================

-- Perfiles de usuario (vinculado a auth.users)
create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz default now()
);
alter table public.profiles enable row level security;
create policy "Users can read and update their own profile"
  on public.profiles for all using (auth.uid() = id);

-- Rutinas
create table if not exists public.routines (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references public.profiles(id) on delete cascade not null,
  name       text not null,
  tag        text,
  created_at timestamptz default now()
);
alter table public.routines enable row level security;
create policy "Users manage their own routines"
  on public.routines for all using (auth.uid() = user_id);

-- Ejercicios dentro de una rutina
create table if not exists public.routine_exercises (
  id            uuid primary key default gen_random_uuid(),
  routine_id    uuid references public.routines(id) on delete cascade not null,
  exercise_name text not null,
  target_sets   int,
  target_reps   text,   -- "6-8", "12-15", etc.
  position      int not null default 0
);
alter table public.routine_exercises enable row level security;
create policy "Users manage exercises of their routines"
  on public.routine_exercises for all
  using (exists (select 1 from public.routines r where r.id = routine_id and r.user_id = auth.uid()));

-- Sesiones de entrenamiento completadas
create table if not exists public.workout_sessions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references public.profiles(id) on delete cascade not null,
  routine_id  uuid references public.routines(id) on delete set null,
  name        text not null,
  started_at  timestamptz default now(),
  finished_at timestamptz,
  notes       text
);
alter table public.workout_sessions enable row level security;
create policy "Users manage their own sessions"
  on public.workout_sessions for all using (auth.uid() = user_id);

-- Ejercicios dentro de una sesión
create table if not exists public.session_exercises (
  id            uuid primary key default gen_random_uuid(),
  session_id    uuid references public.workout_sessions(id) on delete cascade not null,
  exercise_name text not null,
  superset_group text,
  position      int not null default 0
);
alter table public.session_exercises enable row level security;
create policy "Users manage exercises of their sessions"
  on public.session_exercises for all
  using (exists (select 1 from public.workout_sessions s where s.id = session_id and s.user_id = auth.uid()));

-- Series dentro de un ejercicio de sesión
create table if not exists public.session_sets (
  id                  uuid primary key default gen_random_uuid(),
  session_exercise_id uuid references public.session_exercises(id) on delete cascade not null,
  set_number          int not null,
  weight_kg           numeric,
  reps                int,
  is_pr               boolean default false,
  is_dropset          boolean default false,
  parent_set_id       uuid references public.session_sets(id) on delete cascade,
  done                boolean default false,
  created_at          timestamptz default now()
);
alter table public.session_sets enable row level security;
create policy "Users manage sets of their sessions"
  on public.session_sets for all
  using (exists (
    select 1
    from public.session_exercises se
    join public.workout_sessions s on s.id = se.session_id
    where se.id = session_exercise_id and s.user_id = auth.uid()
  ));

-- Objetivos personales
create table if not exists public.goals (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references public.profiles(id) on delete cascade not null,
  label         text not null,
  exercise_name text,
  unit          text not null,
  target        numeric not null,
  created_at    timestamptz default now()
);
alter table public.goals enable row level security;
create policy "Users manage their own goals"
  on public.goals for all using (auth.uid() = user_id);

-- Ejercicios personalizados creados por el usuario (con su diagrama muscular)
create table if not exists public.custom_exercises (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references public.profiles(id) on delete cascade not null,
  name         text not null,
  view         text not null,
  highlights   jsonb not null default '{}'::jsonb,
  equipment    text,
  instructions text,
  created_at   timestamptz default now(),
  unique (user_id, name)
);
alter table public.custom_exercises enable row level security;
create policy "Users manage their own custom exercises"
  on public.custom_exercises for all using (auth.uid() = user_id);

-- ================================================================
-- Trigger: crear perfil automáticamente al registrar usuario
-- ================================================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles(id) values (new.id);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ================================================================
-- Vista: "anterior" — última serie completada por ejercicio
-- Usada para mostrar el dato de referencia al entrenar
-- ================================================================
create or replace view public.last_set_per_exercise as
select distinct on (s.user_id, se.exercise_name)
  s.user_id,
  se.exercise_name,
  ss.weight_kg,
  ss.reps,
  s.finished_at
from public.session_sets ss
join public.session_exercises se on se.id = ss.session_exercise_id
join public.workout_sessions s   on s.id = se.session_id
where ss.done = true and s.finished_at is not null
order by s.user_id, se.exercise_name, s.finished_at desc;

-- ================================================================
-- Vista: todas las series (no dropsets) de la última sesión completada
-- por ejercicio. Usada para comparar cada serie de hoy con su serie
-- equivalente (mismo set_number) de la vez anterior, en vez de comparar
-- todo contra una sola serie. Los dropsets quedan afuera porque su
-- set_number no corresponde a una serie "principal" real y mezclarlos
-- corre la numeración de las series siguientes.
-- ================================================================
create or replace view public.last_session_sets_per_exercise as
select
  s.user_id,
  se.exercise_name,
  ss.set_number,
  ss.weight_kg,
  ss.reps
from public.session_sets ss
join public.session_exercises se on se.id = ss.session_exercise_id
join public.workout_sessions s   on s.id = se.session_id
where ss.done = true
  and coalesce(ss.is_dropset, false) = false
  and s.finished_at is not null
  and s.id = (
    select s2.id
    from public.session_exercises se2
    join public.workout_sessions s2 on s2.id = se2.session_id
    where se2.exercise_name = se.exercise_name
      and s2.user_id = s.user_id
      and s2.finished_at is not null
    order by s2.finished_at desc
    limit 1
  )
order by s.user_id, se.exercise_name, ss.set_number;
