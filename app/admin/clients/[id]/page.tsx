import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/db'
import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDate, formatCurrency } from '@/lib/utils'
import { ArrowLeft, ExternalLink } from 'lucide-react'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: { id: string }
}

async function getClientDetail(id: string) {
  try {
    return await prisma.client.findUnique({
      where: { id },
      include: {
        user: true,
        projects: {
          include: {
            milestones: { orderBy: { order: 'asc' } },
            onboardingTasks: { orderBy: { order: 'asc' } },
            updates: { orderBy: { createdAt: 'desc' }, take: 5 },
          },
        },
        invoices: { orderBy: { createdAt: 'desc' } },
        agreements: { orderBy: { createdAt: 'desc' } },
        welcomeDocuments: true,
        onboardingTasks: { orderBy: { order: 'asc' } },
      },
    })
  } catch {
    return null
  }
}

export default async function ClientDetailPage({ params }: PageProps) {
  const client = await getClientDetail(params.id)
  if (!client) notFound()

  const project = client.projects[0]
  const completedTasks = client.onboardingTasks.filter((t) => t.completed).length
  const totalTasks = client.onboardingTasks.length

  return (
    <div>
      <div className="mb-6">
        <Link href="/admin/clients">
          <Button variant="ghost" size="sm" className="gap-2 text-white/50 hover:text-white mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Clients
          </Button>
        </Link>
        <PageHeader
          title={client.companyName}
          description={`${client.contactName} · ${client.contactEmail}`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Client Info */}
        <Card>
          <CardHeader>
            <CardTitle>Client Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <InfoRow label="Status">
              <Badge variant={client.status === 'ACTIVE' ? 'default' : 'secondary'}>
                {client.status}
              </Badge>
            </InfoRow>
            <InfoRow label="Contact">{client.contactName}</InfoRow>
            <InfoRow label="Email">{client.contactEmail}</InfoRow>
            {client.phone && <InfoRow label="Phone">{client.phone}</InfoRow>}
            {client.website && (
              <InfoRow label="Website">
                <a href={client.website} target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-white flex items-center gap-1">
                  {client.website} <ExternalLink className="h-3 w-3" />
                </a>
              </InfoRow>
            )}
            <InfoRow label="Portal Login">{client.user.email}</InfoRow>
            <InfoRow label="Created">{formatDate(client.createdAt)}</InfoRow>
          </CardContent>
        </Card>

        {/* Project */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Project</CardTitle>
          </CardHeader>
          <CardContent>
            {!project ? (
              <p className="text-xs text-white/30">No project assigned yet</p>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-white">{project.name}</p>
                  <Badge variant={project.status === 'ACTIVE' ? 'default' : 'secondary'}>
                    {project.status}
                  </Badge>
                </div>
                {project.description && (
                  <p className="text-xs text-white/50">{project.description}</p>
                )}
                {project.startDate && (
                  <InfoRow label="Start Date">{formatDate(project.startDate)}</InfoRow>
                )}
                {project.estimatedEndDate && (
                  <InfoRow label="Est. End Date">{formatDate(project.estimatedEndDate)}</InfoRow>
                )}
                <InfoRow label="Milestones">
                  {project.milestones.filter((m) => m.completed).length}/{project.milestones.length} completed
                </InfoRow>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Invoices */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            {client.invoices.length === 0 ? (
              <p className="text-xs text-white/30">No invoices</p>
            ) : (
              <div className="space-y-2">
                {client.invoices.map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between py-2 border-b border-white/[0.05] last:border-0">
                    <div>
                      <p className="text-xs text-white/70">{invoice.description ?? 'Invoice'}</p>
                      <p className="text-[10px] text-white/30">Due {formatDate(invoice.dueDate)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-white">{formatCurrency(invoice.amount)}</p>
                      <Badge variant={invoice.status === 'PAID' ? 'success' : invoice.status === 'OVERDUE' ? 'destructive' : 'warning'} className="text-[10px]">
                        {invoice.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Onboarding Tasks */}
        <Card>
          <CardHeader>
            <CardTitle>Onboarding ({completedTasks}/{totalTasks})</CardTitle>
          </CardHeader>
          <CardContent>
            {client.onboardingTasks.length === 0 ? (
              <p className="text-xs text-white/30">No tasks</p>
            ) : (
              <div className="space-y-2">
                {client.onboardingTasks.map((task) => (
                  <div key={task.id} className="flex items-center gap-2">
                    <div className={`h-1.5 w-1.5 rounded-full ${task.completed ? 'bg-white' : 'bg-white/20'}`} />
                    <span className={`text-xs ${task.completed ? 'text-white/70' : 'text-white/40'}`}>
                      {task.title}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-xs text-white/40 shrink-0">{label}</span>
      <span className="text-xs text-white/80 text-right">{children}</span>
    </div>
  )
}
