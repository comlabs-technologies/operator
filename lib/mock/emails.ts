import { formatINR } from "@/lib/utils";
import { getCustomer, type Invoice, type ReactivationCandidate } from "./company";

export interface EmailDraft {
  id: string;
  to: string;
  toName: string;
  company: string;
  subject: string;
  body: string;
  mailbox: "sales@" | "accounts@";
  /** Reference the draft relates to (invoice id, customer id). */
  ref: string;
}

export function paymentReminder(invoice: Invoice): EmailDraft {
  const customer = getCustomer(invoice.customerId)!;
  const firstName = customer.contact.name.split(" ")[0];
  const tone =
    invoice.daysOverdue > 60
      ? `This is now ${invoice.daysOverdue} days past the due date, and we would appreciate your help in closing it out this week.`
      : `This is now ${invoice.daysOverdue} days past the due date.`;
  return {
    id: `draft_${invoice.id}`,
    to: customer.contact.email,
    toName: customer.contact.name,
    company: customer.name,
    subject: `Payment reminder — ${invoice.id} (${formatINR(invoice.amount)})`,
    mailbox: "accounts@",
    ref: invoice.id,
    body: `Dear ${firstName},

I hope you are well. Our records show that invoice ${invoice.id}, issued on ${invoice.issued} for ${formatINR(invoice.amount)}, was due on ${invoice.due}. ${tone}

If payment has already been initiated, please share the UTR reference and we will update our records. If there is anything holding the payment — a query on the invoice or a delivery issue — let me know and we will resolve it quickly.

Kind regards,
Anita Rao
Finance, Acme Industrial`,
  };
}

export function reactivationEmail(candidate: ReactivationCandidate): EmailDraft {
  const customer = getCustomer(candidate.customerId)!;
  const firstName = customer.contact.name.split(" ")[0];
  return {
    id: `draft_${customer.id}`,
    to: customer.contact.email,
    toName: customer.contact.name,
    company: customer.name,
    subject: `Checking in from Acme Industrial`,
    mailbox: "sales@",
    ref: customer.id,
    body: `Hi ${firstName},

It has been a while since your last order with us — the ${candidate.lastProduct.toLowerCase()} we supplied in ${customer.lastOrder.split(" ").slice(1).join(" ")}. I wanted to check how they are performing on your lines and whether any maintenance or spares planning is coming up.

We have also revised lead times on Model-X assemblies and can now commit to three-week delivery on repeat orders. If it would help, I can share updated pricing against your previous order.

Would a short call next week work?

Best regards,
${customer.owner}
Acme Industrial`,
  };
}
