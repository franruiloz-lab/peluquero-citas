import { NextResponse } from 'next/server'

const ADMIN_PASSWORD = '1234'
const SESSION_TOKEN = 'peluquero_admin_ok'

export async function POST(request: Request) {
  const { password } = await request.json()

  if (password !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Contraseña incorrecta' }, { status: 401 })
  }

  const response = NextResponse.json({ ok: true })
  response.cookies.set('session', SESSION_TOKEN, {
    httpOnly: true,
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 días
  })
  return response
}
