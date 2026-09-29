import type { EmailDraft } from "@/lib/mock/emails";

export function EmailPreview({ email }: { email: EmailDraft }) {
  return (
    <div className="overflow-hidden rounded-lg border border-line bg-surface">
      <dl className="divide-y divide-line border-b border-line bg-surface-muted text-xs">
        <div className="flex gap-3 px-3.5 py-2">
          <dt className="w-14 shrink-0 text-muted">From</dt>
          <dd className="text-ink-2">{email.mailbox}acmeindustrial.in</dd>
        </div>
        <div className="flex gap-3 px-3.5 py-2">
          <dt className="w-14 shrink-0 text-muted">To</dt>
          <dd className="min-w-0 truncate text-ink-2">
            {email.toName} &lt;{email.to}&gt;
          </dd>
        </div>
        <div className="flex gap-3 px-3.5 py-2">
          <dt className="w-14 shrink-0 text-muted">Subject</dt>
          <dd className="font-medium text-ink">{email.subject}</dd>
        </div>
      </dl>
      <p className="px-3.5 py-3 text-sm leading-6 whitespace-pre-line text-ink-2">{email.body}</p>
    </div>
  );
}
