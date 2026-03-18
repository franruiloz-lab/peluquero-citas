'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AdminNav } from '../dashboard/page'
import { TimeRange } from '@/lib/slots'

const DAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

type DaySchedule = {
  dayOfWeek: number
  isActive: boolean
  timeRanges: TimeRange[]
}

type BlockedDate = {
  id: number
  date: string
  note: string | null
}

const DEFAULT_SCHEDULE: DaySchedule[] = DAYS.map((_, i) => ({
  dayOfWeek: i,
  isActive: false,
  timeRanges: [{ start: '10:00', end: '18:00' }],
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

  function toggleDay(dayOfWeek: number) {
    setSchedule((prev) =>
      prev.map((d) => (d.dayOfWeek === dayOfWeek ? { ...d, isActive: !d.isActive } : d))
    )
  }

  function updateRange(dayOfWeek: number, idx: number, field: 'start' | 'end', value: string) {
    setSchedule((prev) =>
      prev.map((d) => {
        if (d.dayOfWeek !== dayOfWeek) return d
        const ranges = d.timeRanges.map((r, i) => (i === idx ? { ...r, [field]: value } : r))
        return { ...d, timeRanges: ranges }
      })
    )
  }

  function addRange(dayOfWeek: number) {
    setSchedule((prev) =>
      prev.map((d) => {
        if (d.dayOfWeek !== dayOfWeek) return d
        return { ...d, timeRanges: [...d.timeRanges, { start: '16:00', end: '20:00' }] }
      })
    )
  }

  function removeRange(dayOfWeek: number, idx: number) {
    setSchedule((prev) =>
      prev.map((d) => {
        if (d.dayOfWeek !== dayOfWeek) return d
        return { ...d, timeRanges: d.timeRanges.filter((_, i) => i !== idx) }
      })
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
      setBlocked((prev) =>
        [...prev.filter((b) => b.date !== data.date), data].sort((a, b) =>
          a.date.localeCompare(b.date)
        )
      )
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
    <div style={{ minHeight: '100vh', background: 'var(--background)', color: 'var(--foreground)' }}>
      <AdminNav active="horario" onLogout={handleLogout} />
      <main style={{ maxWidth: 720, margin: '0 auto', padding: '40px 16px 80px' }}>

        {/* Horario semanal */}
        <section style={{ marginBottom: 48 }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: 24, flexWrap: 'wrap', gap: 12,
          }}>
            <div>
              <h1 style={{
                fontFamily: 'var(--font-playfair)', fontSize: 28, fontWeight: 700,
                margin: '0 0 4px', color: 'var(--foreground)',
              }}>
                Horario semanal
              </h1>
              <p style={{ color: 'var(--muted)', fontSize: 13, margin: 0 }}>
                Activa los días y define las franjas horarias
              </p>
            </div>
            <button
              onClick={saveSchedule}
              disabled={saving}
              style={{
                padding: '10px 22px',
                background: saved
                  ? 'rgba(40,180,100,0.1)'
                  : saving
                  ? 'var(--border)'
                  : 'linear-gradient(135deg, var(--gold), var(--gold-light))',
                color: saved ? '#5dbe8a' : saving ? 'var(--muted)' : '#0a0a0a',
                border: saved ? '1px solid rgba(40,180,100,0.3)' : 'none',
                borderRadius: 8, fontSize: 13, fontWeight: 700,
                letterSpacing: '0.08em', textTransform: 'uppercase',
                cursor: saving ? 'not-allowed' : 'pointer',
                transition: 'opacity 0.15s', whiteSpace: 'nowrap',
              }}
            >
              {saving ? 'Guardando...' : saved ? '✓ Guardado' : 'Guardar cambios'}
            </button>
          </div>

          <div style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 16, overflow: 'hidden',
          }}>
            {schedule.map((day, i) => (
              <div
                key={day.dayOfWeek}
                style={{
                  padding: '16px 20px',
                  borderBottom: i < schedule.length - 1 ? '1px solid var(--border)' : 'none',
                  background: day.isActive ? 'rgba(196,148,58,0.03)' : 'transparent',
                  transition: 'background 0.15s',
                }}
              >
                {/* Fila cabecera: toggle + nombre del día + botón añadir franja */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  marginBottom: day.isActive ? 12 : 0,
                }}>
                  <button
                    onClick={() => toggleDay(day.dayOfWeek)}
                    style={{
                      width: 44, height: 24, borderRadius: 12,
                      background: day.isActive ? 'var(--gold)' : 'var(--border)',
                      border: 'none', cursor: 'pointer', position: 'relative',
                      flexShrink: 0, transition: 'background 0.2s', padding: 0,
                    }}
                  >
                    <span style={{
                      position: 'absolute', top: 3,
                      left: day.isActive ? 22 : 3,
                      width: 18, height: 18, borderRadius: '50%',
                      background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                      transition: 'left 0.2s',
                    }} />
                  </button>

                  <span style={{
                    flex: 1, fontSize: 14,
                    fontWeight: day.isActive ? 600 : 400,
                    color: day.isActive ? 'var(--foreground)' : 'var(--muted)',
                  }}>
                    {DAYS[day.dayOfWeek]}
                  </span>

                  {day.isActive && (
                    <button
                      onClick={() => addRange(day.dayOfWeek)}
                      style={{
                        background: 'none', border: '1px solid rgba(196,148,58,0.4)',
                        borderRadius: 6, color: 'var(--gold)', fontSize: 11,
                        fontWeight: 700, letterSpacing: '0.08em', padding: '4px 10px',
                        cursor: 'pointer', whiteSpace: 'nowrap',
                        transition: 'border-color 0.15s, background 0.15s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(196,148,58,0.1)'
                        e.currentTarget.style.borderColor = 'var(--gold)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'none'
                        e.currentTarget.style.borderColor = 'rgba(196,148,58,0.4)'
                      }}
                    >
                      + Franja
                    </button>
                  )}
                </div>

                {/* Franjas horarias */}
                {day.isActive && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingLeft: 58 }}>
                    {day.timeRanges.map((range, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <input
                          type="time"
                          value={range.start}
                          onChange={(e) => updateRange(day.dayOfWeek, idx, 'start', e.target.value)}
                          style={timeInputStyle}
                          onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--gold)' }}
                          onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)' }}
                        />
                        <span style={{ color: 'var(--muted)', fontSize: 12, letterSpacing: '0.05em' }}>—</span>
                        <input
                          type="time"
                          value={range.end}
                          onChange={(e) => updateRange(day.dayOfWeek, idx, 'end', e.target.value)}
                          style={timeInputStyle}
                          onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--gold)' }}
                          onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)' }}
                        />
                        {day.timeRanges.length > 1 && (
                          <button
                            onClick={() => removeRange(day.dayOfWeek, idx)}
                            style={{
                              background: 'none', border: 'none', color: 'var(--muted)',
                              fontSize: 12, cursor: 'pointer', padding: '4px 6px',
                              borderRadius: 6, transition: 'color 0.15s',
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.color = '#e07070' }}
                            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--muted)' }}
                          >
                            Quitar
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Días bloqueados */}
        <section>
          <div style={{ marginBottom: 24 }}>
            <h2 style={{
              fontFamily: 'var(--font-playfair)', fontSize: 22, fontWeight: 700,
              margin: '0 0 4px', color: 'var(--foreground)',
            }}>
              Días bloqueados
            </h2>
            <p style={{ color: 'var(--muted)', fontSize: 13, margin: 0 }}>
              Festivos, vacaciones o cualquier día sin disponibilidad
            </p>
          </div>

          <div style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 16, padding: '20px 16px',
          }}>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
              <input
                type="date"
                value={newBlockDate}
                onChange={(e) => setNewBlockDate(e.target.value)}
                style={{ ...timeInputStyle, padding: '10px 14px' }}
                onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--gold)' }}
                onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)' }}
              />
              <input
                type="text"
                value={newBlockNote}
                onChange={(e) => setNewBlockNote(e.target.value)}
                placeholder="Motivo (opcional)"
                style={{ ...timeInputStyle, flex: 1, minWidth: 140, padding: '10px 14px' }}
                onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--gold)' }}
                onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)' }}
              />
              <button
                onClick={addBlockedDate}
                disabled={!newBlockDate}
                style={{
                  padding: '10px 20px',
                  background: newBlockDate
                    ? 'linear-gradient(135deg, var(--gold), var(--gold-light))'
                    : 'var(--border)',
                  color: newBlockDate ? '#0a0a0a' : 'var(--muted)',
                  border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700,
                  cursor: newBlockDate ? 'pointer' : 'not-allowed',
                  letterSpacing: '0.06em', whiteSpace: 'nowrap',
                }}
              >
                Añadir
              </button>
            </div>

            <div style={{ height: 1, background: 'var(--border)', marginBottom: 16 }} />

            {blocked.length === 0 ? (
              <p style={{ color: 'var(--muted)', fontSize: 13 }}>No hay días bloqueados.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {blocked.map((b) => (
                  <div
                    key={b.id}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '11px 16px', background: '#0a0a0a',
                      border: '1px solid var(--border)', borderRadius: 10,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--foreground)' }}>
                        {b.date}
                      </span>
                      {b.note && (
                        <span style={{ fontSize: 12, color: 'var(--muted)', fontStyle: 'italic' }}>
                          — {b.note}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => removeBlockedDate(b.date)}
                      style={{
                        background: 'none', border: 'none', color: 'var(--muted)',
                        fontSize: 12, cursor: 'pointer', padding: '4px 8px',
                        borderRadius: 6, transition: 'color 0.15s', letterSpacing: '0.05em',
                        flexShrink: 0,
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = '#e07070' }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--muted)' }}
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

const timeInputStyle: React.CSSProperties = {
  background: '#0a0a0a',
  border: '1px solid var(--border)',
  borderRadius: 8,
  padding: '8px 12px',
  color: 'var(--foreground)',
  fontSize: 13,
  outline: 'none',
  transition: 'border-color 0.15s',
  cursor: 'pointer',
}
