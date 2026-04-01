import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'
import { FileText, Download } from 'lucide-react'

export const dynamic = 'force-dynamic'

async function getDeliverables(userId: string) {
  try {
    const client = await prisma.client.findUnique({
      where: { userId },
      include: {
        projects: {
          include: {
            deliverables: { orderBy: { createdAt: 'desc' } },
          },
        },
      },
    })
    return client?.projects[0]?.deliverables ?? []
  } catch {
    return []
  }
}

export default async function DeliverablesPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const deliverables = await getDeliverables(session.user.id)

  return (
    <div>
      <PageHeader title="Deliverables" description="Files and assets from your project" />

      {deliverables.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-sm text-white/30">No deliverables yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {deliverables.map((deliverable) => (
            <div key={deliverable.id} className="p-4 rounded-lg border border-white/[0.07] bg-white/[0.02]">
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-white/30 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{deliverable.title}</p>
                  {deliverable.description && (
                    <p className="text-xs text-white/40 mt-0.5">{deliverable.description}</p>
                  )}
                  {deliverable.fileName && (
                    <p className="text-[10px] text-white/30 mt-1">{deliverable.fileName}</p>
                  )}
                  <p className="text-[10px] text-white/20 mt-1">{formatDate(deliverable.createdAt)}</p>
                </div>
              </div>
              {deliverable.fileUrl && (
                <div className="mt-3">
                  <a href={deliverable.fileUrl} target="_blank" rel="noopener noreferrer" download={deliverable.fileName ?? undefined}>
                    <Button variant="outline" size="sm" className="gap-2 text-xs">
                      <Download className="h-3.5 w-3.5" />
                      Download
                    </Button>
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
