import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/terms')({
  head: () => ({
    meta: [
      { title: 'Terms of Service | Waycord' },
      {
        name: 'description',
        content: 'Waycord terms and conditions of software usage and service tiers.',
      },
    ],
  }),
  component: TermsPage,
})

function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 sm:px-6 lg:px-8 bg-[#1E2124]">
      <div className="mb-6 border-b border-[#3B3E42] pb-4">
        <span className="font-mono text-xs uppercase tracking-wider text-[#88C0A4] font-semibold px-2 py-0.5 rounded bg-[#272A2D] border border-[#3B3E42]">
          Terms of Service
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#F8FAFC] mt-3 mb-1 tracking-tight">
          Terms of Service
        </h1>
        <p className="text-xs text-[#94A3B8]">
          Effective Date: November 18, 2026
        </p>
      </div>

      <div className="space-y-4 text-[#94A3B8] text-xs sm:text-sm leading-relaxed">
        <section className="bg-[#272A2D] p-5 rounded border border-[#3B3E42]">
          <h2 className="text-sm font-bold text-[#F8FAFC] mb-1.5">1. Using Waycord</h2>
          <p>
            Waycord provides local-first task coordination across mobile, web, and desktop.
            We grant you a non-exclusive license to use the app in accordance with these terms.
            You agree to use Waycord responsibly and avoid attempting to reverse-engineer our licensing systems.
          </p>
        </section>

        <section className="bg-[#272A2D] p-5 rounded border border-[#3B3E42]">
          <h2 className="text-sm font-bold text-[#F8FAFC] mb-1.5">2. Service Plans</h2>
          <p>
            Waycord provides three tiers:
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1 text-[#94A3B8]">
            <li><strong>Free Core:</strong> Up to 2 synced devices, 20 voice captures/month, 2 shared workspaces.</li>
            <li><strong>Waycord Pro:</strong> ₹149/mo (or $3.99/mo). Unlimited devices, unlimited voice summaries, up to 15 members per workspace, offline pro access.</li>
            <li><strong>Team / Campus:</strong> ₹249/seat/mo. Unlimited team members & workspaces, member roles, full team activity logs.</li>
          </ul>
        </section>

        <section className="bg-[#272A2D] p-5 rounded border border-[#3B3E42]">
          <h2 className="text-sm font-bold text-[#F8FAFC] mb-1.5">3. Offline Tokens</h2>
          <p>
            Waycord issues secure offline access tokens that keep Pro features unlocked on your phone
            even when you have no network connection. These tokens are tied to your personal account.
          </p>
        </section>

        <section className="bg-[#272A2D] p-5 rounded border border-[#3B3E42]">
          <h2 className="text-sm font-bold text-[#F8FAFC] mb-1.5">4. Device Backups</h2>
          <p>
            Because Waycord is local-first, your device retains your primary copy of tasks.
            While cloud sync automatically maintains online backups, users are encouraged to maintain standard
            device backups when switching hardware.
          </p>
        </section>
      </div>
    </div>
  )
}
