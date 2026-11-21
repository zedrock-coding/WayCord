import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/refund-policy')({
  head: () => ({
    meta: [
      { title: 'Refund Policy | Waycord' },
      {
        name: 'description',
        content: 'Waycord 5-day money-back guarantee and subscription cancellation terms.',
      },
    ],
  }),
  component: RefundPolicyPage,
})

function RefundPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 sm:px-6 lg:px-8 bg-[#1E2124]">
      <div className="mb-6 border-b border-[#3B3E42] pb-4">
        <span className="font-mono text-xs uppercase tracking-wider text-[#88C0A4] font-semibold px-2 py-0.5 rounded bg-[#272A2D] border border-[#3B3E42]">
          Customer Guarantee
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#F8FAFC] mt-3 mb-1 tracking-tight">
          Refund & Cancellation Policy
        </h1>
        <p className="text-xs text-[#94A3B8]">
          Effective Date: November 18, 2026 • 5-Day Guarantee
        </p>
      </div>

      <div className="space-y-4 text-[#94A3B8] text-xs sm:text-sm leading-relaxed">
        <section className="bg-[#272A2D] p-5 rounded border border-[#3B3E42]">
          <h2 className="text-sm font-bold text-[#F8FAFC] mb-1.5 flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-[#88C0A4]"></span>
            <span>1. 5-Day Money-Back Guarantee</span>
          </h2>
          <p>
            We offer an unconditional <strong>5-calendar-day refund window</strong> on all new Waycord Pro
            subscriptions. If you are not satisfied with Waycord, submit a refund request from your
            <a href="/billing" className="text-[#88C0A4] underline ml-1 mr-1">Billing Portal</a>
            or email us at <a href="mailto:support@waycord.com" className="text-[#88C0A4] underline">support@waycord.com</a> within
            5 days of purchase.
          </p>
        </section>

        <section className="bg-[#272A2D] p-5 rounded border border-[#3B3E42]">
          <h2 className="text-sm font-bold text-[#F8FAFC] mb-1.5">2. Payout Times</h2>
          <p>
            Refunds are credited directly to your original payment method:
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1 text-[#94A3B8]">
            <li><strong>Indian UPI & Cards (PhonePe):</strong> Returned to your bank account or card within 3 to 5 business days.</li>
            <li><strong>International Memberships (Patreon):</strong> Processed according to standard Patreon pledge resolution timelines.</li>
          </ul>
        </section>

        <section className="bg-[#272A2D] p-5 rounded border border-[#3B3E42]">
          <h2 className="text-sm font-bold text-[#F8FAFC] mb-1.5">3. Cancellation & Grace Periods</h2>
          <p>
            You can turn off auto-renewal at any time:
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1 text-[#94A3B8]">
            <li>You keep full Pro access through the end of the month you paid for.</li>
            <li>No additional charges will ever occur.</li>
            <li>When the period ends, your account transitions to Free Core without losing any of your local tasks.</li>
          </ul>
        </section>
      </div>
    </div>
  )
}
