import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDate } from '@/lib/utils'

export const dynamic = 'force-dynamic'

async function getUpdates(userId: string) {
  try {
    const client = await prisma.client.findUnique({
      where: { userId },
      include: {
        projects: {
          include: {
            updates: { orderBy: { createdAt: 'desc' } },
          },
        },
      },
    })
    return client?.projects[0]?.updates ?? []
  } catch {
    return []
  }
}

export default async function UpdatesPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const updates = await getUpdates(session.user.id)

  return (
    <div>
      <PageHeader title="Project Updates" description="Latest news from your team" />

      {updates.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-sm text-white/30">No updates yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {updates.map((update) => (
            <Card key={update.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-white text-sm">{update.title}</CardTitle>
                  <span className="text-[10px] text-white/30 shrink-0 ml-4">{formatDate(update.createdAt)}</span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-white/60 leading-relaxed whitespace-pre-wrap">{update.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
