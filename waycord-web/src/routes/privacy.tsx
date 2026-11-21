import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/privacy')({
  head: () => ({
    meta: [
      { title: 'Privacy Policy | Waycord' },
      {
        name: 'description',
        content: 'Waycord privacy policy and local-first data protection guidelines.',
      },
    ],
  }),
  component: PrivacyPage,
})

function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 sm:px-6 lg:px-8 bg-[#1E2124]">
      <div className="mb-6 border-b border-[#3B3E42] pb-4">
        <span className="font-mono text-xs uppercase tracking-wider text-[#88C0A4] font-semibold px-2 py-0.5 rounded bg-[#272A2D] border border-[#3B3E42]">
          Data Protection
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#F8FAFC] mt-3 mb-1 tracking-tight">
          Privacy Policy
        </h1>
        <p className="text-xs text-[#94A3B8]">
          Last updated: November 18, 2026 • Local-first privacy standards
        </p>
      </div>

      <div className="space-y-4 text-[#94A3B8] text-xs sm:text-sm leading-relaxed">
        <section className="bg-[#272A2D] p-5 rounded border border-[#3B3E42]">
          <h2 className="text-sm font-bold text-[#F8FAFC] mb-1.5">1. Local Storage First</h2>
          <p>
            Waycord is built on local-first storage. Your daily tasks, personal notes, categories,
            and checklist updates live right on your phone or computer. The app runs fully offline,
            meaning your personal coordination records never leave your device unless you choose to sync.
          </p>
        </section>

        <section className="bg-[#272A2D] p-5 rounded border border-[#3B3E42]">
          <h2 className="text-sm font-bold text-[#F8FAFC] mb-1.5">2. Encrypted Cloud Synchronization</h2>
          <p>
            When you sign in and enable sync, your data travels over secure encrypted channels.
            We enforce strict user-level access controls so no other user or unauthenticated party can
            view your private tasks or shared workspaces.
          </p>
        </section>

        <section className="bg-[#272A2D] p-5 rounded border border-[#3B3E42]">
          <h2 className="text-sm font-bold text-[#F8FAFC] mb-1.5">3. Voice Capture Privacy</h2>
          <p>
            Voice recordings submitted for task creation are transcribed in real-time and immediately deleted
            once your tasks are created. We never retain your audio files, and your personal voice notes are
            never used to train artificial intelligence models.
          </p>
        </section>

        <section className="bg-[#272A2D] p-5 rounded border border-[#3B3E42]">
          <h2 className="text-sm font-bold text-[#F8FAFC] mb-1.5">4. Payment Information</h2>
          <p>
            Payments within India are handled directly by PhonePe’s licensed payment gateway.
            Waycord never sees or stores your credit card numbers, UPI PINs, or netbanking passwords.
            International subscriptions are securely processed through Patreon.
          </p>
        </section>

        <section className="bg-[#272A2D] p-5 rounded border border-[#3B3E42]">
          <h2 className="text-sm font-bold text-[#F8FAFC] mb-1.5">5. Your Data, Your Control</h2>
          <p>
            You have full rights to export your data or delete your account at any time.
            Upon account deletion, all cloud-synced backups associated with your user ID are permanently purged.
          </p>
        </section>
      </div>
    </div>
  )
}
