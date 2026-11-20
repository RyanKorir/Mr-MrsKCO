-- LAUNCH CLEANUP — run ONLY when going live. Not a migration. Run the steps in order.
-- 1) Look first: how many test rows will be removed?
select 'contestants' t, count(*) from contestants where is_test
union all select 'fashion_week', count(*) from fashion_week_applications where is_test
union all select 'ballots', count(*) from ballots where is_test
union all select 'vote_receipts', count(*) from vote_receipts where is_test;
-- 2) Delete test data (ballots and receipts first because of foreign keys).
delete from ballots where is_test;
delete from vote_receipts where is_test;
delete from contestants where is_test;
delete from fashion_week_applications where is_test;
delete from audit_logs;
-- 3) Switch to live so new rows are NOT labelled as test.
update event_settings set value = '"live"' where key = 'environment';
update event_settings set value = 'false' where key = 'registration_force_open';
-- 3b) Voting was opened for TESTING (20 Nov 2026 to 25 Nov 2026). Set the REAL dates (replace the values) and hide test results.
-- update divisions set voting_opens = 'REAL OPEN TIME+03', voting_closes = 'REAL CLOSE TIME+03', results_published = false;
-- delete from event_settings where key = 'voting_window_placeholder';
-- 4) By hand: delete leftover photos in Storage > contestant-photos; delete test voter accounts in Authentication > Users (keep staff).
