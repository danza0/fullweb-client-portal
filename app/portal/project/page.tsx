import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'

export const dynamic = 'force-dynamic'

async function getProjectData(userId: string) {
  try {
    const client = await prisma.client.findUnique({
      where: { userId },
      include: {
        projects: {
          include: {
            milestones: { orderBy: { order: 'asc' } },
            deliverables: { orderBy: { createdAt: 'desc' } },
          },
        },
      },
    })
    return client?.projects[0] ?? null
  } catch {
    return null
  }
}

const statusColors: Record<string, 'default' | 'success' | 'warning' | 'secondary' | 'destructive'> = {
  ACTIVE: 'default',
  PLANNING: 'secondary',
  ON_HOLD: 'warning',
  COMPLETED: 'success',
  CANCELLED: 'destructive',
}

export default async function ProjectPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const project = await getProjectData(session.user.id)

  if (!project) {
    return (
      <div>
        <PageHeader title="Project" />
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-sm text-white/30">No project assigned yet.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div>
      <PageHeader title="Project" description={project.name} />
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{project.name}</CardTitle>
              <Badge variant={statusColors[project.status] ?? 'secondary'}>
                {project.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {project.description && (
              <p className="text-sm text-white/60">{project.description}</p>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              {project.packageName && (
                <div>
                  <span className="text-white/40">Package</span>
                  <p className="text-white mt-0.5">{project.packageName}</p>
                </div>
              )}
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
              {project.kickoffDate && (
                <div>
                  <span className="text-white/40">Kickoff</span>
                  <p className="text-white mt-0.5">{formatDate(project.kickoffDate)}</p>
                </div>
              )}
            </div>
            {project.scope && (
              <div>
                <p className="text-xs text-white/40 mb-1">Scope</p>
                <p className="text-sm text-white/70 whitespace-pre-wrap">{project.scope}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {project.milestones.length > 0 && (
          <Card>
            <CardHeader><CardTitle>Milestones</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {project.milestones.map((milestone) => (
                  <div key={milestone.id} className="flex items-start gap-3 py-2 border-b border-white/[0.05] last:border-0">
                    <div className={`mt-0.5 h-2 w-2 rounded-full shrink-0 ${milestone.completed ? 'bg-white' : 'bg-white/20'}`} />
                    <div>
                      <p className={`text-sm ${milestone.completed ? 'text-white/60' : 'text-white'}`}>
                        {milestone.title}
                      </p>
                      {milestone.dueDate && (
                        <p className="text-xs text-white/30 mt-0.5">{formatDate(milestone.dueDate)}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
