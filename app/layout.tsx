import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'

const geist = Geist({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Reserva tu cita - Fran Peluquero',
  description: 'Reserva tu cita de corte de pelo fácil y rápido.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={`${geist.className} antialiased`}>{children}</body>
    </html>
  )
}
