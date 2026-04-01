import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const [totalClients, activeProjects, unpaidInvoices, completedProjects, totalRevenue] =
      await Promise.all([
        prisma.client.count(),
        prisma.project.count({ where: { status: 'ACTIVE' } }),
        prisma.invoice.count({ where: { status: { in: ['UNPAID', 'OVERDUE'] } } }),
        prisma.project.count({ where: { status: 'COMPLETED' } }),
        prisma.invoice.aggregate({
          where: { status: 'PAID' },
          _sum: { amount: true },
        }),
      ])

    return NextResponse.json({
      totalClients,
      activeProjects,
      unpaidInvoices,
      completedProjects,
      totalRevenue: totalRevenue._sum.amount ?? 0,
    })
  } catch (error) {
    console.error('GET /api/admin/dashboard error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
