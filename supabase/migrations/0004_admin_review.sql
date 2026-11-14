-- Staff review actions. Only the server (service role) may call these; browsers cannot.
create function review_contestant(p_id uuid, p_action text, p_actor uuid) returns jsonb
language plpgsql security definer set search_path=public as $$
declare c contestants; n int;
begin
  select * into c from contestants where id = p_id for update;
  if not found then raise exception 'not_found'; end if;
  if p_action = 'approve' then
    if c.is_minor and not c.guardian_consent then raise exception 'guardian_consent_missing'; end if;
    if c.contestant_no is null then
      perform pg_advisory_xact_lock(c.division_id);
      select coalesce(max(contestant_no), 0) + 1 into n from contestants where division_id = c.division_id;
      update contestants set contestant_no = n where id = p_id;
    end if;
    update contestants set status = 'approved' where id = p_id;
  elsif p_action = 'reject' then update contestants set status = 'rejected' where id = p_id;
  elsif p_action = 'review' then update contestants set status = 'under_review' where id = p_id;
  else raise exception 'bad_action'; end if;
  insert into audit_logs (actor, action, detail) values (p_actor, 'contestant_' || p_action, jsonb_build_object('contestant', p_id));
  return jsonb_build_object('status', (select status from contestants where id = p_id), 'contestant_no', (select contestant_no from contestants where id = p_id));
end $$;
revoke execute on function review_contestant(uuid, text, uuid) from public, anon, authenticated;
grant execute on function review_contestant(uuid, text, uuid) to service_role;
