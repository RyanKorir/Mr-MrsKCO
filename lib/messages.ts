// One approval message, reused for WhatsApp, the mail button and the automatic email.
export const approvalText = (o: { name: string; title: string; no: number | null }) =>
  `Congratulations ${o.name}! Your application for ${o.title} in Mr & Miss Kericho 2027 has been approved. Your contestant number is ${o.no}. The organisers will share the next steps soon.`;
