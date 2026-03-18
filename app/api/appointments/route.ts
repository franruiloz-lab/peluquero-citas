import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const date = searchParams.get('date')
  const from = searchParams.get('from')

  let where = {}
  if (date) {
    where = { date }
  } else if (from) {
    where = { date: { gte: from } }
  }

  const appointments = await prisma.appointment.findMany({
    where,
    orderBy: [{ date: 'asc' }, { time: 'asc' }],
  })

  return NextResponse.json(appointments)
}

export async function POST(request: Request) {
  const body = await request.json()
  const { name, phone, date, time, notes } = body

  if (!name || !phone || !date || !time) {
    return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 })
  }

  // Check if slot is already taken
  const existing = await prisma.appointment.findFirst({
    where: { date, time, status: { not: 'cancelled' } },
  })
  if (existing) {
    return NextResponse.json({ error: 'Esa hora ya está reservada' }, { status: 409 })
  }

  const appointment = await prisma.appointment.create({
    data: { name, phone, date, time, notes: notes || null, status: 'confirmed' },
  })

  return NextResponse.json(appointment, { status: 201 })
}
