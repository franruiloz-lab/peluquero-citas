import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { generateSlotsFromRanges, parseTimeRanges } from '@/lib/slots'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const date = searchParams.get('date')

  if (!date) {
    return NextResponse.json({ error: 'date requerida' }, { status: 400 })
  }

  // Check if date is blocked
  const blocked = await prisma.blockedDate.findUnique({ where: { date } })
  if (blocked) {
    return NextResponse.json([])
  }

  // Get day of week (0=Dom ... 6=Sáb)
  const [year, month, day] = date.split('-').map(Number)
  const dateObj = new Date(year, month - 1, day)
  const dayOfWeek = dateObj.getDay()

  // Get schedule for that day
  const schedule = await prisma.weeklySchedule.findUnique({ where: { dayOfWeek } })
  if (!schedule || !schedule.isActive) {
    return NextResponse.json([])
  }

  // Generate all slots from all time ranges
  const ranges = parseTimeRanges(schedule)
  const allSlots = generateSlotsFromRanges(ranges, 30)

  // Get booked slots for that date
  const booked = await prisma.appointment.findMany({
    where: { date, status: { not: 'cancelled' } },
    select: { time: true },
  })
  const bookedTimes = new Set(booked.map((a) => a.time))

  // Filter out booked and past slots
  const now = new Date()
  const available = allSlots.filter((slot) => {
    if (bookedTimes.has(slot)) return false
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
    if (date === today) {
      const [slotH, slotM] = slot.split(':').map(Number)
      const slotMinutes = slotH * 60 + slotM
      const nowMinutes = now.getHours() * 60 + now.getMinutes()
      if (slotMinutes <= nowMinutes) return false
    }
    return true
  })

  return NextResponse.json(available)
}
