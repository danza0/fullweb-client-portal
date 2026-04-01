import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { PageHeader } from '@/components/shared/page-header'
import { StatsCard } from '@/components/shared/stats-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate, formatCurrency } from '@/lib/utils'
import { Users, FolderKanban, FileText, CheckCircle } from 'lucide-react'

export const dynamic = 'force-dynamic'

async function getDashboardStats() {
  try {
    const [totalClients, activeProjects, unpaidInvoices, completedProjects, recentActivity] =
      await Promise.all([
        prisma.client.count(),
        prisma.project.count({ where: { status: 'ACTIVE' } }),
        prisma.invoice.count({ where: { status: { in: ['UNPAID', 'OVERDUE'] } } }),
        prisma.project.count({ where: { status: 'COMPLETED' } }),
        prisma.activityLog.findMany({
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: { user: { select: { name: true } } },
        }),
      ])

    return { totalClients, activeProjects, unpaidInvoices, completedProjects, recentActivity }
  } catch {
    return {
      totalClients: 0,
      activeProjects: 0,
      unpaidInvoices: 0,
      completedProjects: 0,
      recentActivity: [],
    }
  }
}

async function getRecentClients() {
  try {
    return await prisma.client.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { projects: { take: 1, orderBy: { createdAt: 'desc' } } },
    })
  } catch {
    return []
  }
}

async function getRecentInvoices() {
  try {
    return await prisma.invoice.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { client: { select: { companyName: true } } },
    })
  } catch {
    return []
  }
}

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') redirect('/login')

  const [stats, recentClients, recentInvoices] = await Promise.all([
    getDashboardStats(),
    getRecentClients(),
    getRecentInvoices(),
  ])

  return (
    <div>
      <PageHeader
        title={`Good to see you, ${session.user.name?.split(' ')[0]}`}
        description="Here's what's happening with your clients."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatsCard
          title="Total Clients"
          value={stats.totalClients}
          icon={<Users className="h-4 w-4" />}
          delay={0}
        />
        <StatsCard
          title="Active Projects"
          value={stats.activeProjects}
          icon={<FolderKanban className="h-4 w-4" />}
          delay={0.1}
        />
        <StatsCard
          title="Unpaid Invoices"
          value={stats.unpaidInvoices}
          icon={<FileText className="h-4 w-4" />}
          delay={0.2}
        />
        <StatsCard
          title="Completed Projects"
          value={stats.completedProjects}
          icon={<CheckCircle className="h-4 w-4" />}
          delay={0.3}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Clients */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Clients</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentClients.length === 0 ? (
              <p className="text-xs text-white/30 py-4 text-center">No clients yet</p>
            ) : (
              recentClients.map((client) => (
                <div key={client.id} className="flex items-center justify-between py-2 border-b border-white/[0.05] last:border-0">
                  <div>
                    <p className="text-sm text-white">{client.companyName}</p>
                    <p className="text-xs text-white/40">{client.contactEmail}</p>
                  </div>
                  <Badge variant={client.status === 'ACTIVE' ? 'default' : 'secondary'}>
                    {client.status}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Recent Invoices */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Invoices</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentInvoices.length === 0 ? (
              <p className="text-xs text-white/30 py-4 text-center">No invoices yet</p>
            ) : (
              recentInvoices.map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between py-2 border-b border-white/[0.05] last:border-0">
                  <div>
                    <p className="text-sm text-white">{invoice.client.companyName}</p>
                    <p className="text-xs text-white/40">Due {formatDate(invoice.dueDate)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-white">{formatCurrency(invoice.amount)}</p>
                    <Badge
                      variant={
                        invoice.status === 'PAID'
                          ? 'success'
                          : invoice.status === 'OVERDUE'
                          ? 'destructive'
                          : 'warning'
                      }
                      className="text-[10px]"
                    >
                      {invoice.status}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
