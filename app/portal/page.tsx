import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { formatDate } from '@/lib/utils'
import { CheckCircle, Circle, FolderKanban } from 'lucide-react'

export const dynamic = 'force-dynamic'

async function getPortalData(userId: string) {
  try {
    const client = await prisma.client.findUnique({
      where: { userId },
      include: {
        projects: {
          include: {
            onboardingTasks: { orderBy: { order: 'asc' } },
            milestones: { orderBy: { order: 'asc' }, take: 4 },
            updates: { orderBy: { createdAt: 'desc' }, take: 3 },
          },
        },
        invoices: { orderBy: { createdAt: 'desc' }, take: 3 },
      },
    })
    return client
  } catch {
    return null
  }
}

export default async function PortalPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const client = await getPortalData(session.user.id)

  const project = client?.projects[0]
  const tasks = project?.onboardingTasks ?? []
  const completedTasks = tasks.filter((t) => t.completed).length
  const progress = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0

  return (
    <div>
      <PageHeader
        title={`Welcome back${client?.companyName ? `, ${client.companyName}` : ''}`}
        description="Here's an overview of your project."
      />

      <div className="space-y-6">
        {/* Project Card */}
        {project ? (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FolderKanban className="h-4 w-4" />
                  {project.name}
                </CardTitle>
                <Badge variant={project.status === 'ACTIVE' ? 'default' : 'secondary'}>
                  {project.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {project.description && (
                <p className="text-sm text-white/50">{project.description}</p>
              )}
              <div className="grid grid-cols-2 gap-4 text-xs">
                {project.startDate && (
                  <div>
                    <span className="text-white/40">Start Date</span>
                    <p className="text-white mt-0.5">{formatDate(project.startDate)}</p>
                  </div>
                )}
                {project.estimatedEndDate && (
                  <div>
                    <span className="text-white/40">Est. Completion</span>
                    <p className="text-white mt-0.5">{formatDate(project.estimatedEndDate)}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-sm text-white/30">No project assigned yet. Your account manager will set this up soon.</p>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Onboarding Progress */}
          {tasks.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Onboarding Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-white/50">{completedTasks} of {tasks.length} tasks completed</span>
                    <span className="text-xs text-white/70">{progress}%</span>
                  </div>
                  <Progress value={progress} />
                </div>
                <div className="space-y-2">
                  {tasks.slice(0, 5).map((task) => (
                    <div key={task.id} className="flex items-center gap-2.5">
                      {task.completed ? (
                        <CheckCircle className="h-3.5 w-3.5 text-white/60 shrink-0" />
                      ) : (
                        <Circle className="h-3.5 w-3.5 text-white/20 shrink-0" />
                      )}
                      <span className={`text-xs ${task.completed ? 'text-white/60 line-through' : 'text-white/80'}`}>
                        {task.title}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Updates */}
          {project && project.updates.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recent Updates</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {project.updates.map((update) => (
                  <div key={update.id} className="border-b border-white/[0.05] pb-3 last:border-0 last:pb-0">
                    <p className="text-xs font-medium text-white">{update.title}</p>
                    <p className="text-xs text-white/40 mt-1 line-clamp-2">{update.content}</p>
                    <p className="text-[10px] text-white/25 mt-1">{formatDate(update.createdAt)}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Invoices */}
        {client && client.invoices.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Invoices</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {client.invoices.map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between py-2 border-b border-white/[0.05] last:border-0">
                  <div>
                    <p className="text-xs text-white/70">{invoice.description ?? 'Invoice'}</p>
                    <p className="text-[10px] text-white/30">Due {formatDate(invoice.dueDate)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-white">${invoice.amount.toLocaleString()}</p>
                    <Badge
                      variant={invoice.status === 'PAID' ? 'success' : invoice.status === 'OVERDUE' ? 'destructive' : 'warning'}
                      className="text-[10px]"
                    >
                      {invoice.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
