export const metadata = { title: "How it works – Mr & Miss Kericho 2027" };

const contestant = [
  ["Fill in the form", "Choose your category and enter your details and a clear photo. Under 18? A parent or guardian adds their name, phone and consent."],
  ["Save your registration number", "You will see it on screen right after you submit."],
  ["Wait for approval", "The organisers check every application. They will tell you by WhatsApp or email."],
  ["Get your contestant number", "Once approved, you appear on the Contestants page with your number."],
  ["Invite people to vote", "Share your voting link with family and friends. It is on your confirmation screen."],
];
const voter = [
  ["Open the Vote page", "Find the category you like. Mr and Miss are separate categories."],
  ["Sign in with your email", "Enter your email and we send you a sign-in link. Open it on the same phone. Check your Spam or Promotions folder if you do not see it."],
  ["Tap Vote", "Choose your favourite and confirm. You get one vote in each category, and a vote cannot be changed."],
  ["Wait for the results", "Winners are announced after voting closes. Results appear on the Results page."],
];
const faq = [
  ["Does it cost anything?", "No. Registering and voting are free."],
  ["How many times can I vote?", "Once in each category. You can vote in every category, but not twice in the same one. Using several email addresses from the same inbox does not give extra votes."],
  ["Can contestants vote for themselves?", "Yes. Everyone gets one vote in each category."],
  ["The sign-in email did not arrive", "Check Spam and Promotions, wait a minute, then try again. Make sure you typed your email correctly."],
  ["Can I change my vote?", "No. Please check your choice before you confirm."],
  ["Is my phone number shown publicly?", "No. The public only sees your contestant number, your name and your photo. Contestants under 18 appear by first name only."],
  ["How long does approval take?", "The organisers review applications in the order they arrive. Contact them if you have not heard back after a few days."],
  ["I made a mistake in my application", "Contact the organisers with your registration number and they will help."],
  ["Who can enter?", "Residents of Kericho County are the focus. Contestants from outside the county can still apply by choosing Outside Kericho County."],
];

export default function HowItWorks() {
  const Steps = ({ items }: { items: string[][] }) => (
    <ol className="mt-6 grid gap-4">
      {items.map(([t, d], i) => (
        <li key={t} className="flex gap-4 border border-gold/30 p-4">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold font-display text-lg text-black" aria-hidden>{i + 1}</span>
          <div><p className="font-display text-lg">{t}</p><p className="mt-1 text-ivory/80">{d}</p></div>
        </li>))}
    </ol>);
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-display text-4xl text-gold">How it works</h1>
      <p className="mt-3 text-ivory/80">Simple steps for contestants and for voters.</p>
      <h2 id="enter" className="mt-12 font-display text-2xl">I want to enter</h2><Steps items={contestant} />
      <a href="/register" className="mt-6 inline-block bg-gold px-7 py-3 font-semibold text-black">Register as a contestant</a>
      <h2 id="vote" className="mt-16 font-display text-2xl">I want to vote</h2><Steps items={voter} />
      <a href="/vote" className="mt-6 inline-block border border-gold px-7 py-3 text-gold">Go to the Vote page</a>
      <h2 className="mt-16 font-display text-2xl">Questions</h2>
      <div className="mt-4 divide-y divide-gold/25 border-y border-gold/25">
        {faq.map(([q, a]) => (
          <details key={q} className="py-3"><summary className="cursor-pointer text-ivory">{q}</summary><p className="mt-2 text-ivory/80">{a}</p></details>))}
      </div>
      <p className="mt-10 text-ivory/80">Still stuck? WhatsApp us on <a className="text-gold underline" href="https://wa.me/254731436453">0731 436 453</a> or email <a className="text-gold underline" href="mailto:mrandmisskericho@gmail.com">mrandmisskericho@gmail.com</a>.</p>
    </main>);
}
