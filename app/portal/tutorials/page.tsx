import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDate } from '@/lib/utils'
import { BookOpen } from 'lucide-react'

export const dynamic = 'force-dynamic'

async function getTutorials() {
  try {
    return await prisma.tutorialArticle.findMany({
      where: { published: true },
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    })
  } catch {
    return []
  }
}

export default async function TutorialsPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const tutorials = await getTutorials()

  return (
    <div>
      <PageHeader title="Tutorials" description="Resources to help you get started" />

      {tutorials.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-sm text-white/30">No tutorials yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {tutorials.map((tutorial) => (
            <Card key={tutorial.id}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <BookOpen className="h-4 w-4 text-white/30" />
                  <CardTitle className="text-white text-sm">{tutorial.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-white/30 mb-3">{formatDate(tutorial.createdAt)}</p>
                <div className="text-sm text-white/60 leading-relaxed whitespace-pre-wrap">
                  {tutorial.content}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
