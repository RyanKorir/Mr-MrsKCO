-- Contestants apply without an account; the server route (service role) inserts the row and photo.
alter table contestants alter column user_id drop not null;
insert into storage.buckets (id, name, public) values ('contestant-photos', 'contestant-photos', false) on conflict do nothing;
