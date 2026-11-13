# Mr & Miss Kericho 2027
1. `npm install` then `npm run dev`
2. Create a Supabase project, run `supabase/migrations/0001_init.sql` in the SQL editor
3. Copy `.env.example` to `.env.local` and fill it in
## Replace before launch
- Voting open/close dates and finale date: `lib/event.ts` and the seed in the SQL file (marked PLACEHOLDER)
- Division list: DRAFT, confirm with organisers
- Add the Dwell Events logo to `public/`
## Next
Contestant registration (guardian consent), Fashion Week form, admin approvals, voter sign-in and voting page.
