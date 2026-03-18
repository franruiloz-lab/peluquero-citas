import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { parseTimeRanges, TimeRange } from '@/lib/slots'

export async function GET() {
  const schedules = await prisma.weeklySchedule.findMany({
    orderBy: { dayOfWeek: 'asc' },
  })

  // Devuelve siempre en el nuevo formato con timeRanges
  const result = schedules.map((s) => ({
    dayOfWeek: s.dayOfWeek,
    isActive: s.isActive,
    timeRanges: parseTimeRanges(s),
  }))

  return NextResponse.json(result)
}

export async function PUT(request: Request) {
  const days: { dayOfWeek: number; isActive: boolean; timeRanges: TimeRange[] }[] =
    await request.json()

  for (const day of days) {
    const timeRangesJson = JSON.stringify(day.timeRanges)
    // Guardamos el primer rango en startTime/endTime para compatibilidad con datos legacy
    const firstRange = day.timeRanges[0] ?? { start: '10:00', end: '18:00' }

    await prisma.weeklySchedule.upsert({
      where: { dayOfWeek: day.dayOfWeek },
      update: {
        isActive: day.isActive,
        timeRanges: timeRangesJson,
        startTime: firstRange.start,
        endTime: firstRange.end,
      },
      create: {
        dayOfWeek: day.dayOfWeek,
        isActive: day.isActive,
        timeRanges: timeRangesJson,
        startTime: firstRange.start,
        endTime: firstRange.end,
      },
    })
  }

  return NextResponse.json({ ok: true })
}
