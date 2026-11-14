-- Mr & Miss Kericho 2027 — core schema. Run in Supabase SQL editor (or `supabase db push`).
create type app_role as enum ('super_admin','event_manager','voting_manager','content_manager');
create type app_status as enum ('draft','submitted','under_review','approved','rejected');

create table profiles (id uuid primary key references auth.users on delete cascade, full_name text, role app_role, created_at timestamptz default now());
create table age_groups (id text primary key, label text not null, min_age int not null, max_age int not null);

-- A "division" = category x gender x age group. One vote per voter per division.
create table divisions (
  id serial primary key, slug text unique not null, category text not null,
  gender text not null check (gender in ('male','female','any')),
  age_group text references age_groups(id), title text not null,
  is_active boolean not null default true,
  voting_opens timestamptz, voting_closes timestamptz,      -- per-division countdown
  results_published boolean not null default false);

create table contestants (
  id uuid primary key default gen_random_uuid(),
  division_id int not null references divisions(id),
  user_id uuid references auth.users,                        -- optional: contestants apply without an account
  full_name text not null, stage_name text, email text not null, whatsapp text not null,
  date_of_birth date not null, town text, bio text, talent text, photo_path text not null,
  is_minor boolean not null, guardian_name text, guardian_phone text,
  guardian_consent boolean not null default false, consent_at timestamptz,
  status app_status not null default 'submitted',
  contestant_no int, referral_code text unique not null default 'VOTE-' || upper(substr(md5(random()::text),1,8)),
  created_at timestamptz default now(),
  check (not (status = 'approved' and is_minor and not guardian_consent)),
  unique (division_id, contestant_no));

create table fashion_week_applications (
  id uuid primary key default gen_random_uuid(), user_id uuid references auth.users,
  kind text not null check (kind in ('designer','fashionista')),
  full_name text not null, email text not null, phone text not null, location text,
  bio text, links text[], photo_path text, status app_status not null default 'submitted', created_at timestamptz default now());

-- Privacy: who voted and what they chose live in separate tables.
create table vote_receipts (voter_id uuid not null references auth.users, division_id int not null references divisions(id),
  created_at timestamptz default now(), primary key (voter_id, division_id));   -- DB-enforced one vote per division
create table ballots (id bigserial primary key, division_id int not null references divisions(id),
  contestant_id uuid not null references contestants(id),
  weight int not null default 1,                 -- ready for paid votes later
  source text not null default 'free',           -- 'free' | 'paid' (later)
  ref_code text, created_at timestamptz default now());
create index on ballots (contestant_id);

create table judge_scores (division_id int references divisions(id), contestant_id uuid references contestants(id),
  judge_id uuid references auth.users, score numeric not null check (score between 0 and 100),
  primary key (contestant_id, judge_id));
create table event_settings (key text primary key, value jsonb not null);
create table audit_logs (id bigserial primary key, actor uuid, action text not null, detail jsonb, at timestamptz default now());

create function is_staff(variadic roles app_role[]) returns boolean language sql stable security definer set search_path=public as
$$ select exists (select 1 from profiles where id = auth.uid() and (role = 'super_admin' or role = any(roles))) $$;

-- Public-safe contestant view: minors show first name only; no DOB, phone, email, town.
create view public_contestants as
select id, division_id, contestant_no, referral_code, photo_path, bio,
  case when is_minor then split_part(full_name,' ',1) else coalesce(stage_name, full_name) end as display_name
from contestants where status = 'approved';

create function cast_vote(p_contestant uuid, p_ref text default null) returns void
language plpgsql security definer set search_path=public as $$
declare v_div int; d divisions;
begin
  if auth.uid() is null then raise exception 'sign_in_required'; end if;
  if not exists (select 1 from auth.users where id = auth.uid() and email_confirmed_at is not null) then raise exception 'email_not_verified'; end if;
  select division_id into v_div from contestants where id = p_contestant and status = 'approved';
  if v_div is null then raise exception 'contestant_not_eligible'; end if;
  select * into d from divisions where id = v_div;
  if not d.is_active or d.voting_opens is null or now() < d.voting_opens or now() > d.voting_closes then raise exception 'voting_closed'; end if;
  insert into vote_receipts (voter_id, division_id) values (auth.uid(), v_div);
  insert into ballots (division_id, contestant_id, ref_code) values (v_div, p_contestant, p_ref);
exception when unique_violation then raise exception 'already_voted';
end $$;

