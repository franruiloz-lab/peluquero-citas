'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const DAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

type DaySchedule = {
  dayOfWeek: number
  startTime: string
  endTime: string
  isActive: boolean
}

type BlockedDate = {
  id: number
  date: string
  note: string | null
}

const DEFAULT_SCHEDULE: DaySchedule[] = DAYS.map((_, i) => ({
  dayOfWeek: i,
  startTime: '10:00',
  endTime: '18:00',
  isActive: false,
}))

export default function HorarioPage() {
  const router = useRouter()
  const [schedule, setSchedule] = useState<DaySchedule[]>(DEFAULT_SCHEDULE)
  const [blocked, setBlocked] = useState<BlockedDate[]>([])
  const [newBlockDate, setNewBlockDate] = useState('')
  const [newBlockNote, setNewBlockNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch('/api/schedule')
      .then((r) => r.json())
      .then((data: DaySchedule[]) => {
        if (data.length > 0) {
          const merged = DEFAULT_SCHEDULE.map((def) => {
            const found = data.find((d) => d.dayOfWeek === def.dayOfWeek)
            return found || def
          })
          setSchedule(merged)
        }
      })

    fetch('/api/blocked-dates')
      .then((r) => r.json())
      .then(setBlocked)
  }, [])

  function updateDay(dayOfWeek: number, field: keyof DaySchedule, value: string | boolean) {
    setSchedule((prev) =>
      prev.map((d) => (d.dayOfWeek === dayOfWeek ? { ...d, [field]: value } : d))
    )
  }

  async function saveSchedule() {
    setSaving(true)
    await fetch('/api/schedule', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(schedule),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  async function addBlockedDate() {
    if (!newBlockDate) return
    const res = await fetch('/api/blocked-dates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: newBlockDate, note: newBlockNote }),
    })
    if (res.ok) {
      const data = await res.json()
      setBlocked((prev) => [...prev.filter((b) => b.date !== data.date), data].sort((a, b) => a.date.localeCompare(b.date)))
      setNewBlockDate('')
      setNewBlockNote('')
    }
  }

  async function removeBlockedDate(date: string) {
    await fetch(`/api/blocked-dates?date=${date}`, { method: 'DELETE' })
    setBlocked((prev) => prev.filter((b) => b.date !== date))
  }

  async function handleLogout() {
    await fetch('/api/logout', { method: 'POST' })
    router.push('/admin')
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Nav */}
      <nav className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-1 text-lg font-bold text-white">
            <span>✂️</span>
            <span className="ml-1">Fran Peluquero</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/admin/dashboard" className="text-gray-400 hover:text-white text-sm">
              Citas
            </Link>
            <Link href="/admin/horario" className="text-emerald-400 text-sm font-medium">
              Horario
            </Link>
            <button
              onClick={handleLogout}
              className="text-gray-400 hover:text-red-400 text-sm transition-colors"
            >
              Salir
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-8">

        {/* Weekly schedule */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">Horario semanal</h2>
            <button
              onClick={saveSchedule}
              disabled={saving}
              className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
            >
              {saving ? 'Guardando...' : saved ? '¡Guardado!' : 'Guardar cambios'}
            </button>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-2xl divide-y divide-gray-700">
            {schedule.map((day) => (
              <div key={day.dayOfWeek} className="px-5 py-4 flex items-center gap-4">
                {/* Toggle */}
                <button
                  onClick={() => updateDay(day.dayOfWeek, 'isActive', !day.isActive)}
                  className={`w-11 h-6 rounded-full transition-colors flex-shrink-0 relative ${
                    day.isActive ? 'bg-emerald-600' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${
                      day.isActive ? 'left-[22px]' : 'left-0.5'
                    }`}
                  />
                </button>

                {/* Day name */}
                <span
                  className={`w-24 text-sm font-medium ${
                    day.isActive ? 'text-white' : 'text-gray-500'
                  }`}
                >
                  {DAYS[day.dayOfWeek]}
                </span>

                {/* Times */}
                <div className={`flex items-center gap-2 flex-1 ${!day.isActive ? 'opacity-40' : ''}`}>
                  <input
                    type="time"
                    value={day.startTime}
                    onChange={(e) => updateDay(day.dayOfWeek, 'startTime', e.target.value)}
                    disabled={!day.isActive}
                    className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:cursor-not-allowed"
                  />
                  <span className="text-gray-500 text-sm">hasta</span>
                  <input
                    type="time"
                    value={day.endTime}
                    onChange={(e) => updateDay(day.dayOfWeek, 'endTime', e.target.value)}
                    disabled={!day.isActive}
                    className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:cursor-not-allowed"
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Blocked dates */}
        <section>
          <h2 className="text-lg font-bold mb-4">Días bloqueados</h2>
          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-5 space-y-4">
            {/* Add new blocked date */}
            <div className="flex gap-2 flex-wrap">
              <input
                type="date"
                value={newBlockDate}
                onChange={(e) => setNewBlockDate(e.target.value)}
                className="bg-gray-700 border border-gray-600 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <input
                type="text"
                value={newBlockNote}
                onChange={(e) => setNewBlockNote(e.target.value)}
                placeholder="Motivo (opcional)"
                className="flex-1 min-w-32 bg-gray-700 border border-gray-600 rounded-xl px-4 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                onClick={addBlockedDate}
                disabled={!newBlockDate}
                className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
              >
                Añadir
              </button>
            </div>

            {/* List */}
            {blocked.length === 0 ? (
              <p className="text-gray-500 text-sm">No hay días bloqueados.</p>
            ) : (
              <div className="space-y-2">
                {blocked.map((b) => (
                  <div
                    key={b.id}
                    className="flex items-center justify-between bg-gray-700 rounded-xl px-4 py-2.5"
                  >
                    <div>
                      <span className="text-white text-sm font-medium">{b.date}</span>
                      {b.note && <span className="text-gray-400 text-xs ml-2">— {b.note}</span>}
                    </div>
                    <button
                      onClick={() => removeBlockedDate(b.date)}
                      className="text-red-400 hover:text-red-300 text-sm font-medium transition-colors"
                    >
                      Quitar
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}
