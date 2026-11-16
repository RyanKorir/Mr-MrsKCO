-- All votes pass through the server (bot checks, disposable-email block). Browsers cannot call vote functions directly.
drop function if exists cast_vote(uuid, text);
create function cast_vote_as(p_voter uuid, p_contestant uuid, p_ref text default null) returns void
language plpgsql security definer set search_path=public as $$
declare v_div int; d divisions;
begin
  if p_voter is null then raise exception 'sign_in_required'; end if;
  if not exists (select 1 from auth.users where id = p_voter and email_confirmed_at is not null) then raise exception 'email_not_verified'; end if;
  select division_id into v_div from contestants where id = p_contestant and status = 'approved';
  if v_div is null then raise exception 'contestant_not_eligible'; end if;
  select * into d from divisions where id = v_div;
  if not d.is_active or d.voting_opens is null or now() < d.voting_opens or now() > d.voting_closes then raise exception 'voting_closed'; end if;
  insert into vote_receipts (voter_id, division_id) values (p_voter, v_div);
  insert into ballots (division_id, contestant_id, ref_code) values (v_div, p_contestant, left(p_ref, 20));
exception when unique_violation then raise exception 'already_voted';
end $$;
revoke execute on function cast_vote_as(uuid, uuid, text) from public, anon, authenticated;
grant execute on function cast_vote_as(uuid, uuid, text) to service_role;
create function my_votes_as(p_voter uuid) returns int[] language sql stable security definer set search_path=public as
$$ select coalesce(array_agg(division_id), '{}') from vote_receipts where voter_id = p_voter $$;
revoke execute on function my_votes_as(uuid) from public, anon, authenticated;
grant execute on function my_votes_as(uuid) to service_role;
