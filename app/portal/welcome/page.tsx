import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDate } from '@/lib/utils'

export const dynamic = 'force-dynamic'

async function getWelcomeDocuments(userId: string) {
  try {
    const client = await prisma.client.findUnique({
      where: { userId },
      include: {
        welcomeDocuments: { orderBy: { createdAt: 'desc' } },
      },
    })
    return client?.welcomeDocuments ?? []
  } catch {
    return []
  }
}

export default async function WelcomePage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const documents = await getWelcomeDocuments(session.user.id)

  return (
    <div>
      <PageHeader title="Welcome" description="Get started with your project" />

      {documents.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-sm text-white/30">Welcome document coming soon.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {documents.map((doc) => (
            <Card key={doc.id}>
              <CardHeader>
                <CardTitle>{doc.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-xs text-white/30">{formatDate(doc.createdAt)}</p>
                {doc.content && (
                  <div className="prose prose-invert max-w-none">
                    <div className="text-sm text-white/70 leading-relaxed whitespace-pre-wrap">
                      {doc.content}
                    </div>
                  </div>
                )}
                {doc.fileUrl && (
                  <a
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-white/50 hover:text-white underline"
                  >
                    View attached file
                  </a>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
