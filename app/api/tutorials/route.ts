import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const tutorials = await prisma.tutorialArticle.findMany({
      where: session.user.role === 'ADMIN' ? undefined : { published: true },
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    })

    return NextResponse.json(tutorials)
  } catch (error) {
    console.error('GET /api/tutorials error:', error)
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
    const { title, slug, content, order, published } = body

    if (!title || !slug || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const tutorial = await prisma.tutorialArticle.create({
      data: {
        title,
        slug,
        content,
        order: order ?? 0,
        published: published ?? true,
      },
    })

    return NextResponse.json(tutorial, { status: 201 })
  } catch (error) {
    console.error('POST /api/tutorials error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
