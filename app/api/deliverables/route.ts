import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const projectId = searchParams.get('projectId')

    const deliverables = await prisma.deliverable.findMany({
      where: projectId ? { projectId } : undefined,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(deliverables)
  } catch (error) {
    console.error('GET /api/deliverables error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { projectId, title, description, fileUrl, fileName, fileType } = body

    if (!projectId || !title) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const deliverable = await prisma.deliverable.create({
      data: {
        projectId,
        title,
        description: description || null,
        fileUrl: fileUrl || null,
        fileName: fileName || null,
        fileType: fileType || null,
      },
    })

    return NextResponse.json(deliverable, { status: 201 })
  } catch (error) {
    console.error('POST /api/deliverables error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
