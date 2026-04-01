import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent } from '@/components/ui/card'
import { formatDate } from '@/lib/utils'
import { CheckCircle, Circle } from 'lucide-react'

export const dynamic = 'force-dynamic'

async function getMilestones(userId: string) {
  try {
    const client = await prisma.client.findUnique({
      where: { userId },
      include: {
        projects: {
          include: {
            milestones: { orderBy: { order: 'asc' } },
          },
        },
      },
    })
    const project = client?.projects[0]
    return { project, milestones: project?.milestones ?? [] }
  } catch {
    return { project: null, milestones: [] }
  }
}

export default async function TimelinePage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const { milestones } = await getMilestones(session.user.id)

  return (
    <div>
      <PageHeader title="Timeline" description="Project milestones and progress" />

      {milestones.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-sm text-white/30">No milestones defined yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-4 top-0 bottom-0 w-px bg-white/10" />

          <div className="space-y-0">
            {milestones.map((milestone) => (
              <div key={milestone.id} className="relative flex gap-6 pb-8 last:pb-0">
                {/* Icon */}
                <div className="relative z-10 flex-shrink-0">
                  {milestone.completed ? (
                    <CheckCircle className="h-8 w-8 text-white bg-black rounded-full p-1" />
                  ) : (
                    <Circle className="h-8 w-8 text-white/20 bg-black rounded-full p-1" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 pt-1 pb-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className={`text-sm font-medium ${milestone.completed ? 'text-white/70' : 'text-white'}`}>
                        {milestone.title}
                      </p>
                      {milestone.description && (
                        <p className="text-xs text-white/40 mt-1">{milestone.description}</p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      {milestone.dueDate && (
                        <p className="text-xs text-white/30">{formatDate(milestone.dueDate)}</p>
                      )}
                      {milestone.completed && (
                        <p className="text-[10px] text-white/40 mt-0.5">Completed</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
