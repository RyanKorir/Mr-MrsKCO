alter table fashion_week_applications add column is_test boolean not null default false;
alter table vote_receipts add column is_test boolean not null default false;
alter table ballots add column is_test boolean not null default false;
insert into event_settings (key, value) values ('environment', '"testing"') on conflict (key) do update set value = '"testing"';
-- While environment = testing, every new row is labelled as test data automatically.
create function mark_test_row() returns trigger language plpgsql security definer set search_path = public as $$
begin
  new.is_test := coalesce((select value #>> '{}' from event_settings where key = 'environment'), 'testing') <> 'live';
  return new;
end $$;
create trigger t_mark_test before insert on contestants for each row execute function mark_test_row();
create trigger t_mark_test before insert on fashion_week_applications for each row execute function mark_test_row();
create trigger t_mark_test before insert on vote_receipts for each row execute function mark_test_row();
create trigger t_mark_test before insert on ballots for each row execute function mark_test_row();
update contestants set is_test = true; update fashion_week_applications set is_test = true;
update vote_receipts set is_test = true; update ballots set is_test = true;
