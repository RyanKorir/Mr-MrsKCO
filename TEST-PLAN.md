# Test plan – Mr & Miss Kericho 2027 (TEST MODE: all data is deleted before launch)
Site: https://mr-miss-kericho.vercel.app · Voting is open for testing until 5 Dec 2026, 23:59 (EAT).

## Contestant registration (/register)
- [ ] Adult in the right category (Kericho 18–26) → success screen with registration number
- [ ] Under-18 → guardian section appears; cannot submit without guardian consent
- [ ] Wrong age for category (e.g. 30-year-old in Mr Kericho) → clear error
- [ ] Gender vs category mismatch is impossible (categories filter by gender)
- [ ] Same email or WhatsApp number in the same category twice → "already applied"
- [ ] Phone formats 0712…, +254712…, 254712… all accepted; "123" rejected
- [ ] Very large phone photo (5 MB+) → compressed and accepted; non-image rejected
- [ ] Constituency → ward dropdown fills correctly; "Outside Kericho County" asks for county and town
- [ ] Try on a slow connection / mobile data; note how long submit takes
## Fashion Week (/fashion-week): designer and fashionista, with and without photo
## Voting (/vote)
- [ ] Email sign-in link arrives (check spam) and returns you to /vote signed in
- [ ] Vote once per category; second vote in the same category is blocked; other categories still work
- [ ] Contestants can vote, including for themselves, once per category
- [ ] Share link /vote?ref=VOTE-XXXX highlights that contestant
- [ ] Disposable emails (e.g. mailinator) are refused
## Staff (/admin, /admin/results)
- [ ] Approve → contestant number assigned; reject; under review; minors need guardian consent
- [ ] WhatsApp and email approval buttons work; organiser alert email arrives
- [ ] Results: counts, % and charts match the votes cast; Excel and PDF exports open correctly and say TEST
- [ ] Publish results → /results shows them; unpublish hides them
## What to report
Screenshot, the time, device/browser, and what you expected vs what happened.
