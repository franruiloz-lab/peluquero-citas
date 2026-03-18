'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLoginPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    if (res.ok) {
      router.push('/admin/dashboard')
    } else {
      setError('Contraseña incorrecta')
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--background)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    }}>
      <div style={{ width: '100%', maxWidth: 360 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            fontSize: 48,
            marginBottom: 16,
            filter: 'drop-shadow(0 0 20px rgba(196,148,58,0.3))',
          }}>
            💈
          </div>
          <h1 style={{
            fontFamily: 'var(--font-playfair)',
            fontSize: 26,
            fontWeight: 700,
            color: 'var(--foreground)',
            margin: '0 0 6px',
            letterSpacing: '0.02em',
          }}>
            Juan Antonio&apos;s Barber
          </h1>
          <p style={{
            fontFamily: 'var(--font-playfair)',
            fontStyle: 'italic',
            fontSize: 13,
            color: 'var(--gold)',
            letterSpacing: '0.08em',
            margin: 0,
          }}>
            Panel de administración
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 16,
          padding: 32,
        }}>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: 11,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: 'var(--muted)',
                marginBottom: 8,
              }}>
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoFocus
                style={{
                  width: '100%',
                  background: '#0a0a0a',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  padding: '12px 16px',
                  color: 'var(--foreground)',
                  fontSize: 15,
                  outline: 'none',
                  transition: 'border-color 0.15s',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--gold)' }}
                onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)' }}
              />
            </div>

            {error && (
              <p style={{ fontSize: 13, color: '#e05555', margin: 0 }}>{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '13px 24px',
                background: loading ? 'var(--border)' : 'linear-gradient(135deg, var(--gold), var(--gold-light))',
                color: '#0a0a0a',
                border: 'none',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'opacity 0.15s',
              }}
              onMouseEnter={(e) => { if (!loading) e.currentTarget.style.opacity = '0.88' }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = '1' }}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
