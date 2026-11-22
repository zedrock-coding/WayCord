import { createFileRoute, redirect } from '@tanstack/react-router'
import { verifyAdminUser } from '../lib/server/adminGuard'
import { createServerFn } from '@tanstack/react-start'
import { AdminConsoleModal } from '../components/AdminConsoleModal'

const checkAdminAccess = createServerFn({ method: 'GET' }).handler(async () => {
  const result = await verifyAdminUser()
  return result
})

export const Route = createFileRoute('/admin')({
  beforeLoad: async () => {
    const auth = await checkAdminAccess()
    if (!auth.isAdmin) {
      // Strictly prevent unauthorized access or enumeration
      throw redirect({ to: '/' })
    }
  },
  head: () => ({
    meta: [
      { title: 'Waycord — Operator Console' },
      { name: 'robots', content: 'noindex, nofollow' },
    ],
  }),
  component: AdminRouteComponent,
})

function AdminRouteComponent() {
  return (
    <div className="min-h-screen bg-[#1A1C1E]">
      <AdminConsoleModal
        isOpen={true}
        onClose={() => {
          if (typeof window !== 'undefined') {
            window.location.href = '/'
          }
        }}
      />
    </div>
  )
}
