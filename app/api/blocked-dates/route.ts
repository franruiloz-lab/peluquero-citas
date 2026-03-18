import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  const blocked = await prisma.blockedDate.findMany({ orderBy: { date: 'asc' } })
  return NextResponse.json(blocked)
}

export async function POST(request: Request) {
  const { date, note } = await request.json()

  const blocked = await prisma.blockedDate.upsert({
    where: { date },
    update: { note: note || null },
    create: { date, note: note || null },
  })

  return NextResponse.json(blocked, { status: 201 })
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const date = searchParams.get('date')

  if (!date) {
    return NextResponse.json({ error: 'date requerida' }, { status: 400 })
  }

  await prisma.blockedDate.delete({ where: { date } })
  return NextResponse.json({ ok: true })
}