-- Results: hidden until published, except to voting staff.
create function division_results(p_division int) returns table (contestant_id uuid, votes bigint)
language plpgsql stable security definer set search_path=public as $$
begin
  if not (is_staff('voting_manager') or exists (select 1 from divisions where id = p_division and results_published)) then raise exception 'results_hidden'; end if;
  return query select b.contestant_id, sum(b.weight)::bigint from ballots b where b.division_id = p_division group by 1 order by 2 desc;
end $$;

alter table profiles enable row level security; alter table contestants enable row level security;
alter table fashion_week_applications enable row level security; alter table vote_receipts enable row level security;
alter table ballots enable row level security; alter table judge_scores enable row level security;
alter table event_settings enable row level security; alter table audit_logs enable row level security;
alter table divisions enable row level security; alter table age_groups enable row level security;
create policy read_divisions on divisions for select using (true);
create policy read_age_groups on age_groups for select using (true);
-- No policies on vote_receipts / ballots: browsers can never read or write them directly.
create policy own_profile on profiles for select using (id = auth.uid() or is_staff('event_manager'));
create policy own_apply on contestants for insert with check (user_id = auth.uid() and status = 'submitted');
create policy own_read on contestants for select using (user_id = auth.uid() or is_staff('event_manager'));
create policy staff_edit on contestants for update using (is_staff('event_manager'));
create policy fw_insert on fashion_week_applications for insert with check (true);
create policy fw_read on fashion_week_applications for select using (user_id = auth.uid() or is_staff('event_manager'));
create policy fw_edit on fashion_week_applications for update using (is_staff('event_manager'));
create policy staff_scores on judge_scores for all using (is_staff('voting_manager'));
create policy staff_settings on event_settings for all using (is_staff('super_admin'));
create policy staff_audit on audit_logs for select using (is_staff('super_admin'));

-- Lock down grants: API roles get only what they need (Supabase grants broad defaults).
revoke all on all tables in schema public from anon, authenticated;
grant select on public_contestants, divisions, age_groups to anon, authenticated;
grant select on profiles, contestants, fashion_week_applications to authenticated;
grant insert, update on contestants, fashion_week_applications to authenticated;
grant select, insert, update, delete on judge_scores, event_settings to authenticated;
grant select on audit_logs to authenticated;
revoke execute on all functions in schema public from public, anon;
grant execute on function cast_vote(uuid, text) to authenticated;
grant execute on function division_results(int) to anon, authenticated;

-- Seed: DRAFT divisions (age groups from poster 3). Edit after review.
insert into age_groups values ('kids','Kids',5,10),('teens','Teens',11,17),('seniors','Seniors',18,26);
-- PLACEHOLDER voting dates — replace with the real ones before launch.
insert into divisions (slug,category,gender,age_group,title,voting_opens,voting_closes) values
('little-stars-mr','Mr and Miss Little Stars','male','kids','Mr Little Stars','2027-01-15 08:00+03','2027-02-15 18:00+03'),
('little-stars-miss','Mr and Miss Little Stars','female','kids','Miss Little Stars','2027-01-15 08:00+03','2027-02-15 18:00+03'),
('teen-mr','Mr and Miss Teen','male','teens','Mr Teen','2027-01-15 08:00+03','2027-02-15 18:00+03'),
('teen-miss','Mr and Miss Teen','female','teens','Miss Teen','2027-01-15 08:00+03','2027-02-15 18:00+03'),
('kericho-mr','Mr and Miss Kericho','male','seniors','Mr Kericho','2027-01-15 08:00+03','2027-02-15 18:00+03'),
('kericho-miss','Mr and Miss Kericho','female','seniors','Miss Kericho','2027-01-15 08:00+03','2027-02-15 18:00+03'),
('curvy-miss','Miss Curvy','female','seniors','Miss Curvy','2027-01-15 08:00+03','2027-02-15 18:00+03'),
('bodybuilding-mr','Body Building','male','seniors','Mr Body Building','2027-01-15 08:00+03','2027-02-15 18:00+03'),
('limitless-mr','Mr and Miss Limitless (PWD)','male',null,'Mr Limitless','2027-01-15 08:00+03','2027-02-15 18:00+03'),
('limitless-miss','Mr and Miss Limitless (PWD)','female',null,'Miss Limitless','2027-01-15 08:00+03','2027-02-15 18:00+03');
insert into event_settings values ('scoring','{"public_weight":100,"judges_weight":0}'),('results_visibility','"hidden_until_published"');
