export function LandingSkeleton() {
  return (
    <div className="bg-[#1E2124] text-[#F8FAFC] min-h-screen">
      {/* Hero Skeleton */}
      <section className="pt-14 pb-14 sm:pt-16 sm:pb-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto text-center">
        {/* Title skeleton */}
        <div className="max-w-3xl mx-auto space-y-3">
          <div className="h-10 sm:h-14 bg-[#272A2D] rounded-lg animate-pulse w-4/5 mx-auto border border-[#3B3E42]/40" />
          <div className="h-10 sm:h-14 bg-[#272A2D] rounded-lg animate-pulse w-3/5 mx-auto border border-[#3B3E42]/40" />
        </div>

        {/* Subtitle skeleton */}
        <div className="mt-6 max-w-xl mx-auto space-y-2">
          <div className="h-4 bg-[#272A2D]/70 rounded animate-pulse w-full mx-auto" />
          <div className="h-4 bg-[#272A2D]/70 rounded animate-pulse w-4/6 mx-auto" />
        </div>

        {/* Action buttons skeleton */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <div className="w-full sm:w-44 h-12 bg-[#88C0A4]/20 border border-[#88C0A4]/30 rounded-lg animate-pulse" />
          <div className="w-full sm:w-48 h-12 bg-[#272A2D] border border-[#3B3E42] rounded-lg animate-pulse" />
          <div className="w-full sm:w-28 h-10 bg-[#272A2D]/50 rounded animate-pulse" />
        </div>
      </section>

      {/* Feature Highlights Skeleton */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto border-t border-[#3B3E42]">
        <div className="text-center max-w-md mx-auto mb-12 space-y-3">
          <div className="h-4 bg-[#88C0A4]/20 rounded animate-pulse w-28 mx-auto" />
          <div className="h-8 bg-[#272A2D] rounded-lg animate-pulse w-full" />
          <div className="h-3.5 bg-[#272A2D]/70 rounded animate-pulse w-3/4 mx-auto" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="p-6 rounded-xl bg-[#272A2D] border border-[#3B3E42] animate-pulse space-y-4"
            >
              <div className="w-11 h-11 rounded-lg bg-[#323538] border border-[#3B3E42]" />
              <div className="h-5 bg-[#323538] rounded w-1/2" />
              <div className="space-y-2">
                <div className="h-3.5 bg-[#323538]/70 rounded w-full" />
                <div className="h-3.5 bg-[#323538]/70 rounded w-5/6" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Comparison Table Skeleton */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto border-t border-[#3B3E42]">
        <div className="text-center max-w-md mx-auto mb-12 space-y-3">
          <div className="h-4 bg-[#88C0A4]/20 rounded animate-pulse w-24 mx-auto" />
          <div className="h-8 bg-[#272A2D] rounded-lg animate-pulse w-full" />
          <div className="h-3.5 bg-[#272A2D]/70 rounded animate-pulse w-2/3 mx-auto" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={`p-6 rounded-xl bg-[#272A2D] border ${
                i === 2 ? 'border-[#88C0A4]/50 ring-1 ring-[#88C0A4]/30' : 'border-[#3B3E42]'
              } flex flex-col justify-between animate-pulse space-y-6`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="h-5 bg-[#323538] rounded w-24" />
                  <div className="h-4 bg-[#323538] rounded w-14" />
                </div>
                <div className="h-10 bg-[#323538] rounded w-32" />
                <div className="h-3.5 bg-[#323538]/70 rounded w-full" />
                <div className="space-y-2 pt-4 border-t border-[#3B3E42]/60">
                  {[1, 2, 3, 4, 5].map((j) => (
                    <div key={j} className="h-3.5 bg-[#323538]/60 rounded w-4/5" />
                  ))}
                </div>
              </div>
              <div className="h-10 bg-[#323538] rounded-lg w-full" />
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
