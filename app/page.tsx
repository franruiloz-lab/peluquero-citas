'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const DAYS_ES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const MONTHS_ES = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic',
]

function toYMD(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function getNext21Days() {
  const days: Date[] = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  for (let i = 0; i < 21; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    days.push(d)
  }
  return days
}

export default function BookingPage() {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [slots, setSlots] = useState<string[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [availability, setAvailability] = useState<Record<string, number>>({})

  const days = getNext21Days()

  // Load availability for all visible days on mount
  useEffect(() => {
    const from = toYMD(days[0])
    const to = toYMD(days[days.length - 1])
    fetch(`/api/availability?from=${from}&to=${to}`)
      .then((r) => r.json())
      .then(setAvailability)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!selectedDate) return
    setLoadingSlots(true)
    setSlots([])
    setSelectedTime(null)
    fetch(`/api/slots?date=${selectedDate}`)
      .then((r) => r.json())
      .then((data) => {
        setSlots(data)
        setLoadingSlots(false)
        setStep(2)
      })
  }, [selectedDate])

  async function handleSubmit() {
    if (!name.trim() || !phone.trim()) {
      setError('Por favor rellena tu nombre y teléfono.')
      return
    }
    setError('')
    setSubmitting(true)
    const res = await fetch('/api/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, phone, date: selectedDate, time: selectedTime }),
    })
    if (res.ok) {
      router.push(`/confirmacion?nombre=${encodeURIComponent(name)}&fecha=${selectedDate}&hora=${selectedTime}`)
    } else {
      const data = await res.json()
      setError(data.error || 'Error al reservar. Inténtalo de nuevo.')
      setSubmitting(false)
    }
  }

  return (
    <div style={{ background: 'var(--background)', minHeight: '100vh', color: 'var(--foreground)' }}>

      {/* Hero header */}
      <header style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
        <div className="booking-header" style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: 52, marginBottom: 16, filter: 'drop-shadow(0 0 20px rgba(196,148,58,0.3))' }}>
            💈
          </div>
          <h1 style={{
            fontFamily: 'var(--font-playfair)',
            fontSize: 'clamp(28px, 6vw, 42px)',
            fontWeight: 700,
            letterSpacing: '0.02em',
            color: 'var(--foreground)',
            margin: '0 0 8px',
            lineHeight: 1.15,
          }}>
            Juan Antonio&apos;s Barber
          </h1>
          <p style={{
            fontFamily: 'var(--font-playfair)',
            fontStyle: 'italic',
            fontSize: 15,
            color: 'var(--gold)',
            letterSpacing: '0.08em',
            margin: 0,
          }}>
            El arte del corte perfecto
          </p>
        </div>
      </header>

      <main className="booking-main" style={{ maxWidth: 600, margin: '0 auto' }}>

        {/* Divider label */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 36 }}>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          <span style={{ fontSize: 11, letterSpacing: '0.2em', color: 'var(--muted)', textTransform: 'uppercase' }}>
            Reserva tu cita
          </span>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        </div>

        {/* PASO 1: Elige día */}
        <section style={{ marginBottom: 48 }}>
          <StepLabel number={1} label="Selecciona un día" />
          <div className="calendar-grid" style={{ marginTop: 20 }}>
            {days.map((d) => {
              const ymd = toYMD(d)
              const isSelected = ymd === selectedDate
              const isToday = ymd === toYMD(new Date())
              const slotsLeft = availability[ymd]
              const hasLoaded = ymd in availability
              const hasSlots = hasLoaded && slotsLeft > 0
              const noSlots = hasLoaded && slotsLeft === 0

              return (
                <button
                  key={ymd}
                  onClick={() => hasSlots || !hasLoaded ? setSelectedDate(ymd) : undefined}
                  disabled={noSlots}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: '10px 4px',
                    borderRadius: 10,
                    border: isSelected
                      ? '1px solid var(--gold)'
                      : hasSlots
                      ? '1px solid rgba(196,148,58,0.35)'
                      : '1px solid var(--border)',
                    background: isSelected
                      ? 'rgba(196,148,58,0.15)'
                      : hasSlots
                      ? 'rgba(196,148,58,0.06)'
                      : 'var(--surface)',
                    color: isSelected
                      ? 'var(--gold-light)'
                      : noSlots
                      ? 'var(--muted)'
                      : 'var(--foreground)',
                    cursor: noSlots ? 'default' : 'pointer',
                    opacity: noSlots ? 0.4 : 1,
                    transition: 'all 0.15s ease',
                    outline: 'none',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected && !noSlots) {
                      e.currentTarget.style.borderColor = 'rgba(196,148,58,0.6)'
                      e.currentTarget.style.background = 'rgba(196,148,58,0.1)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected && !noSlots) {
                      e.currentTarget.style.borderColor = hasSlots ? 'rgba(196,148,58,0.35)' : 'var(--border)'
                      e.currentTarget.style.background = hasSlots ? 'rgba(196,148,58,0.06)' : 'var(--surface)'
                    }
                  }}
                >
                  <span style={{ fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', opacity: 0.6, marginBottom: 4 }}>
                    {DAYS_ES[d.getDay()]}
                  </span>
                  <span style={{ fontSize: 17, fontWeight: 600, lineHeight: 1 }}>{d.getDate()}</span>
                  <span style={{ fontSize: 9, opacity: 0.5, marginTop: 3 }}>{MONTHS_ES[d.getMonth()]}</span>
                  {isToday && (
                    <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--gold)', marginTop: 4 }} />
                  )}
                </button>
              )
            })}
          </div>
        </section>

        {/* PASO 2: Elige hora */}
        {selectedDate && (
          <section style={{ marginBottom: 48 }}>
            <StepLabel number={2} label="Elige tu hora" />
            {loadingSlots ? (
              <p style={{ color: 'var(--muted)', fontSize: 14, marginTop: 20 }}>Cargando horarios disponibles...</p>
            ) : slots.length === 0 ? (
              <div style={{
                marginTop: 20,
                padding: '24px',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 12,
                textAlign: 'center',
                color: 'var(--muted)',
                fontSize: 14,
              }}>
                No hay horas disponibles para este día.
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginTop: 20 }}>
                {slots.map((slot) => (
                  <button
                    key={slot}
                    onClick={() => { setSelectedTime(slot); setStep(3) }}
                    style={{
                      padding: '14px 8px',
                      borderRadius: 10,
                      border: selectedTime === slot ? '1px solid var(--gold)' : '1px solid var(--border)',
                      background: selectedTime === slot ? 'rgba(196,148,58,0.12)' : 'var(--surface)',
                      color: selectedTime === slot ? 'var(--gold-light)' : 'var(--foreground)',
                      fontSize: 15,
                      fontWeight: 600,
                      letterSpacing: '0.05em',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      outline: 'none',
                    }}
                    onMouseEnter={(e) => {
                      if (selectedTime !== slot) {
                        e.currentTarget.style.borderColor = 'rgba(196,148,58,0.4)'
                        e.currentTarget.style.background = 'rgba(196,148,58,0.05)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedTime !== slot) {
                        e.currentTarget.style.borderColor = 'var(--border)'
                        e.currentTarget.style.background = 'var(--surface)'
                      }
                    }}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            )}
          </section>
        )}

        {/* PASO 3: Datos */}
        {step === 3 && selectedTime && (
          <section>
            <StepLabel number={3} label="Tus datos" />
            <div style={{
              marginTop: 20,
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 16,
              padding: 28,
            }}>
              {/* Summary */}
              <div style={{
                padding: '12px 16px',
                background: 'rgba(196,148,58,0.08)',
                border: '1px solid rgba(196,148,58,0.2)',
                borderRadius: 10,
                marginBottom: 24,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}>
                <span style={{ fontSize: 18 }}>💈</span>
                <div>
                  <p style={{ margin: 0, fontSize: 13, color: 'var(--gold)', fontWeight: 600 }}>Corte</p>
                  <p style={{ margin: 0, fontSize: 12, color: 'var(--muted)' }}>{selectedDate} · {selectedTime}</p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 8 }}>
                    Nombre
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Tu nombre completo"
                    style={inputStyle}
                    onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--gold)'; e.currentTarget.style.outline = 'none' }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 8 }}>
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="600 000 000"
                    style={inputStyle}
                    onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--gold)'; e.currentTarget.style.outline = 'none' }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)' }}
                  />
                </div>
              </div>

              {error && (
                <p style={{ marginTop: 12, fontSize: 13, color: '#e05555' }}>{error}</p>
              )}

              <button
                onClick={handleSubmit}
                disabled={submitting}
                style={{
                  marginTop: 24,
                  width: '100%',
                  padding: '15px 24px',
                  background: submitting ? 'var(--border)' : 'linear-gradient(135deg, var(--gold), var(--gold-light))',
                  color: '#0a0a0a',
                  border: 'none',
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  transition: 'opacity 0.15s',
                }}
                onMouseEnter={(e) => { if (!submitting) e.currentTarget.style.opacity = '0.9' }}
                onMouseLeave={(e) => { e.currentTarget.style.opacity = '1' }}
              >
                {submitting ? 'Confirmando...' : 'Confirmar cita'}
              </button>
            </div>
          </section>
        )}
      </main>

      {/* Consulta tu cita */}
      <ConsultaCita />

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border)',
        padding: '24px',
        textAlign: 'center',
        color: 'var(--muted)',
        fontSize: 12,
        letterSpacing: '0.05em',
      }}>
        © Juan Antonio&apos;s Barber
      </footer>
    </div>
  )
}

