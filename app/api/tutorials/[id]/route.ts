import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

interface Params {
  params: Promise<{ id: string }>
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()
    const { title, slug, content, order, published } = body

    const tutorial = await prisma.tutorialArticle.update({
      where: { id },
      data: {
        title,
        slug,
        content,
        order: order ?? 0,
        published: published ?? true,
      },
    })

    return NextResponse.json(tutorial)
  } catch (error) {
    console.error('PUT /api/tutorials/[id] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    await prisma.tutorialArticle.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/tutorials/[id] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
