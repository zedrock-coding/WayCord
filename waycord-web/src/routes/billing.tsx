import { createFileRoute, redirect } from '@tanstack/react-router'
import { z } from 'zod'

const billingSearchSchema = z.object({
  simulated_success: z.string().optional(),
  txn: z.string().optional(),
  plan: z.string().optional(),
  status: z.string().optional(),
})

export const Route = createFileRoute('/billing')({
  validateSearch: (search) => billingSearchSchema.parse(search),
  beforeLoad: ({ search }) => {
    throw redirect({
      to: '/account',
      search: {
        tab: 'billing',
        simulated_success: search.simulated_success,
        txn: search.txn,
        plan: search.plan,
        status: search.status,
      },
    })
  },
  component: () => null,
})
