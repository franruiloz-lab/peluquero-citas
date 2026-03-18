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

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmada',
  cancelled: 'Cancelada',
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-emerald-100 text-emerald-800',
  cancelled: 'bg-red-100 text-red-800',
}

function toYMD(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

export default function DashboardPage() {
  const router = useRouter()
  const [selectedDate, setSelectedDate] = useState(toYMD(new Date()))
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)

  const fetchAppointments = useCallback(async () => {
    setLoading(true)
    const res = await fetch(`/api/appointments?date=${selectedDate}`)
    const data = await res.json()
    setAppointments(data)
    setLoading(false)
  }, [selectedDate])

  useEffect(() => {
    fetchAppointments()
  }, [fetchAppointments])

  async function updateStatus(id: number, status: string) {
    await fetch(`/api/appointments/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    fetchAppointments()
  }

  async function deleteAppointment(id: number) {
    if (!confirm('¿Eliminar esta cita?')) return
    await fetch(`/api/appointments/${id}`, { method: 'DELETE' })
    fetchAppointments()
  }

  async function handleLogout() {
    await fetch('/api/logout', { method: 'POST' })
    router.push('/admin')
  }

  const pending = appointments.filter((a) => a.status === 'pending').length
  const confirmed = appointments.filter((a) => a.status === 'confirmed').length

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
            <Link href="/admin/dashboard" className="text-emerald-400 text-sm font-medium">
              Citas
            </Link>
            <Link href="/admin/horario" className="text-gray-400 hover:text-white text-sm">
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

      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Date picker + stats */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl font-bold">Citas del día</h1>
            <p className="text-gray-400 text-sm mt-0.5">
              {pending} pendientes · {confirmed} confirmadas
            </p>
          </div>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-gray-800 border border-gray-600 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Appointments list */}
        {loading ? (
          <p className="text-gray-400 text-sm">Cargando...</p>
        ) : appointments.length === 0 ? (
          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-8 text-center">
            <p className="text-gray-400">No hay citas para este día.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {appointments.map((apt) => (
              <div
                key={apt.id}
                className="bg-gray-800 border border-gray-700 rounded-2xl px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-4"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className="text-xl font-bold text-emerald-400">{apt.time}</span>
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[apt.status]}`}
                    >
                      {STATUS_LABELS[apt.status]}
                    </span>
                  </div>
                  <p className="text-white font-semibold mt-1">{apt.name}</p>
                  <p className="text-gray-400 text-sm">{apt.phone}</p>
                  {apt.notes && <p className="text-gray-500 text-xs mt-1 italic">{apt.notes}</p>}
                </div>
                <div className="flex gap-2 flex-wrap">
                  {apt.status !== 'confirmed' && (
                    <button
                      onClick={() => updateStatus(apt.id, 'confirmed')}
                      className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg font-medium transition-colors"
                    >
                      Confirmar
                    </button>
                  )}
                  {apt.status !== 'cancelled' && (
                    <button
                      onClick={() => updateStatus(apt.id, 'cancelled')}
                      className="text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 px-3 py-1.5 rounded-lg font-medium transition-colors"
                    >
                      Cancelar
                    </button>
                  )}
                  <button
                    onClick={() => deleteAppointment(apt.id)}
                    className="text-xs bg-red-900/50 hover:bg-red-800 text-red-400 px-3 py-1.5 rounded-lg font-medium transition-colors"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
