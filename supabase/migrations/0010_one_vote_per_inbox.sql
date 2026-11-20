-- Gmail ignores dots and +tags, so john.doe+1@gmail.com and johndoe@gmail.com are the same inbox. Normalise before counting.
create function normalize_email(e text) returns text language sql immutable as $$
  select case
    when split_part(lower(e), '@', 2) in ('gmail.com', 'googlemail.com')
      then replace(split_part(split_part(lower(e), '@', 1), '+', 1), '.', '') || '@gmail.com'
    else split_part(split_part(lower(e), '@', 1), '+', 1) || '@' || split_part(lower(e), '@', 2)
  end $$;
alter table vote_receipts add column voter_key text;
update vote_receipts r set voter_key = normalize_email(u.email) from auth.users u where u.id = r.voter_id;
create unique index vote_receipts_one_per_inbox on vote_receipts (voter_key, division_id);
create or replace function cast_vote_as(p_voter uuid, p_contestant uuid, p_ref text default null) returns void
language plpgsql security definer set search_path=public as $$
declare v_div int; d divisions; v_email text;
begin
  if p_voter is null then raise exception 'sign_in_required'; end if;
  select email into v_email from auth.users where id = p_voter and email_confirmed_at is not null;
  if v_email is null then raise exception 'email_not_verified'; end if;
  select division_id into v_div from contestants where id = p_contestant and status = 'approved';
  if v_div is null then raise exception 'contestant_not_eligible'; end if;
  select * into d from divisions where id = v_div;
  if not d.is_active or d.voting_opens is null or now() < d.voting_opens or now() > d.voting_closes then raise exception 'voting_closed'; end if;
  insert into vote_receipts (voter_id, division_id, voter_key) values (p_voter, v_div, normalize_email(v_email));
  insert into ballots (division_id, contestant_id, ref_code) values (v_div, p_contestant, left(p_ref, 20));
exception when unique_violation then raise exception 'already_voted';
end $$;
revoke execute on function cast_vote_as(uuid, uuid, text) from public, anon, authenticated;
grant execute on function cast_vote_as(uuid, uuid, text) to service_role;
revoke execute on function normalize_email(text) from public, anon, authenticated;
