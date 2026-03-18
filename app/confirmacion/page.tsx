import Link from 'next/link'

export default async function ConfirmacionPage({
  searchParams,
}: {
  searchParams: Promise<{ nombre?: string; fecha?: string; hora?: string }>
}) {
  const { nombre, fecha, hora } = await searchParams

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 max-w-md w-full text-center">
        <div className="text-5xl mb-4">✅</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">¡Cita confirmada!</h1>
        <p className="text-gray-500 mb-6">
          Nos vemos pronto, <strong>{nombre}</strong>.
        </p>
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-6 py-4 text-left space-y-2 mb-6">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Servicio</span>
            <span className="font-semibold text-gray-800">Corte</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Fecha</span>
            <span className="font-semibold text-gray-800">{fecha}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Hora</span>
            <span className="font-semibold text-gray-800">{hora}</span>
          </div>
        </div>
        <Link
          href="/"
          className="inline-block text-sm text-emerald-600 hover:text-emerald-700 font-medium"
        >
          ← Volver al inicio
        </Link>
      </div>
    </div>
  )
}
