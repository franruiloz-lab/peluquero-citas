import Link from 'next/link'

export default async function ConfirmacionPage({
  searchParams,
}: {
  searchParams: Promise<{ nombre?: string; fecha?: string; hora?: string }>
}) {
  const { nombre, fecha, hora } = await searchParams

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--background)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
    }}>
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 20,
        padding: '48px 40px',
        maxWidth: 440,
        width: '100%',
        textAlign: 'center',
      }}>
        {/* Icon */}
        <div style={{
          width: 72,
          height: 72,
          borderRadius: '50%',
          background: 'rgba(196,148,58,0.12)',
          border: '1px solid rgba(196,148,58,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 32,
          margin: '0 auto 24px',
        }}>
          ✓
        </div>

        <h1 style={{
          fontFamily: 'var(--font-playfair)',
          fontSize: 28,
          fontWeight: 700,
          color: 'var(--foreground)',
          margin: '0 0 8px',
        }}>
          ¡Cita confirmada!
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: 15, margin: '0 0 32px' }}>
          Nos vemos pronto, <span style={{ color: 'var(--foreground)', fontWeight: 600 }}>{nombre}</span>.
        </p>

        {/* Details */}
        <div style={{
          background: '#0a0a0a',
          border: '1px solid var(--border)',
          borderRadius: 12,
          overflow: 'hidden',
          marginBottom: 32,
        }}>
          <DetailRow icon="💈" label="Servicio" value="Corte" />
          <div style={{ height: 1, background: 'var(--border)' }} />
          <DetailRow icon="📅" label="Fecha" value={fecha || ''} />
          <div style={{ height: 1, background: 'var(--border)' }} />
          <DetailRow icon="🕐" label="Hora" value={hora || ''} />
        </div>

        <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 24 }}>
          Si necesitas cancelar, contáctanos con antelación.
        </p>

        <Link
          href="/"
          style={{
            display: 'inline-block',
            fontSize: 13,
            color: 'var(--gold)',
            textDecoration: 'none',
            letterSpacing: '0.05em',
            borderBottom: '1px solid rgba(196,148,58,0.3)',
            paddingBottom: 2,
          }}
        >
          ← Volver al inicio
        </Link>
      </div>

      <p style={{
        marginTop: 32,
        fontSize: 13,
        color: 'var(--border)',
        fontFamily: 'var(--font-playfair)',
        fontStyle: 'italic',
        letterSpacing: '0.05em',
      }}>
        Juan Antonio&apos;s Barber
      </p>
    </div>
  )
}

function DetailRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px' }}>
      <span style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--muted)', fontSize: 13 }}>
        <span>{icon}</span>
        {label}
      </span>
      <span style={{ color: 'var(--foreground)', fontSize: 14, fontWeight: 600 }}>{value}</span>
    </div>
  )
}
