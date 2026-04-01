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

    const milestones = await prisma.milestone.findMany({
      where: projectId ? { projectId } : undefined,
      orderBy: { order: 'asc' },
    })

    return NextResponse.json(milestones)
  } catch (error) {
    console.error('GET /api/milestones error:', error)
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
    const { projectId, title, description, dueDate, completed, order } = body

    if (!projectId || !title) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const milestone = await prisma.milestone.create({
      data: {
        projectId,
        title,
        description: description || null,
        dueDate: dueDate ? new Date(dueDate) : null,
        completed: completed ?? false,
        order: order ?? 0,
      },
    })

    return NextResponse.json(milestone, { status: 201 })
  } catch (error) {
    console.error('POST /api/milestones error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
