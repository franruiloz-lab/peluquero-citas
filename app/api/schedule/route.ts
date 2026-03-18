import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  const schedules = await prisma.weeklySchedule.findMany({
    orderBy: { dayOfWeek: 'asc' },
  })
  return NextResponse.json(schedules)
}

export async function PUT(request: Request) {
  const days: { dayOfWeek: number; startTime: string; endTime: string; isActive: boolean }[] =
    await request.json()

  for (const day of days) {
    await prisma.weeklySchedule.upsert({
      where: { dayOfWeek: day.dayOfWeek },
      update: { startTime: day.startTime, endTime: day.endTime, isActive: day.isActive },
      create: {
        dayOfWeek: day.dayOfWeek,
        startTime: day.startTime,
        endTime: day.endTime,
        isActive: day.isActive,
      },
    })
  }

  return NextResponse.json({ ok: true })
}
