import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

interface Params {
  params: { id: string }
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { completed, title, description, order } = body

    const task = await prisma.onboardingTask.update({
      where: { id: params.id },
      data: {
        ...(typeof completed === 'boolean' ? { completed } : {}),
        ...(title !== undefined ? { title } : {}),
        ...(description !== undefined ? { description: description || null } : {}),
        ...(order !== undefined ? { order } : {}),
      },
    })

    return NextResponse.json(task)
  } catch (error) {
    console.error('PUT /api/onboarding-tasks/[id] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
