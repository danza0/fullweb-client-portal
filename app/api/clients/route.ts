import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { hash } from 'bcryptjs'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const clients = await prisma.client.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        projects: {
          select: { id: true, name: true, status: true },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        user: { select: { email: true } },
      },
    })

    return NextResponse.json(clients)
  } catch (error) {
    console.error('GET /api/clients error:', error)
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
    const {
      companyName,
      contactName,
      contactEmail,
      phone,
      website,
      notes,
      status,
      userEmail,
      userName,
      userPassword,
    } = body

    if (!companyName || !contactName || !contactEmail) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (!userEmail || !userName || !userPassword) {
      return NextResponse.json({ error: 'Portal login details required' }, { status: 400 })
    }

    const existingUser = await prisma.user.findUnique({ where: { email: userEmail } })
    if (existingUser) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 400 })
    }

    const hashedPassword = await hash(userPassword, 12)

    const client = await prisma.client.create({
      data: {
        companyName,
        contactName,
        contactEmail,
        phone: phone || null,
        website: website || null,
        notes: notes || null,
        status: status ?? 'ACTIVE',
        user: {
          create: {
            email: userEmail,
            name: userName,
            password: hashedPassword,
            role: 'CLIENT',
          },
        },
      },
    })

    return NextResponse.json(client, { status: 201 })
  } catch (error) {
    console.error('POST /api/clients error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
