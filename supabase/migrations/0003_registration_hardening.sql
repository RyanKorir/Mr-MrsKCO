alter table contestants
  add column applicant_gender text check (applicant_gender in ('male','female')),
  add column rules_accepted_at timestamptz,
  add column is_test boolean not null default false;
-- Existing rows were production-testing entries: flagged so they can be bulk-deleted at launch.
update contestants c set is_test = true, rules_accepted_at = c.created_at,
  applicant_gender = (select d.gender from divisions d where d.id = c.division_id and d.gender in ('male','female'));
update contestants set consent_at = null where not is_minor;
create unique index contestants_one_per_email on contestants (division_id, lower(email));
create unique index contestants_one_per_whatsapp on contestants (division_id, whatsapp);
insert into event_settings (key, value) values
  ('registration_opens', '"2026-12-01T00:00:00+03:00"'),
  ('registration_force_open', 'true'),   -- TESTING: set to false before launch
  ('age_reference_date', '"2027-03-01"') -- PLACEHOLDER: confirm with organisers
on conflict (key) do nothing;
