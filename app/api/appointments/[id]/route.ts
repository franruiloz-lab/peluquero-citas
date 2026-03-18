import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()

  const appointment = await prisma.appointment.update({
    where: { id: parseInt(id) },
    data: body,
  })

  return NextResponse.json(appointment)
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  await prisma.appointment.delete({
    where: { id: parseInt(id) },
  })

  return NextResponse.json({ ok: true })
}
