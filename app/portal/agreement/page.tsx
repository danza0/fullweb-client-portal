import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'
import { FileText, ExternalLink } from 'lucide-react'

export const dynamic = 'force-dynamic'

async function getAgreements(userId: string) {
  try {
    const client = await prisma.client.findUnique({
      where: { userId },
      include: {
        agreements: { orderBy: { createdAt: 'desc' } },
      },
    })
    return client?.agreements ?? []
  } catch {
    return []
  }
}

export default async function AgreementPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const agreements = await getAgreements(session.user.id)

  return (
    <div>
      <PageHeader title="Agreements" description="Your contracts and documents" />

      {agreements.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-sm text-white/30">No agreements yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {agreements.map((agreement) => (
            <Card key={agreement.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-white/40" />
                    <CardTitle className="text-white text-sm">{agreement.title}</CardTitle>
                  </div>
                  <Badge variant={agreement.status === 'SIGNED' ? 'success' : 'warning'}>
                    {agreement.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-white/40">Uploaded {formatDate(agreement.createdAt)}</p>
                {agreement.fileUrl && (
                  <a href={agreement.fileUrl} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm" className="gap-2">
                      <ExternalLink className="h-3.5 w-3.5" />
                      View Document
                    </Button>
                  </a>
                )}
                {agreement.status === 'PENDING' && (
                  <p className="text-xs text-white/50 bg-white/[0.03] border border-white/[0.07] rounded-md p-3">
                    This agreement is awaiting your signature. Please review the document and contact your account manager to proceed.
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
