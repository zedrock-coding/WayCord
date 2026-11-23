import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { LandingSkeleton } from '../components/LandingSkeleton'

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
  pendingComponent: LandingSkeleton,
  component: HomePage,
})

function HomePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0)
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly')
  const [activeMockTab, setActiveMockTab] = useState<'all' | 'high' | 'recurring'>('all')
  const [mockChecked, setMockChecked] = useState<Record<number, boolean>>({
    1: false,
    2: true,
    3: false,
  })

  const toggleMockTask = (id: number) => {
    setMockChecked((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <div className="bg-[#1E2124] text-[#F8FAFC] selection:bg-[#88C0A4] selection:text-[#1E2124]">
      {/* Background radial glow */}
      <div className="relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-[#88C0A4]/10 via-[#88C0A4]/3 to-transparent blur-3xl pointer-events-none -z-10" />

        {/* HERO SECTION */}
        <section className="pt-16 pb-16 sm:pt-24 sm:pb-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto text-center">
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#272A2D] border border-[#3B3E42] mb-8 shadow-sm hover:border-[#88C0A4]/60 transition">
            <span className="w-2 h-2 rounded-full bg-[#88C0A4] animate-pulse" />
            <span className="text-xs font-mono font-medium text-[#88C0A4]">
              Offline-First Engine v0.8.1
            </span>
            <span className="text-[#3B3E42]">|</span>
            <span className="text-xs text-[#94A3B8]">0ms Latency Tasking</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#F8FAFC] max-w-4xl mx-auto leading-[1.12]">
            High-speed workspace that{' '}
            <span className="bg-gradient-to-r from-[#88C0A4] via-[#A8D8C0] to-[#88C0A4] bg-clip-text text-transparent">
              works anywhere
            </span>
            , even offline.
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-sm sm:text-lg text-[#94A3B8] max-w-2xl mx-auto leading-relaxed">
            Zero delay on every checkmark. Smart voice breakdown powered by Gemini. Instant multi-device sync with bank-grade encryption that keeps running whether you have internet or not.
          </p>

          {/* Action CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <a
              href="/app"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#88C0A4] text-[#1E2124] font-bold text-sm hover:bg-[#9ECBB5] transition active:scale-95 flex items-center justify-center space-x-2 shadow-lg shadow-[#88C0A4]/20 hover:shadow-[#88C0A4]/30"
            >
              <span>Launch Web App</span>
              <span className="text-xs font-mono">→</span>
            </a>

            <a
              href="https://github.com/zedrock-coding/WayCord/releases/download/v0.7.1/Waycord-v0.7.1+29-Setup.exe"
              className="w-full sm:w-auto px-5 py-3.5 rounded-xl bg-[#272A2D] border border-[#3B3E42] text-[#F8FAFC] font-semibold text-sm hover:border-[#88C0A4] transition flex items-center justify-center space-x-2 hover:bg-[#2F3236]"
            >
              <svg className="w-4 h-4 text-[#88C0A4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>Download Windows (.exe)</span>
            </a>

            <a
              href="https://github.com/zedrock-coding/WayCord/releases/download/v0.7.1/waycord-v0.7.1.apk"
              className="w-full sm:w-auto px-5 py-3.5 rounded-xl bg-[#272A2D] border border-[#3B3E42] text-[#F8FAFC] font-semibold text-sm hover:border-[#88C0A4] transition flex items-center justify-center space-x-2 hover:bg-[#2F3236]"
            >
              <svg className="w-4 h-4 text-[#88C0A4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>Download Android (.apk)</span>
            </a>

            <a
              href="#pricing"
              className="w-full sm:w-auto px-4 py-3.5 text-xs font-mono text-[#94A3B8] hover:text-[#88C0A4] transition flex items-center justify-center space-x-1"
            >
              <span>Plans & Pricing</span>
              <span>↓</span>
            </a>
          </div>

          <p className="mt-3 text-xs text-[#94A3B8]">
            If you want to download older versions,{' '}
            <a
              href="https://github.com/zedrock-coding/WayCord/releases"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#88C0A4] hover:underline font-medium"
            >
              go here
            </a>
            .
          </p>

          {/* INTERACTIVE PRODUCT WINDOW MOCKUP */}
          <div className="mt-14 max-w-5xl mx-auto rounded-2xl border border-[#3B3E42] bg-[#191C1F] shadow-2xl overflow-hidden text-left ring-1 ring-white/5">
            {/* Window title bar */}
            <div className="px-4 py-3 bg-[#111417] border-b border-[#3B3E42] flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-[#FF5F56]/80" />
                <div className="w-3 h-3 rounded-full bg-[#FFBD2E]/80" />
                <div className="w-3 h-3 rounded-full bg-[#27C93F]/80" />
                <span className="ml-2 text-xs font-mono text-[#94A3B8]">Waycord — Personal Workspace</span>
              </div>
              <div className="flex items-center space-x-3 text-[11px] font-mono text-[#94A3B8]">
                <span className="flex items-center gap-1.5 text-[#88C0A4]">
                  <span className="w-2 h-2 rounded-full bg-[#88C0A4]" />
                  <span>ALL CHANGES SAVED</span>
                </span>
                <span className="hidden sm:inline text-[#8A938C]">• Cloud Active</span>
              </div>
            </div>

            {/* Mockup App Body */}
            <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-6 bg-[#191C1F]">
              {/* Left sidebar snippet */}
              <div className="hidden md:block md:col-span-3 space-y-4 border-r border-[#2D3135] pr-4">
                <div className="space-y-1">
                  <div className="text-[10px] uppercase font-mono font-bold text-[#8A938C] px-2 mb-2 tracking-wider">
                    Views
                  </div>
                  <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-[#272A2D] text-[#88C0A4] text-xs font-semibold">
                    <span className="flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>Today</span>
                    </span>
                    <span className="text-[10px] font-mono bg-[#1E2124] px-1.5 py-0.5 rounded text-[#88C0A4]">3</span>
                  </div>
                  <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[#94A3B8] text-xs hover:text-white transition">
                    <span className="flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                      <span>Inbox</span>
                    </span>
                    <span className="text-[10px] font-mono">0</span>
                  </div>
                  <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[#94A3B8] text-xs hover:text-white transition">
                    <span className="flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      <span>Recurring</span>
                    </span>
                    <span className="text-[10px] font-mono">1</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#2D3135] space-y-1">
                  <div className="text-[10px] uppercase font-mono font-bold text-[#8A938C] px-2 mb-2 tracking-wider">
                    Workspaces
                  </div>
                  <div className="flex items-center space-x-2 px-2.5 py-1.5 text-xs text-[#94A3B8]">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>Sprint Execution</span>
                  </div>
                  <div className="flex items-center space-x-2 px-2.5 py-1.5 text-xs text-[#94A3B8]">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    <span>Academic Lab</span>
                  </div>
                </div>
              </div>

              {/* Main task list area */}
              <div className="md:col-span-9 space-y-4">
                {/* Header controls inside mockup */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#2D3135]">
                  <div>
                    <div className="text-[11px] font-mono text-[#88C0A4] uppercase tracking-wider">
                      Today's Focus • Sunday, Nov 22
                    </div>
                    <div className="text-xl font-bold text-white mt-0.5">Active Worklist</div>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <button
                      type="button"
                      onClick={() => setActiveMockTab('all')}
                      className={`px-2.5 py-1 rounded text-xs font-mono transition ${
                        activeMockTab === 'all'
                          ? 'bg-[#88C0A4] text-[#1E2124] font-bold'
                          : 'bg-[#272A2D] text-[#94A3B8]'
                      }`}
                    >
                      All (3)
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveMockTab('high')}
                      className={`px-2.5 py-1 rounded text-xs font-mono transition ${
                        activeMockTab === 'high'
                          ? 'bg-[#88C0A4] text-[#1E2124] font-bold'
                          : 'bg-[#272A2D] text-[#94A3B8]'
                      }`}
                    >
                      High Priority
                    </button>
                  </div>
                </div>

                {/* Interactive Task Cards */}
                <div className="space-y-2.5">
                  {/* Task 1 */}
                  <div
                    onClick={() => toggleMockTask(1)}
                    className="p-3.5 rounded-xl bg-[#232629] border border-[#33363A] hover:border-[#88C0A4]/60 transition cursor-pointer flex items-start space-x-3"
                  >
                    <input
                      type="checkbox"
                      checked={mockChecked[1]}
                      onChange={() => {}}
                      className="mt-1 w-4 h-4 rounded border-gray-600 accent-[#88C0A4] cursor-pointer"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-sm font-semibold ${
                            mockChecked[1] ? 'line-through text-[#8A938C]' : 'text-white'
                          }`}
                        >
                          Ship production build with zero latency local cache
                        </span>
                        <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-red-950/60 text-red-400 border border-red-800/40">
                          Urgent
                        </span>
                      </div>
                      <div className="flex items-center space-x-3 mt-1.5 text-xs text-[#94A3B8] font-mono">
                        <span>#engineering</span>
                        <span>• 3 milestones</span>
                        <span className="text-[#88C0A4]">Due 5:00 PM</span>
                      </div>
                    </div>
                  </div>

                  {/* Task 2 */}
                  <div
                    onClick={() => toggleMockTask(2)}
                    className="p-3.5 rounded-xl bg-[#232629] border border-[#33363A] hover:border-[#88C0A4]/60 transition cursor-pointer flex items-start space-x-3"
                  >
                    <input
                      type="checkbox"
                      checked={mockChecked[2]}
                      onChange={() => {}}
                      className="mt-1 w-4 h-4 rounded border-gray-600 accent-[#88C0A4] cursor-pointer"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-sm font-semibold ${
                            mockChecked[2] ? 'line-through text-[#8A938C]' : 'text-white'
                          }`}
                        >
                          Review PhonePe webhook verification signatures
                        </span>
                        <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-amber-950/60 text-amber-400 border border-amber-800/40">
                          Medium
                        </span>
                      </div>
                      <div className="flex items-center space-x-3 mt-1.5 text-xs text-[#94A3B8] font-mono">
                        <span>#billing</span>
                        <span>• Complete</span>
                      </div>
                    </div>
                  </div>

                  {/* Task 3 */}
                  <div
                    onClick={() => toggleMockTask(3)}
                    className="p-3.5 rounded-xl bg-[#232629] border border-[#33363A] hover:border-[#88C0A4]/60 transition cursor-pointer flex items-start space-x-3"
                  >
                    <input
                      type="checkbox"
                      checked={mockChecked[3]}
                      onChange={() => {}}
                      className="mt-1 w-4 h-4 rounded border-gray-600 accent-[#88C0A4] cursor-pointer"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-sm font-semibold ${
                            mockChecked[3] ? 'line-through text-[#8A938C]' : 'text-white'
                          }`}
                        >
                          Sync offline JWT tokens with 72-hour grace window
                        </span>
                        <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-blue-950/60 text-blue-400 border border-blue-800/40">
                          Normal
                        </span>
                      </div>
                      <div className="flex items-center space-x-3 mt-1.5 text-xs text-[#94A3B8] font-mono">
                        <span>#security</span>
                        <span>• 1 subtask</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mockup Bottom Voice Bar */}
                <div className="p-3 rounded-xl bg-[#111417] border border-[#33363A] flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-[#88C0A4]/20 border border-[#88C0A4]/40 flex items-center justify-center text-[#88C0A4]">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 100-6 3 3 0 000 6z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white">Voice Command Bar</div>
                      <div className="text-[11px] text-[#94A3B8] font-mono">
                        "Draft presentation milestones by tomorrow evening"
                      </div>
                    </div>
                  </div>
                  <span className="font-mono text-[10px] px-2 py-1 rounded bg-[#272A2D] text-[#88C0A4] border border-[#3B3E42]">
                    ⌘K to execute
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* VALUE TELEMETRY STRIP */}
      <section className="border-y border-[#3B3E42] bg-[#191C1F]/60 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#88C0A4] font-mono">&lt; 10ms</div>
            <div className="text-xs text-[#94A3B8] mt-1">Local Write Latency</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">100%</div>
            <div className="text-xs text-[#94A3B8] mt-1">Offline Capability</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#88C0A4] font-mono">AES-256</div>
            <div className="text-xs text-[#94A3B8] mt-1">Encrypted Sync</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">4 Platforms</div>
            <div className="text-xs text-[#94A3B8] mt-1">Android, Windows, Web, Mac</div>
          </div>
        </div>
      </section>

      {/* BENTO GRID FEATURE SHOWCASE */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="font-mono text-xs uppercase tracking-wider text-[#88C0A4] font-semibold">
            Architectural Excellence
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#F8FAFC] mt-2 tracking-tight">
            Engineered for pure speed and zero friction.
          </h2>
          <p className="mt-3 text-xs sm:text-sm text-[#94A3B8]">
            Every layer is optimized for offline reliability, keyboard navigation, and focused execution.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Bento Card 1: 2-column wide */}
          <div className="md:col-span-2 p-8 rounded-2xl bg-[#232629] border border-[#3B3E42] hover:border-[#88C0A4]/60 transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-[#88C0A4]/10 border border-[#88C0A4]/20 flex items-center justify-center text-[#88C0A4] mb-5">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Offline-First Zero-Lag Engine</h3>
              <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed max-w-xl">
                Every action writes synchronously to device storage first (Hive/SQLite). There are no loading spinners, no network wait states, and no frozen interfaces. When your connection returns, an intelligent last-write-wins engine reconciles deltas automatically.
              </p>
            </div>

            {/* Visual sync pipeline bar */}
            <div className="mt-6 p-4 rounded-xl bg-[#191C1F] border border-[#33363A] flex items-center justify-between text-xs font-mono">
              <span className="flex items-center gap-2 text-white">
                <span className="w-2 h-2 rounded-full bg-[#88C0A4]" />
                <span>Local Database</span>
              </span>
              <span className="text-[#8A938C]">──────►</span>
              <span className="text-[#88C0A4]">Instant UI Update</span>
              <span className="text-[#8A938C]">──────►</span>
              <span className="text-[#94A3B8]">Cloud Reconciliation</span>
            </div>
          </div>

          {/* Bento Card 2: Voice Capture */}
          <div className="p-8 rounded-2xl bg-[#232629] border border-[#3B3E42] hover:border-[#88C0A4]/60 transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-[#88C0A4]/10 border border-[#88C0A4]/20 flex items-center justify-center text-[#88C0A4] mb-5">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 100-6 3 3 0 000 6z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Voice & AI Decomposition</h3>
              <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
                Speak complex thoughts naturally. Waycord extracts action items, due dates, and priorities using Gemini 3.5 Flash Lite, automatically breaking them into itemized milestones.
              </p>
            </div>
            <div className="mt-6 p-3 rounded-lg bg-[#191C1F] border border-[#33363A] text-[11px] font-mono text-[#88C0A4] flex items-center gap-2">
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 100-6 3 3 0 000 6z" />
              </svg>
              <span>"Finish chapter 4 and email advisor by 4pm" ➔ 2 tasks created</span>
            </div>
          </div>

          {/* Bento Card 3: RBAC & Workspaces */}
          <div className="p-8 rounded-2xl bg-[#232629] border border-[#3B3E42] hover:border-[#88C0A4]/60 transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-[#88C0A4]/10 border border-[#88C0A4]/20 flex items-center justify-center text-[#88C0A4] mb-5">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Team Channels & RBAC</h3>
              <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
                Group tasks into workspaces with weighted access control (Owner, Admin, Member). Eliminate clutter with strict 2-comment quota per update to stop meeting fatigue.
              </p>
            </div>
            <div className="mt-6 flex items-center gap-2 text-[10px] font-mono text-[#94A3B8]">
              <span className="px-2 py-0.5 rounded bg-[#191C1F] border border-[#33363A]">Owner (3)</span>
              <span className="px-2 py-0.5 rounded bg-[#191C1F] border border-[#33363A]">Admin (2)</span>
              <span className="px-2 py-0.5 rounded bg-[#191C1F] border border-[#33363A]">Member (1)</span>
            </div>
          </div>

          {/* Bento Card 4: Cryptographic Offline License: 2-column wide */}
          <div className="md:col-span-2 p-8 rounded-2xl bg-[#232629] border border-[#3B3E42] hover:border-[#88C0A4]/60 transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-[#88C0A4]/10 border border-[#88C0A4]/20 flex items-center justify-center text-[#88C0A4] mb-5">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Cryptographic Offline Pro Guarantee</h3>
              <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed max-w-xl">
                When you subscribe to Pro, an asymmetric cryptographic license token caches locally. Even if you work completely off-grid or in remote flights for weeks, your custom recurrence, unlimited devices, and advanced tools remain fully unlocked.
              </p>
            </div>
            <div className="mt-6 flex items-center justify-between p-3.5 rounded-xl bg-[#191C1F] border border-[#33363A] text-xs font-mono">
              <span className="text-[#8A938C]">Local Entitlement Token:</span>
              <span className="text-emerald-400 font-bold">STATUS: VERIFIED (PRO ACCESS)</span>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS / 3-STEP WORKFLOW */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto border-t border-[#3B3E42]">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="font-mono text-xs uppercase tracking-wider text-[#88C0A4] font-semibold">
            Simple Workflow
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#F8FAFC] mt-2 tracking-tight">
            From thought to execution in seconds.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-[#232629] border border-[#3B3E42]">
            <div className="text-3xl font-black text-[#88C0A4] font-mono mb-3">01</div>
            <h3 className="text-base font-bold text-white mb-2">Rapid Capture</h3>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Type or speak using the global ⌘K command bar. Add tasks without leaving your keyboard or active context.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#232629] border border-[#3B3E42]">
            <div className="text-3xl font-black text-[#88C0A4] font-mono mb-3">02</div>
            <h3 className="text-base font-bold text-white mb-2">Intelligent Structuring</h3>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              AI parses temporal dates, deadlines, tags, and automatically generates required subtasks.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#232629] border border-[#3B3E42]">
            <div className="text-3xl font-black text-[#88C0A4] font-mono mb-3">03</div>
            <h3 className="text-base font-bold text-white mb-2">Zero-Lag Execution</h3>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Work uninterrupted offline. Changes sync across all your phones, tablets, and computers seamlessly.
            </p>
          </div>
        </div>
      </section>

      {/* PRICING PLANS SECTION */}
      <section id="pricing" className="py-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto border-t border-[#3B3E42]">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="font-mono text-xs uppercase tracking-wider text-[#88C0A4] font-semibold">
            Predictable Pricing
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#F8FAFC] mt-2 tracking-tight">
            Transparent plans. Zero operational noise.
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-[#94A3B8]">
            Instant UPI & Cards in India, or Patreon globally. 5-day full money-back guarantee on Pro.
          </p>

          {/* Monthly / Annual Toggle */}
          <div className="mt-8 inline-flex items-center p-1 rounded-xl bg-[#272A2D] border border-[#3B3E42]">
            <button
              type="button"
              onClick={() => setBillingPeriod('monthly')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                billingPeriod === 'monthly'
                  ? 'bg-[#88C0A4] text-[#1E2124] shadow-sm'
                  : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              Monthly Billing
            </button>
            <button
              type="button"
              onClick={() => setBillingPeriod('annual')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                billingPeriod === 'annual'
                  ? 'bg-[#88C0A4] text-[#1E2124] shadow-sm'
                  : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              <span>Annual Billing</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 font-mono font-bold">
                SAVE 20%
              </span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          {/* Free Core Card */}
          <div className="p-8 rounded-2xl bg-[#232629] border border-[#3B3E42] flex flex-col justify-between hover:border-[#88C0A4]/40 transition">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-[#F8FAFC]">Free Core</h3>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#1E2124] text-[#94A3B8] border border-[#3B3E42]">
                  Starter
                </span>
              </div>
              <div className="mb-4">
                <span className="text-4xl font-extrabold text-[#F8FAFC]">₹0</span>
                <span className="text-xs text-[#94A3B8]"> / forever</span>
              </div>
              <p className="text-xs text-[#94A3B8] mb-6 leading-relaxed">
                Essential offline task management for students and individual builders.
              </p>
              <ul className="space-y-3.5 text-xs text-[#94A3B8]">
                <li className="flex items-center space-x-2.5">
                  <span className="text-[#88C0A4] font-bold">✓</span>
                  <span className="text-[#F8FAFC]">Unlimited local and synced tasks</span>
                </li>
                <li className="flex items-center space-x-2.5">
                  <span className="text-[#88C0A4] font-bold">✓</span>
                  <span>Basic recurrence patterns (daily/weekly)</span>
                </li>
                <li className="flex items-center space-x-2.5">
                  <span className="text-[#88C0A4] font-bold">✓</span>
                  <span>Sync across up to 2 active devices</span>
                </li>
                <li className="flex items-center space-x-2.5">
                  <span className="text-[#88C0A4] font-bold">✓</span>
                  <span>20 cloud voice captures per month</span>
                </li>
                <li className="flex items-center space-x-2.5">
                  <span className="text-[#88C0A4] font-bold">✓</span>
                  <span>Up to 2 shared workspaces (5 members each)</span>
                </li>
              </ul>
            </div>
            <a
              href="/app"
              className="mt-8 w-full py-3 rounded-xl bg-[#1E2124] border border-[#3B3E42] hover:border-[#88C0A4] text-[#F8FAFC] font-semibold text-xs text-center transition block"
            >
              Get Started Free
            </a>
          </div>

          {/* Waycord Pro Card (Highlighted) */}
          <div className="p-8 rounded-2xl bg-[#232629] border-2 border-[#88C0A4] relative flex flex-col justify-between shadow-xl shadow-[#88C0A4]/5">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-[#88C0A4] text-[#1E2124] font-mono text-[11px] font-extrabold uppercase tracking-wider shadow">
              Most Popular
            </div>
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-[#F8FAFC]">Waycord Pro</h3>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#88C0A4]/10 text-[#88C0A4] border border-[#88C0A4]/30">
                  5-Day Guarantee
                </span>
              </div>
              <div className="mb-4">
                <span className="text-4xl font-extrabold text-[#F8FAFC]">
                  {billingPeriod === 'monthly' ? '₹149' : '₹119'}
                </span>
                <span className="text-xs text-[#94A3B8]"> / month</span>
                <span className="text-[11px] text-[#94A3B8] block mt-1 font-mono">
                  {billingPeriod === 'monthly'
                    ? '(or $3.99/mo via Patreon)'
                    : 'Billed annually ₹1,428/yr ($38/yr via Patreon)'}
                </span>
              </div>
              <p className="text-xs text-[#94A3B8] mb-6 leading-relaxed">
                Maximum speed, voice breakdown, and unlimited multi-device sync for power users.
              </p>
              <ul className="space-y-3.5 text-xs text-[#F8FAFC]">
                <li className="flex items-center space-x-2.5">
                  <span className="text-[#88C0A4] font-bold">✓</span>
                  <span className="font-semibold">Full custom recurrence rules</span>
                </li>
                <li className="flex items-center space-x-2.5">
                  <span className="text-[#88C0A4] font-bold">✓</span>
                  <span className="font-semibold">Unlimited devices (Android, Web, Desktop)</span>
                </li>
                <li className="flex items-center space-x-2.5">
                  <span className="text-[#88C0A4] font-bold">✓</span>
                  <span>Unlimited voice capture & AI breakdown</span>
                </li>
                <li className="flex items-center space-x-2.5">
                  <span className="text-[#88C0A4] font-bold">✓</span>
                  <span>Unlimited workspaces (up to 15 members each)</span>
                </li>
                <li className="flex items-center space-x-2.5">
                  <span className="text-[#88C0A4] font-bold">✓</span>
                  <span>Cryptographic offline license guarantee</span>
                </li>
                <li className="flex items-center space-x-2.5">
                  <span className="text-[#88C0A4] font-bold">✓</span>
                  <span>30-day trash recovery & history</span>
                </li>
              </ul>
            </div>
            <Link
              to="/upgrade"
              search={{ plan: 'pro' }}
              className="mt-8 w-full py-3 rounded-xl bg-[#88C0A4] hover:bg-[#9ECBB5] text-[#1E2124] font-bold text-xs text-center transition active:scale-95 shadow-lg shadow-[#88C0A4]/15"
            >
              Upgrade to Pro (Instant UPI)
            </Link>
          </div>

          {/* Team / Campus Card */}
          <div className="p-8 rounded-2xl bg-[#232629] border border-[#3B3E42] flex flex-col justify-between hover:border-[#88C0A4]/40 transition">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-[#F8FAFC]">Team / Campus</h3>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#1E2124] text-[#94A3B8] border border-[#3B3E42]">
                  Groups
                </span>
              </div>
              <div className="mb-4">
                <span className="text-4xl font-extrabold text-[#F8FAFC]">
                  {billingPeriod === 'monthly' ? '₹249' : '₹199'}
                </span>
                <span className="text-xs text-[#94A3B8]"> / seat / mo</span>
              </div>
              <p className="text-xs text-[#94A3B8] mb-6 leading-relaxed">
                Centralized management for student labs, campus clubs, and engineering startups.
              </p>
              <ul className="space-y-3.5 text-xs text-[#94A3B8]">
                <li className="flex items-center space-x-2.5">
                  <span className="text-[#88C0A4] font-bold">✓</span>
                  <span className="text-[#F8FAFC]">Unlimited seats & workspaces</span>
                </li>
                <li className="flex items-center space-x-2.5">
                  <span className="text-[#88C0A4] font-bold">✓</span>
                  <span>Weighted team roles (Owners, Admins, Members)</span>
                </li>
                <li className="flex items-center space-x-2.5">
                  <span className="text-[#88C0A4] font-bold">✓</span>
                  <span>Consolidated team billing invoice</span>
                </li>
                <li className="flex items-center space-x-2.5">
                  <span className="text-[#88C0A4] font-bold">✓</span>
                  <span>Audit activity logs & role governance</span>
                </li>
                <li className="flex items-center space-x-2.5">
                  <span className="text-[#88C0A4] font-bold">✓</span>
                  <span>Priority onboarding & Discord support</span>
                </li>
              </ul>
            </div>
            <Link
              to="/upgrade"
              search={{ plan: 'team' }}
              className="mt-8 w-full py-3 rounded-xl bg-[#1E2124] border border-[#3B3E42] hover:border-[#88C0A4] text-[#F8FAFC] font-semibold text-xs text-center transition"
            >
              Deploy Team Workspace
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section id="faq" className="py-24 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto border-t border-[#3B3E42]">
        <div className="text-center mb-12">
          <span className="font-mono text-xs uppercase tracking-wider text-[#88C0A4] font-semibold">
            Common Questions
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#F8FAFC] mt-2 tracking-tight">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {faqItems.map((item, index) => {
            const isOpen = openFaq === index
            return (
              <div
                key={index}
                className="rounded-xl bg-[#232629] border border-[#3B3E42] overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between space-x-4 hover:bg-[#2A2D31] transition cursor-pointer"
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
                  <div className="px-4 pb-4 sm:px-5 sm:pb-5 text-xs text-[#94A3B8] leading-relaxed border-t border-[#33363A] pt-3">
                    {item.a}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </section>

      {/* PRE-FOOTER CTA SECTION */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center border-t border-[#3B3E42]">
        <div className="p-10 sm:p-14 rounded-3xl bg-gradient-to-b from-[#232629] to-[#191C1F] border border-[#3B3E42] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#88C0A4]/10 rounded-full blur-3xl -z-10" />
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Ready to organize at the speed of thought?
          </h2>
          <p className="mt-3 text-xs sm:text-sm text-[#94A3B8] max-w-lg mx-auto leading-relaxed">
            Join students, engineers, and focused builders coordinating their daily workflows offline and online.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="/app"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#88C0A4] text-[#1E2124] font-bold text-sm hover:bg-[#9ECBB5] transition active:scale-95 shadow-lg shadow-[#88C0A4]/20"
            >
              Get Started Free Now →
            </a>
            <a
              href="https://github.com/zedrock-coding/WayCord/releases/download/v0.7.1/Waycord-v0.7.1+29-Setup.exe"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#272A2D] border border-[#3B3E42] text-white font-semibold text-xs hover:border-[#88C0A4] transition flex items-center justify-center space-x-2"
            >
              <span>Download Windows (.exe)</span>
            </a>
            <a
              href="https://github.com/zedrock-coding/WayCord/releases/download/v0.7.1/waycord-v0.7.1.apk"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#272A2D] border border-[#3B3E42] text-white font-semibold text-xs hover:border-[#88C0A4] transition flex items-center justify-center space-x-2"
            >
              <span>Download Android (.apk)</span>
            </a>
          </div>
          <p className="mt-3 text-xs text-[#94A3B8]">
            If you want to download older versions,{' '}
            <a
              href="https://github.com/zedrock-coding/WayCord/releases"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#88C0A4] hover:underline font-medium"
            >
              go here
            </a>
            .
          </p>
        </div>
      </section>
    </div>
  )
}
