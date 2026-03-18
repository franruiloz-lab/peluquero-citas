export type TimeRange = { start: string; end: string }

export function generateSlotsFromRanges(ranges: TimeRange[], durationMin: number): string[] {
  const slots: string[] = []
  for (const range of ranges) {
    const [startH, startM] = range.start.split(':').map(Number)
    const [endH, endM] = range.end.split(':').map(Number)
    let current = startH * 60 + startM
    const end = endH * 60 + endM
    while (current + durationMin <= end) {
      const h = Math.floor(current / 60).toString().padStart(2, '0')
      const m = (current % 60).toString().padStart(2, '0')
      slots.push(`${h}:${m}`)
      current += durationMin
    }
  }
  return slots
}

/** Devuelve las franjas de un registro de horario semanal.
 *  Si tiene `timeRanges` (JSON), lo parsea.
 *  Si no, convierte startTime/endTime al nuevo formato como fallback. */
export function parseTimeRanges(schedule: {
  timeRanges?: string | null
  startTime?: string | null
  endTime?: string | null
}): TimeRange[] {
  if (schedule.timeRanges) {
    try {
      const parsed = JSON.parse(schedule.timeRanges)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    } catch {
      // fall through
    }
  }
  if (schedule.startTime && schedule.endTime) {
    return [{ start: schedule.startTime, end: schedule.endTime }]
  }
  return [{ start: '10:00', end: '18:00' }]
}
