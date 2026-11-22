export function LandingSkeleton() {
  return (
    <div className="bg-[#1E2124] text-[#F8FAFC] min-h-screen selection:bg-[#88C0A4] selection:text-[#1E2124]">
      {/* Hero Skeleton */}
      <section className="pt-16 pb-16 sm:pt-24 sm:pb-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto text-center">
        {/* Eyebrow badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#272A2D] border border-[#3B3E42] mb-8 animate-pulse">
          <div className="w-2 h-2 rounded-full bg-[#88C0A4]/50" />
          <div className="h-3 w-32 bg-[#3B3E42] rounded" />
        </div>

        {/* Title skeleton */}
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="h-10 sm:h-16 bg-[#272A2D] rounded-xl animate-pulse w-4/5 mx-auto border border-[#3B3E42]/40" />
          <div className="h-10 sm:h-16 bg-[#272A2D] rounded-xl animate-pulse w-3/5 mx-auto border border-[#3B3E42]/40" />
        </div>

        {/* Subtitle skeleton */}
        <div className="mt-8 max-w-2xl mx-auto space-y-3">
          <div className="h-4 bg-[#272A2D]/70 rounded animate-pulse w-full mx-auto" />
          <div className="h-4 bg-[#272A2D]/70 rounded animate-pulse w-3/4 mx-auto" />
        </div>

        {/* Action buttons skeleton */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <div className="w-full sm:w-48 h-12 bg-[#88C0A4]/20 border border-[#88C0A4]/30 rounded-xl animate-pulse" />
          <div className="w-full sm:w-44 h-12 bg-[#272A2D] border border-[#3B3E42] rounded-xl animate-pulse" />
        </div>

        {/* Interactive App Mockup Skeleton */}
        <div className="mt-16 sm:mt-20 max-w-4xl mx-auto rounded-2xl bg-[#272A2D] border border-[#3B3E42] shadow-2xl overflow-hidden animate-pulse">
          <div className="h-10 bg-[#1E2124] border-b border-[#3B3E42] flex items-center px-4 gap-2">
            <div className="w-3 h-3 rounded-full bg-[#3B3E42]" />
            <div className="w-3 h-3 rounded-full bg-[#3B3E42]" />
            <div className="w-3 h-3 rounded-full bg-[#3B3E42]" />
            <div className="h-4 w-40 bg-[#272A2D] rounded mx-auto" />
          </div>
          <div className="p-6 sm:p-8 space-y-4">
            <div className="h-8 bg-[#323538] rounded-lg w-1/3" />
            <div className="space-y-3 pt-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-14 bg-[#1E2124] border border-[#3B3E42]/60 rounded-xl flex items-center px-4 justify-between">
                  <div className="flex items-center gap-3 w-2/3">
                    <div className="w-5 h-5 rounded bg-[#3B3E42]" />
                    <div className="h-4 bg-[#323538] rounded w-3/4" />
                  </div>
                  <div className="h-6 w-20 bg-[#323538] rounded-full" />
                </div>
              ))}
            </div>
            <div className="h-12 bg-[#1E2124] border border-[#3B3E42] rounded-xl mt-4" />
          </div>
        </div>
      </section>

      {/* Telemetry Metrics Strip Skeleton */}
      <section className="py-12 border-y border-[#3B3E42]/50 bg-[#272A2D]/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2 text-center animate-pulse">
              <div className="h-8 bg-[#323538] rounded w-20 mx-auto" />
              <div className="h-4 bg-[#323538]/70 rounded w-28 mx-auto" />
            </div>
          ))}
        </div>
      </section>

      {/* Bento Grid Architecture Skeleton */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <div className="h-4 bg-[#88C0A4]/20 rounded animate-pulse w-32 mx-auto" />
          <div className="h-10 bg-[#272A2D] rounded-xl animate-pulse w-3/4 mx-auto" />
          <div className="h-4 bg-[#272A2D]/70 rounded animate-pulse w-5/6 mx-auto" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 p-8 rounded-2xl bg-[#272A2D] border border-[#3B3E42] h-72 animate-pulse space-y-4">
            <div className="w-12 h-12 rounded-xl bg-[#323538]" />
            <div className="h-6 bg-[#323538] rounded w-1/3" />
            <div className="h-4 bg-[#323538]/70 rounded w-2/3" />
          </div>
          <div className="p-8 rounded-2xl bg-[#272A2D] border border-[#3B3E42] h-72 animate-pulse space-y-4">
            <div className="w-12 h-12 rounded-xl bg-[#323538]" />
            <div className="h-6 bg-[#323538] rounded w-1/2" />
            <div className="h-4 bg-[#323538]/70 rounded w-3/4" />
          </div>
          <div className="p-8 rounded-2xl bg-[#272A2D] border border-[#3B3E42] h-72 animate-pulse space-y-4">
            <div className="w-12 h-12 rounded-xl bg-[#323538]" />
            <div className="h-6 bg-[#323538] rounded w-1/2" />
            <div className="h-4 bg-[#323538]/70 rounded w-3/4" />
          </div>
          <div className="md:col-span-2 p-8 rounded-2xl bg-[#272A2D] border border-[#3B3E42] h-72 animate-pulse space-y-4">
            <div className="w-12 h-12 rounded-xl bg-[#323538]" />
            <div className="h-6 bg-[#323538] rounded w-1/3" />
            <div className="h-4 bg-[#323538]/70 rounded w-2/3" />
          </div>
        </div>
      </section>

      {/* Pricing Skeleton */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto border-t border-[#3B3E42]">
        <div className="text-center max-w-xl mx-auto mb-16 space-y-4">
          <div className="h-4 bg-[#88C0A4]/20 rounded animate-pulse w-28 mx-auto" />
          <div className="h-10 bg-[#272A2D] rounded-xl animate-pulse w-2/3 mx-auto" />
          <div className="h-4 bg-[#272A2D]/70 rounded animate-pulse w-4/5 mx-auto" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={`p-8 rounded-2xl bg-[#272A2D] border ${
                i === 2 ? 'border-[#88C0A4]/50 ring-1 ring-[#88C0A4]/30' : 'border-[#3B3E42]'
              } flex flex-col justify-between animate-pulse space-y-8`}
            >
              <div className="space-y-4">
                <div className="h-6 bg-[#323538] rounded w-24" />
                <div className="h-10 bg-[#323538] rounded w-36" />
                <div className="h-4 bg-[#323538]/70 rounded w-full" />
                <div className="space-y-2 pt-6 border-t border-[#3B3E42]/60">
                  {[1, 2, 3, 4, 5].map((j) => (
                    <div key={j} className="h-4 bg-[#323538]/60 rounded w-4/5" />
                  ))}
                </div>
              </div>
              <div className="h-12 bg-[#323538] rounded-xl w-full" />
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
