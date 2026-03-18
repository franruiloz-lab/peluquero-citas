import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Login page is always accessible
  if (pathname === '/admin') {
    return NextResponse.next()
  }

  // Protect all other /admin/* routes
  if (pathname.startsWith('/admin/')) {
    const session = request.cookies.get('session')?.value
    if (session !== 'peluquero_admin_ok') {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin', '/admin/:path*'],
}
