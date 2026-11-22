import { Link } from '@tanstack/react-router'

export function WebNotFoundPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 bg-[#1E2124]">
      <div className="max-w-md w-full bg-[#191C1F] border border-[#404943] rounded-2xl p-8 sm:p-10 text-center shadow-2xl">
        <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        <h1 className="text-4xl font-extrabold text-[#F8FAFC] tracking-tight mb-2">404</h1>
        <h2 className="text-lg font-semibold text-[#C0C9C2] mb-3">Page Not Found</h2>
        <p className="text-xs sm:text-sm text-[#8A938C] leading-relaxed mb-6">
          The page you requested does not exist, has been removed, or requires administrator privileges.
        </p>

        <Link
          to="/"
          className="inline-flex items-center justify-center w-full px-5 py-2.5 rounded-lg bg-[#88C0A4] text-[#1E2124] font-bold text-sm hover:bg-[#9ECBB5] transition active:scale-95 shadow-lg shadow-[#88C0A4]/10"
        >
          Return to Workspace
        </Link>
      </div>
    </div>
  )
}
