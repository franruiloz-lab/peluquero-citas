'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const DAYS_ES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const MONTHS_ES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
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

  const days = getNext21Days()

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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-xl mx-auto px-4 py-5 text-center">
          <div className="text-4xl mb-1">✂️</div>
          <h1 className="text-2xl font-bold text-gray-900">Fran Peluquero</h1>
          <p className="text-gray-500 text-sm mt-1">Reserva tu cita de corte</p>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 py-8 space-y-8">

        {/* PASO 1: Elige día */}
        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-emerald-600 text-white text-sm font-bold mr-2">1</span>
            Elige un día
          </h2>
          <div className="grid grid-cols-7 gap-1.5">
            {days.map((d) => {
              const ymd = toYMD(d)
              const isSelected = ymd === selectedDate
              const isToday = ymd === toYMD(new Date())
              return (
                <button
                  key={ymd}
                  onClick={() => setSelectedDate(ymd)}
                  className={`flex flex-col items-center py-2.5 px-1 rounded-xl text-xs font-medium transition-all
                    ${isSelected
                      ? 'bg-emerald-600 text-white shadow-md scale-105'
                      : 'bg-white border border-gray-200 text-gray-700 hover:border-emerald-400 hover:bg-emerald-50'
                    }`}
                >
                  <span className="text-[10px] uppercase tracking-wide opacity-70">{DAYS_ES[d.getDay()]}</span>
                  <span className="text-base font-bold mt-0.5">{d.getDate()}</span>
                  <span className="text-[10px] opacity-60">{MONTHS_ES[d.getMonth()].slice(0, 3)}</span>
                  {isToday && <span className="mt-0.5 w-1 h-1 rounded-full bg-current opacity-60" />}
                </button>
              )
            })}
          </div>
        </section>

        {/* PASO 2: Elige hora */}
        {selectedDate && (
          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-emerald-600 text-white text-sm font-bold mr-2">2</span>
              Elige una hora
            </h2>
            {loadingSlots ? (
              <p className="text-gray-400 text-sm">Cargando horas disponibles...</p>
            ) : slots.length === 0 ? (
              <p className="text-gray-500 text-sm bg-white border border-gray-200 rounded-xl p-4">
                No hay horas disponibles para este día.
              </p>
            ) : (
              <div className="grid grid-cols-4 gap-2">
                {slots.map((slot) => (
                  <button
                    key={slot}
                    onClick={() => { setSelectedTime(slot); setStep(3) }}
                    className={`py-3 rounded-xl text-sm font-semibold transition-all
                      ${selectedTime === slot
                        ? 'bg-emerald-600 text-white shadow-md scale-105'
                        : 'bg-white border border-gray-200 text-gray-700 hover:border-emerald-400 hover:bg-emerald-50'
                      }`}
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
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-emerald-600 text-white text-sm font-bold mr-2">3</span>
              Tus datos
            </h2>
            <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-sm text-emerald-800 font-medium">
                📅 {selectedDate} · {selectedTime} · Corte
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Tu nombre"
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="600 000 000"
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors"
              >
                {submitting ? 'Reservando...' : 'Confirmar cita'}
              </button>
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
