import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { generateSlotsFromRanges, parseTimeRanges } from '@/lib/slots'

// Returns { "YYYY-MM-DD": number } — count of available slots per day
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const from = searchParams.get('from')
  const to = searchParams.get('to')

  if (!from || !to) {
    return NextResponse.json({ error: 'from y to requeridos' }, { status: 400 })
  }

  const [schedules, blockedDates, bookedAppointments] = await Promise.all([
    prisma.weeklySchedule.findMany({ where: { isActive: true } }),
    prisma.blockedDate.findMany({ where: { date: { gte: from, lte: to } } }),
    prisma.appointment.findMany({
      where: { date: { gte: from, lte: to }, status: { not: 'cancelled' } },
      select: { date: true, time: true },
    }),
  ])

  const blockedSet = new Set(blockedDates.map((b) => b.date))
  const scheduleMap = new Map(schedules.map((s) => [s.dayOfWeek, s]))

  // Group booked slots by date
  const bookedMap = new Map<string, Set<string>>()
  for (const apt of bookedAppointments) {
    if (!bookedMap.has(apt.date)) bookedMap.set(apt.date, new Set())
    bookedMap.get(apt.date)!.add(apt.time)
  }

  const result: Record<string, number> = {}
  const now = new Date()
  const todayYMD = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`

  // Iterate each day in range
  const [fromY, fromM, fromD] = from.split('-').map(Number)
  const [toY, toM, toD] = to.split('-').map(Number)
  const startDate = new Date(fromY, fromM - 1, fromD)
  const endDate = new Date(toY, toM - 1, toD)

  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const ymd = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

    if (blockedSet.has(ymd)) { result[ymd] = 0; continue }

    const schedule = scheduleMap.get(d.getDay())
    if (!schedule) { result[ymd] = 0; continue }

    const ranges = parseTimeRanges(schedule)
    const allSlots = generateSlotsFromRanges(ranges, 30)
    const booked = bookedMap.get(ymd) || new Set()

    const available = allSlots.filter((slot) => {
      if (booked.has(slot)) return false
      if (ymd === todayYMD) {
        const [slotH, slotM] = slot.split(':').map(Number)
        const slotMin = slotH * 60 + slotM
        const nowMin = now.getHours() * 60 + now.getMinutes()
        if (slotMin <= nowMin) return false
      }
      return true
    })

    result[ymd] = available.length
  }

  return NextResponse.json(result)
}
