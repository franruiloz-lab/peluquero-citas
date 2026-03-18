'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type Appointment = {
  id: number
  name: string
  phone: string
  date: string
  time: string
  status: string
  notes: string | null
}

type GroupedDay = {
  date: string
  label: string
  isToday: boolean
  isTomorrow: boolean
  appointments: Appointment[]
}


const DAYS_LONG = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
const MONTHS_SHORT = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

function toYMD(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function formatDayLabel(ymd: string, isToday: boolean, isTomorrow: boolean): string {
  const [year, month, day] = ymd.split('-').map(Number)
  const d = new Date(year, month - 1, day)
  const weekday = DAYS_LONG[d.getDay()]
  const label = `${weekday}, ${day} ${MONTHS_SHORT[month - 1]} ${year}`
  if (isToday) return `Hoy · ${label}`
  if (isTomorrow) return `Mañana · ${label}`
  return label
}

function groupByDay(appointments: Appointment[], today: string, tomorrow: string): GroupedDay[] {
  const map = new Map<string, Appointment[]>()
  for (const apt of appointments) {
    if (!map.has(apt.date)) map.set(apt.date, [])
    map.get(apt.date)!.push(apt)
  }
  return Array.from(map.entries()).map(([date, apts]) => ({
    date,
    label: formatDayLabel(date, date === today, date === tomorrow),
    isToday: date === today,
    isTomorrow: date === tomorrow,
    appointments: apts,
  }))
}

export default function DashboardPage() {
  const router = useRouter()
  const today = toYMD(new Date())
  const tomorrow = toYMD(new Date(Date.now() + 86400000))

  const [filterDate, setFilterDate] = useState('')
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)

  const fetchAppointments = useCallback(async () => {
    setLoading(true)
    const url = filterDate
      ? `/api/appointments?date=${filterDate}`
      : `/api/appointments?from=${today}`
    const res = await fetch(url)
    const data = await res.json()
    setAppointments(data)
    setLoading(false)
  }, [filterDate, today])

  useEffect(() => { fetchAppointments() }, [fetchAppointments])

  async function deleteAppointment(id: number) {
    if (!confirm('¿Eliminar esta cita?')) return
    await fetch(`/api/appointments/${id}`, { method: 'DELETE' })
    fetchAppointments()
  }

  async function handleLogout() {
    await fetch('/api/logout', { method: 'POST' })
    router.push('/admin')
  }

  const groups = groupByDay(appointments, today, tomorrow)
  const total = appointments.length

  return (
    <div style={{ minHeight: '100vh', background: 'var(--background)', color: 'var(--foreground)' }}>
      <AdminNav active="dashboard" onLogout={handleLogout} />

      <main style={{ maxWidth: 720, margin: '0 auto', padding: '40px 24px 80px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 28, flexWrap: 'wrap' }}>
          <div>
            <h1 style={{
              fontFamily: 'var(--font-playfair)',
              fontSize: 28,
              fontWeight: 700,
              margin: '0 0 6px',
              color: 'var(--foreground)',
            }}>
              Próximas citas
            </h1>
            <p style={{ color: 'var(--muted)', fontSize: 13, margin: 0 }}>
              {filterDate
                ? `Mostrando el día ${filterDate}`
                : total === 0
                ? 'No hay citas próximas'
                : <><span style={{ color: 'var(--foreground)' }}>{total}</span> citas</>
              }
            </p>
          </div>

          {/* Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                padding: '9px 13px',
                color: filterDate ? 'var(--foreground)' : 'var(--muted)',
                fontSize: 13,
                outline: 'none',
                cursor: 'pointer',
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--gold)' }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)' }}
            />
            {filterDate && (
              <button
                onClick={() => setFilterDate('')}
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  padding: '9px 13px',
                  color: 'var(--muted)',
                  fontSize: 12,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  letterSpacing: '0.04em',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--foreground)' }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--muted)' }}
              >
                Ver todo
              </button>
            )}
          </div>
        </div>

        <div style={{ height: 1, background: 'var(--border)', marginBottom: 32 }} />

        {/* Content */}
        {loading ? (
          <p style={{ color: 'var(--muted)', fontSize: 14 }}>Cargando...</p>
        ) : groups.length === 0 ? (
          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 16,
            padding: '56px 24px',
            textAlign: 'center',
            color: 'var(--muted)',
          }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>📭</div>
            <p style={{ margin: 0, fontSize: 15 }}>No hay citas próximas.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            {groups.map((group) => (
              <div key={group.date}>
                {/* Day header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <span style={{
                    fontSize: 12,
                    fontWeight: 600,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: group.isToday ? 'var(--gold)' : group.isTomorrow ? 'var(--foreground)' : 'var(--muted)',
                  }}>
                    {group.label}
                  </span>
                  <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                  <span style={{
                    fontSize: 11,
                    color: 'var(--muted)',
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 20,
                    padding: '2px 10px',
                  }}>
                    {group.appointments.length} {group.appointments.length === 1 ? 'cita' : 'citas'}
                  </span>
                </div>

                {/* Appointments */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {group.appointments.map((apt) => (
                    <div key={apt.id} style={{
                      background: 'var(--surface)',
                      border: '1px solid var(--border)',
                      borderRadius: 12,
                      padding: '16px 20px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 18,
                      flexWrap: 'wrap',
                    }}>
                      {/* Time block */}
                      <div style={{
                        minWidth: 58,
                        textAlign: 'center',
                        paddingRight: 18,
                        borderRight: '1px solid var(--border)',
                        flexShrink: 0,
                      }}>
                        <p style={{
                          fontFamily: 'var(--font-playfair)',
                          fontSize: 20,
                          fontWeight: 700,
                          color: 'var(--gold)',
                          margin: 0,
                          lineHeight: 1,
                        }}>
                          {apt.time}
                        </p>
                      </div>

                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 100 }}>
                        <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--foreground)', margin: '0 0 3px' }}>{apt.name}</p>
                        <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0 }}>{apt.phone}</p>
                        {apt.notes && <p style={{ fontSize: 12, color: 'var(--muted)', margin: '3px 0 0', fontStyle: 'italic' }}>{apt.notes}</p>}
                      </div>

                      {/* Actions */}
                      <ActionButton
                        label="Eliminar"
                        style={{ background: 'transparent', color: 'var(--muted)', border: '1px solid var(--border)' }}
                        hoverBg="rgba(200,60,60,0.12)"
                        onClick={() => deleteAppointment(apt.id)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

function ActionButton({
  label, style, hoverBg, onClick,
}: {
  label: string
  style: React.CSSProperties
  hoverBg: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '6px 12px',
        borderRadius: 7,
        fontSize: 12,
        fontWeight: 600,
        letterSpacing: '0.04em',
        cursor: 'pointer',
        transition: 'background 0.15s',
        ...style,
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = hoverBg }}
      onMouseLeave={(e) => { e.currentTarget.style.background = style.background as string }}
    >
      {label}
    </button>
  )
}

export function AdminNav({ active, onLogout }: { active: 'dashboard' | 'horario'; onLogout: () => void }) {
  return (
    <nav style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
      <div style={{
        maxWidth: 720,
        margin: '0 auto',
        padding: '0 24px',
        height: 56,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 20 }}>💈</span>
          <span style={{
            fontFamily: 'var(--font-playfair)',
            fontSize: 16,
            fontWeight: 700,
            color: 'var(--foreground)',
            letterSpacing: '0.01em',
          }}>
            Juan Antonio&apos;s Barber
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <NavLink href="/admin/dashboard" label="Citas" active={active === 'dashboard'} />
          <NavLink href="/admin/horario" label="Horario" active={active === 'horario'} />
          <div style={{ width: 1, height: 16, background: 'var(--border)', margin: '0 4px' }} />
          <button
            onClick={onLogout}
            style={{
              background: 'none', border: 'none', padding: '6px 12px', borderRadius: 6,
              fontSize: 13, color: 'var(--muted)', cursor: 'pointer', transition: 'color 0.15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#e07070' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--muted)' }}
          >
            Salir
          </button>
        </div>
      </div>
    </nav>
  )
}

function NavLink({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link href={href} style={{
      padding: '6px 14px', borderRadius: 6, fontSize: 13,
      fontWeight: active ? 600 : 400,
      color: active ? 'var(--gold)' : 'var(--muted)',
      textDecoration: 'none',
      background: active ? 'rgba(196,148,58,0.08)' : 'none',
      border: active ? '1px solid rgba(196,148,58,0.2)' : '1px solid transparent',
      letterSpacing: '0.03em',
    }}>
      {label}
    </Link>
  )
}
