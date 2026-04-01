import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDate, formatCurrency } from '@/lib/utils'
import { ExternalLink } from 'lucide-react'

export const dynamic = 'force-dynamic'

async function getInvoices(userId: string) {
  try {
    const client = await prisma.client.findUnique({
      where: { userId },
      include: {
        invoices: { orderBy: { createdAt: 'desc' } },
      },
    })
    return client?.invoices ?? []
  } catch {
    return []
  }
}

const statusColors: Record<string, 'default' | 'success' | 'warning' | 'destructive' | 'secondary'> = {
  PAID: 'success',
  UNPAID: 'warning',
  OVERDUE: 'destructive',
  PARTIALLY_PAID: 'secondary',
}

export default async function InvoicesPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const invoices = await getInvoices(session.user.id)
  const totalUnpaid = invoices
    .filter((i) => i.status !== 'PAID')
    .reduce((sum, i) => sum + i.amount, 0)

  return (
    <div>
      <PageHeader title="Invoices" description="Your billing history" />

      {invoices.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-sm text-white/30">No invoices yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {totalUnpaid > 0 && (
            <div className="p-4 rounded-lg border border-white/10 bg-white/[0.02]">
              <p className="text-xs text-white/40">Outstanding Balance</p>
              <p className="text-2xl font-semibold text-white mt-1">{formatCurrency(totalUnpaid)}</p>
            </div>
          )}

          <div className="space-y-2">
            {invoices.map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between p-4 rounded-lg border border-white/[0.07] bg-white/[0.02]">
                <div>
                  <p className="text-sm text-white">{invoice.description ?? 'Invoice'}</p>
                  <p className="text-xs text-white/40 mt-0.5">Due {formatDate(invoice.dueDate)}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-medium text-white">{formatCurrency(invoice.amount)}</p>
                    <Badge variant={statusColors[invoice.status] ?? 'secondary'} className="text-[10px] mt-0.5">
                      {invoice.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  {invoice.paymentLink && invoice.status !== 'PAID' && (
                    <a href={invoice.paymentLink} target="_blank" rel="noopener noreferrer">
                      <Button size="sm" className="text-xs">
                        Pay Now
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </Button>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
