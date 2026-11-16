create function results_summary() returns table (division_id int, contestant_id uuid, votes bigint, via_link bigint)
language sql stable security definer set search_path = public as $$
  select b.division_id, b.contestant_id, sum(b.weight)::bigint,
         coalesce(sum(b.weight) filter (where b.ref_code = c.referral_code), 0)::bigint
  from ballots b join contestants c on c.id = b.contestant_id
  group by 1, 2
$$;
revoke execute on function results_summary() from public, anon, authenticated;
grant execute on function results_summary() to service_role;