function ConsultaCita() {
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<{ name: string; date: string; time: string }[] | null>(null)

  async function handleSearch() {
    if (!phone.trim()) return
    setLoading(true)
    setResults(null)
    const res = await fetch(`/api/appointments?phone=${encodeURIComponent(phone.trim())}`)
    const data = await res.json()
    setResults(data)
    setLoading(false)
  }

  return (
    <div style={{ borderTop: '1px solid var(--border)', background: 'var(--surface)' }}>
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '48px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          <span style={{ fontSize: 11, letterSpacing: '0.2em', color: 'var(--muted)', textTransform: 'uppercase' }}>
            Consulta tu cita
          </span>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        </div>

        <p style={{ fontSize: 14, color: 'var(--muted)', textAlign: 'center', marginBottom: 24, marginTop: 0 }}>
          ¿No recuerdas a qué hora es tu cita? Introduce tu teléfono y lo comprobamos.
        </p>

        <div style={{ display: 'flex', gap: 10 }}>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="600 000 000"
            style={{ ...inputStyle, flex: 1 }}
            onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--gold)'; e.currentTarget.style.outline = 'none' }}
            onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)' }}
          />
          <button
            onClick={handleSearch}
            disabled={loading}
            style={{
              padding: '12px 20px',
              background: loading ? 'var(--border)' : 'linear-gradient(135deg, var(--gold), var(--gold-light))',
              color: '#0a0a0a',
              border: 'none',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              cursor: loading ? 'not-allowed' : 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            {loading ? '...' : 'Buscar'}
          </button>
        </div>

        {results !== null && (
          <div style={{ marginTop: 24 }}>
            {results.length === 0 ? (
              <div style={{
                padding: '20px 24px',
                background: 'rgba(196,148,58,0.05)',
                border: '1px solid var(--border)',
                borderRadius: 12,
                textAlign: 'center',
                color: 'var(--muted)',
                fontSize: 14,
              }}>
                No tienes citas próximas con ese teléfono.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {results.map((appt, i) => (
                  <div key={i} style={{
                    padding: '16px 20px',
                    background: 'rgba(196,148,58,0.08)',
                    border: '1px solid rgba(196,148,58,0.3)',
                    borderRadius: 12,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                  }}>
                    <span style={{ fontSize: 24 }}>💈</span>
                    <div>
                      <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: 'var(--foreground)' }}>
                        {appt.name}
                      </p>
                      <p style={{ margin: '4px 0 0', fontSize: 14, color: 'var(--gold)' }}>
                        {appt.date} · {appt.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: '#0a0a0a',
  border: '1px solid var(--border)',
  borderRadius: 8,
  padding: '12px 16px',
  color: 'var(--foreground)',
  fontSize: 15,
  transition: 'border-color 0.15s',
}

function StepLabel({ number, label }: { number: number; label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 28,
        height: 28,
        borderRadius: '50%',
        background: 'rgba(196,148,58,0.15)',
        border: '1px solid var(--gold)',
        color: 'var(--gold)',
        fontSize: 13,
        fontWeight: 700,
        flexShrink: 0,
      }}>
        {number}
      </span>
      <span style={{
        fontFamily: 'var(--font-playfair)',
        fontSize: 20,
        fontWeight: 600,
        letterSpacing: '0.01em',
        color: 'var(--foreground)',
      }}>
        {label}
      </span>
    </div>
  )
}
