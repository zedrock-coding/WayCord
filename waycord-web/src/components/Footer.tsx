import { Link } from '@tanstack/react-router'

export function Footer() {
  return (
    <footer className="w-full border-t border-[#3B3E42] bg-[#1E2124] text-[#94A3B8] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-base text-[#F8FAFC]">Waycord</span>
              <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-[#272A2D] text-[#88C0A4] border border-[#3B3E42]">
                Local-First
              </span>
            </div>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Instant local-first workspace and task coordination. Built to work smoothly offline
              and keep your personal workflows completely private.
            </p>
            <div className="text-[11px] text-[#94A3B8] flex items-center space-x-2 font-mono">
              <span className="inline-block w-2 h-2 rounded-full bg-[#88C0A4]"></span>
              <span>Encrypted Multi-Device Sync</span>
            </div>
          </div>

          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-wider text-[#F8FAFC] mb-3">
              Product
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="/#features" className="hover:text-[#88C0A4] transition">
                  Offline Task Engine
                </a>
              </li>
              <li>
                <a href="/#features" className="hover:text-[#88C0A4] transition">
                  Voice Task Capture & Audio Summaries
                </a>
              </li>
              <li>
                <a href="/#pricing" className="hover:text-[#88C0A4] transition">
                  Plans & Pricing
                </a>
              </li>
              <li>
                <Link to="/upgrade" className="hover:text-[#88C0A4] transition">
                  Upgrade to Pro
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-wider text-[#F8FAFC] mb-3">
              Account & Legal
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/billing" className="hover:text-[#88C0A4] transition">
                  Billing & Subscriptions
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-[#88C0A4] transition">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-[#88C0A4] transition">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/refund-policy" className="hover:text-[#88C0A4] transition">
                  Refund & Cancellation Policy
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-wider text-[#F8FAFC] mb-3">
              Security & Guarantees
            </h4>
            <p className="text-xs text-[#94A3B8] mb-2 leading-relaxed">
              Your tasks live on your hardware. Pro entitlements work uninterrupted even without internet.
            </p>
            <div className="text-[11px] text-[#94A3B8]">
              Instant UPI & RuPay support in India, plus global cards via Patreon.
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-[#3B3E42] flex flex-col sm:flex-row items-center justify-between text-xs text-[#94A3B8] gap-4">
          <div>
            © {new Date().getFullYear()} Waycord. All rights reserved.
          </div>
          <div className="flex space-x-6 text-xs">
            <Link to="/privacy" className="hover:text-[#F8FAFC]">
              Privacy
            </Link>
            <Link to="/terms" className="hover:text-[#F8FAFC]">
              Terms
            </Link>
            <Link to="/refund-policy" className="hover:text-[#F8FAFC]">
              5-Day Money-Back Guarantee
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
