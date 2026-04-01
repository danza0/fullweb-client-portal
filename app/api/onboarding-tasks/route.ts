import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const clientId = searchParams.get('clientId')
    const projectId = searchParams.get('projectId')

    const tasks = await prisma.onboardingTask.findMany({
      where: {
        ...(clientId ? { clientId } : {}),
        ...(projectId ? { projectId } : {}),
      },
      orderBy: { order: 'asc' },
    })

    return NextResponse.json(tasks)
  } catch (error) {
    console.error('GET /api/onboarding-tasks error:', error)
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
    const { clientId, projectId, title, description, order } = body

    if (!clientId || !title) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const task = await prisma.onboardingTask.create({
      data: {
        clientId,
        projectId: projectId || null,
        title,
        description: description || null,
        order: order ?? 0,
      },
    })

    return NextResponse.json(task, { status: 201 })
  } catch (error) {
    console.error('POST /api/onboarding-tasks error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
