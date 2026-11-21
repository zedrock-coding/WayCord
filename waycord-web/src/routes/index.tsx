import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'

const SITE_URL =
  typeof window !== 'undefined'
    ? window.location.origin
    : (process.env.VITE_SITE_URL || 'https://waycord.vercel.app')

const softwareApplicationSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Waycord',
  applicationCategory: 'ProductivityApplication',
  operatingSystem: 'Android, Web, Windows, macOS, Linux',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'INR',
  },
  description:
    'Local-first task & workspace coordination with instant offline speed and smart voice capture.',
  url: SITE_URL,
}

const faqItems = [
  {
    q: 'How does Waycord protect my privacy while offline?',
    a: 'Waycord stores your tasks, notes, and workspaces directly on your device inside an encrypted local database. You can manage your day completely offline without an internet connection, ensuring your personal workflow data never leaves your hardware unless you choose to sync.',
  },
  {
    q: 'How does Waycord keep my cloud data safe and private?',
    a: 'When you choose to sync across devices, your data is protected with strict user-level access controls and bank-grade encryption in transit and at rest. Voice recordings are processed in real-time and immediately deleted after transcription without training AI models.',
  },
  {
    q: 'What payment methods can I use?',
    a: 'For users in India, we support instant UPI (Google Pay, PhonePe, Paytm, BHIM), RuPay, Debit/Credit cards, and Netbanking via PhonePe. For international supporters and teams abroad, subscriptions are handled smoothly via Patreon.',
  },
  {
    q: 'What are the device limits across plans?',
    a: 'The Free Core plan lets you sync across up to 2 active devices. Upgrading to Waycord Pro or Team gives you unlimited simultaneous devices across your phone, tablet, laptop, and browser.',
  },
  {
    q: 'Can I cancel anytime? What happens to my data?',
    a: 'Yes, you can cancel auto-renewal with one click from your billing portal. Your Pro features remain active until the end of your prepaid period. Afterward, your account smoothly transitions back to Free Core—all your local tasks and projects remain completely intact.',
  },
  {
    q: 'How does the 5-day money-back guarantee work?',
    a: 'If you are unsatisfied with Waycord Pro for any reason, request a refund from your billing dashboard or support email within 5 calendar days of purchase. We will issue a 100% full refund back to your original payment method within 3 to 5 business days.',
  },
]

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqItems.map((item) => ({
    '@type': 'Question',
    name: item.q,
    acceptedAnswer: {
      '@type': 'Answer',
      text: item.a,
    },
  })),
}

export const Route = createFileRoute('/')({
  head: () => ({
    meta: [
      {
        title: 'Waycord — Local-First Task & Workspace Coordination',
      },
      {
        name: 'description',
        content:
          'Local-first task & workspace coordination with instant offline speed and smart voice capture.',
      },
      {
        property: 'og:title',
        content: 'Waycord — Local-First Task & Workspace Coordination',
      },
      {
        property: 'og:description',
        content:
          'Local offline storage, seamless multi-device sync, student workspaces, and hands-free voice task capture.',
      },
      {
        property: 'og:type',
        content: 'website',
      },
    ],
    scripts: [
      {
        type: 'application/ld+json',
        children: JSON.stringify(softwareApplicationSchema),
      },
      {
        type: 'application/ld+json',
        children: JSON.stringify(faqSchema),
      },
    ],
  }),
  component: HomePage,
})

function HomePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  return (
    <div className="bg-[#1E2124] text-[#F8FAFC]">
      {/* Hero Section */}
      <section className="pt-14 pb-14 sm:pt-16 sm:pb-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto text-center">
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#F8FAFC] max-w-4xl mx-auto leading-tight">
          High-speed task & workspace coordination that{' '}
          <span className="text-[#88C0A4]">works anywhere</span>, even offline.
        </h1>

        <p className="mt-5 text-sm sm:text-lg text-[#94A3B8] max-w-2xl mx-auto leading-relaxed">
          Zero delay on every interaction. Coordinate personal projects or collaborate in focused team
          workspaces that keep running whether you have internet or not.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href="https://github.com/zedrock-coding/Waypoint-App/releases"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-6 py-3 rounded bg-[#88C0A4] text-[#1E2124] font-bold text-sm hover:bg-[#9ECBB5] transition active:scale-95 flex items-center justify-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>Download Android App</span>
          </a>

          <a
            href="#pricing"
            className="w-full sm:w-auto px-6 py-3 rounded bg-[#272A2D] border border-[#3B3E42] text-[#F8FAFC] font-semibold text-sm hover:border-[#88C0A4] transition flex items-center justify-center space-x-2"
          >
            <span>View Plans & Pricing</span>
            <span>↓</span>
          </a>
        </div>
      </section>

      {/* Feature Highlights Section */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto border-t border-[#3B3E42]">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="font-mono text-xs uppercase tracking-wider text-[#88C0A4] font-semibold">
            Product Capabilities
          </span>
          <h2 className="text-2xl sm:text-4xl font-bold text-[#F8FAFC] mt-2 tracking-tight">
            Built for focus, speed, and continuous workflow.
          </h2>
          <p className="mt-3 text-xs sm:text-sm text-[#94A3B8]">
            Everything happens instantly on your screen, with reliable background sync across all devices.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-6 rounded bg-[#272A2D] border border-[#3B3E42] hover:border-[#88C0A4] transition-colors">
            <div className="w-11 h-11 rounded-lg bg-[#88C0A4]/10 border border-[#88C0A4]/20 flex items-center justify-center text-[#88C0A4] mb-4">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-[#F8FAFC] mb-2">Offline-First Zero-Lag Engine</h3>
            <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
              Every task creation, checkmark, and detail update writes instantly to your device storage.
              When you reconnect to the internet, all updates merge cleanly with your cloud account.
            </p>
          </div>

          <div className="p-6 rounded bg-[#272A2D] border border-[#3B3E42] hover:border-[#88C0A4] transition-colors">
            <div className="w-11 h-11 rounded-lg bg-[#88C0A4]/10 border border-[#88C0A4]/20 flex items-center justify-center text-[#88C0A4] mb-4">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 100-6 3 3 0 000 6z" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-[#F8FAFC] mb-2">Voice Capture & Audio Summaries</h3>
            <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
              Speak your tasks out loud. Waycord accurately organizes your speech into itemized to-dos with
              due dates and priorities. Listen to convenient audio briefings of your day while getting ready.
            </p>
          </div>

          <div className="p-6 rounded bg-[#272A2D] border border-[#3B3E42] hover:border-[#88C0A4] transition-colors">
            <div className="w-11 h-11 rounded-lg bg-[#88C0A4]/10 border border-[#88C0A4]/20 flex items-center justify-center text-[#88C0A4] mb-4">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-[#F8FAFC] mb-2">Organized Team Channels</h3>
            <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
              Designed for student clubs, campus hackathons, and small agile teams. Group tasks into clear
              categories, assign roles to members, and keep conversations focused on outcomes.
            </p>
          </div>

          <div className="p-6 rounded bg-[#272A2D] border border-[#3B3E42] hover:border-[#88C0A4] transition-colors">
            <div className="w-11 h-11 rounded-lg bg-[#88C0A4]/10 border border-[#88C0A4]/20 flex items-center justify-center text-[#88C0A4] mb-4">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-[#F8FAFC] mb-2">Offline Pro Guarantee</h3>
            <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
              When you upgrade to Pro, a tamper-proof license stays safely stored on your device.
              Even if you travel offline for weeks, your premium capabilities never lock you out.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Comparison Table Section */}
      <section id="pricing" className="py-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto border-t border-[#3B3E42]">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="font-mono text-xs uppercase tracking-wider text-[#88C0A4] font-semibold">
            Simple Pricing
          </span>
          <h2 className="text-2xl sm:text-4xl font-bold text-[#F8FAFC] mt-2 tracking-tight">
            Transparent plans. Zero surprises.
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-[#94A3B8]">
            Pay via UPI or card in India, or through Patreon internationally.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">
          {/* Free Core Card */}
          <div className="p-6 rounded bg-[#272A2D] border border-[#3B3E42] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-bold text-[#F8FAFC]">Free Core</h3>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#1E2124] text-[#94A3B8] border border-[#3B3E42]">
                  Starter
                </span>
              </div>
              <div className="mb-4">
                <span className="text-3xl font-black text-[#F8FAFC]">₹0</span>
                <span className="text-xs text-[#94A3B8]"> / forever</span>
              </div>
              <p className="text-xs text-[#94A3B8] mb-5">
                Essential offline task management for individuals getting started.
              </p>
              <ul className="space-y-3.5 text-xs text-[#94A3B8]">
                <li className="flex items-center space-x-2">
                  <span className="text-[#88C0A4] font-bold">✓</span>
                  <span className="text-[#F8FAFC]">Unlimited local and synced tasks</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-[#88C0A4] font-bold">✓</span>
                  <span>Basic recurrence patterns (daily/weekly)</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-[#88C0A4] font-bold">✓</span>
                  <span>Sync across up to 2 devices</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-[#88C0A4] font-bold">✓</span>
                  <span>20 cloud voice captures per month</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-[#88C0A4] font-bold">✓</span>
                  <span>Up to 2 shared workspaces (5 members each)</span>
                </li>
              </ul>
            </div>
            <Link
              to="/login"
              className="mt-6 w-full py-2.5 rounded bg-[#1E2124] border border-[#3B3E42] hover:border-[#88C0A4] text-[#F8FAFC] font-semibold text-xs text-center transition"
            >
              Get Started Free
            </Link>
          </div>

          {/* Waycord Pro Card */}
          <div className="p-6 rounded bg-[#272A2D] border-2 border-[#88C0A4] relative flex flex-col justify-between">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded bg-[#88C0A4] text-[#1E2124] font-mono text-[10px] font-bold uppercase tracking-wider">
              Most Popular
            </div>
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-bold text-[#F8FAFC]">Waycord Pro</h3>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#88C0A4]/10 text-[#88C0A4] border border-[#88C0A4]/30">
                  5-Day Guarantee
                </span>
              </div>
              <div className="mb-4">
                <span className="text-3xl font-black text-[#F8FAFC]">₹149</span>
                <span className="text-xs text-[#94A3B8]"> / month</span>
                <span className="text-[11px] text-[#94A3B8] block mt-0.5 font-mono">(or $3.99/mo via Patreon)</span>
              </div>
              <p className="text-xs text-[#94A3B8] mb-5">
                Maximum speed and power for students, builders, and active professionals.
              </p>
              <ul className="space-y-3.5 text-xs text-[#F8FAFC]">
                <li className="flex items-center space-x-2">
                  <span className="text-[#88C0A4] font-bold">✓</span>
                  <span>Full custom recurrence rules</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-[#88C0A4] font-bold">✓</span>
                  <span>Unlimited devices (Android, Web, Desktop)</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-[#88C0A4] font-bold">✓</span>
                  <span>Unlimited voice capture & audio summaries</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-[#88C0A4] font-bold">✓</span>
                  <span>Unlimited workspaces (up to 15 members)</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-[#88C0A4] font-bold">✓</span>
                  <span>30-day trash recovery & file attachments</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-[#88C0A4] font-bold">✓</span>
                  <span>Guaranteed offline pro access</span>
                </li>
              </ul>
            </div>
            <Link
              to="/upgrade"
              search={{ plan: 'pro' }}
              className="mt-6 w-full py-2.5 rounded bg-[#88C0A4] hover:bg-[#9ECBB5] text-[#1E2124] font-bold text-xs text-center transition active:scale-95"
            >
              Upgrade to Pro
            </Link>
          </div>

          {/* Team / Campus Card */}
          <div className="p-6 rounded bg-[#272A2D] border border-[#3B3E42] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-bold text-[#F8FAFC]">Team / Campus</h3>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#1E2124] text-[#94A3B8] border border-[#3B3E42]">
                  Groups
                </span>
              </div>
              <div className="mb-4">
                <span className="text-3xl font-black text-[#F8FAFC]">₹249</span>
                <span className="text-xs text-[#94A3B8]"> / seat / mo</span>
              </div>
              <p className="text-xs text-[#94A3B8] mb-5">
                Centralized management for campus clubs, student labs, and startups.
              </p>
              <ul className="space-y-3.5 text-xs text-[#94A3B8]">
                <li className="flex items-center space-x-2">
                  <span className="text-[#88C0A4] font-bold">✓</span>
                  <span className="text-[#F8FAFC]">Unlimited seats & workspaces</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-[#88C0A4] font-bold">✓</span>
                  <span>Team roles (Owners, Admins, Members)</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-[#88C0A4] font-bold">✓</span>
                  <span>Full organization activity logs</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-[#88C0A4] font-bold">✓</span>
                  <span>Centralized team billing portal</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-[#88C0A4] font-bold">✓</span>
                  <span>Priority technical assistance</span>
                </li>
              </ul>
            </div>
            <Link
              to="/upgrade"
              search={{ plan: 'team' }}
              className="mt-6 w-full py-2.5 rounded bg-[#1E2124] border border-[#3B3E42] hover:border-[#88C0A4] text-[#F8FAFC] font-semibold text-xs text-center transition"
            >
              Deploy Team
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section id="faq" className="py-24 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto border-t border-[#3B3E42]">
        <div className="text-center mb-12">
          <span className="font-mono text-xs uppercase tracking-wider text-[#88C0A4] font-semibold">
            Common Questions
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#F8FAFC] mt-2 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-[#94A3B8]">
            Clear answers on offline storage, device sync, and billing protection.
          </p>
        </div>

        <div className="space-y-2.5">
          {faqItems.map((item, index) => {
            const isOpen = openFaq === index
            return (
              <div
                key={index}
                className="rounded bg-[#272A2D] border border-[#3B3E42] overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  className="w-full p-4 text-left flex items-center justify-between space-x-4 hover:bg-[#2F3236] transition"
                  aria-expanded={isOpen}
                >
                  <span className="text-xs sm:text-sm font-semibold text-[#F8FAFC]">
                    {item.q}
                  </span>
                  <svg
                    className={`w-4 h-4 text-[#88C0A4] flex-shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.5"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 text-xs text-[#94A3B8] leading-relaxed border-t border-[#3B3E42] pt-3">
                    {item.a}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
