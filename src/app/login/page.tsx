import type { Metadata } from 'next'
import { ShieldCheck, UserRound } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export const metadata: Metadata = {
  title: 'Login - Ekspedisi Online',
  description: 'Pilih akses login customer atau staff.'
}

const loginOptions = [
  {
    title: 'Login Customer',
    description:
      'Masuk untuk membuat pengiriman, tracking paket, dan melihat riwayat pembayaran.',
    href: '/customer/login',
    icon: UserRound
  },
  {
    title: 'Login Staff',
    description: 'Masuk sebagai Admin, Kasir, Kurir, atau Manager operasional.',
    href: '/staff/login',
    icon: ShieldCheck
  }
]

export default function LoginPage () {
  return (
    <main className='relative flex min-h-screen items-center justify-center overflow-hidden bg-orange-50 px-6 py-12'>
      {/* Background */}
      <div className='absolute inset-0'>
        {/* Base */}
        <div className='absolute inset-0 bg-[#FFF8F3]' />

        {/* Main Gradient */}
        <div className='absolute inset-0 bg-gradient-to-b from-white via-orange-50 to-orange-100' />

        {/* Bottom Glow */}
        <div className='absolute -bottom-72 left-1/2 h-[52rem] w-[52rem] -translate-x-1/2 rounded-full bg-orange-400/35 blur-[180px]' />

        {/* Bottom Secondary Glow */}
        <div className='absolute -bottom-32 left-1/2 h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-orange-300/30 blur-[120px]' />

        {/* Soft Fade */}
        <div className='absolute inset-0 bg-gradient-to-t from-orange-100/30 via-transparent to-white/20' />

        {/* Grid Pattern */}
        <div
          className='absolute inset-0 opacity-[0.04]'
          style={{
            backgroundImage: `
        linear-gradient(to right, rgb(251 146 60 / 0.35) 1px, transparent 1px),
        linear-gradient(to bottom, rgb(251 146 60 / 0.35) 1px, transparent 1px)
      `,
            backgroundSize: '72px 72px'
          }}
        />
      </div>

      {/* Login Card */}
      <Card className='relative z-10 w-full max-w-lg rounded-3xl border border-white/70 bg-white/90 shadow-[0_25px_70px_rgba(249,115,22,0.12)] backdrop-blur-xl'>
        <CardContent className='p-8 md:p-10'>
          <div className='mb-10 text-center'>
            <span className='inline-flex rounded-full bg-orange-100 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-orange-600'>
              ANTERIN
            </span>

            <h1 className='mt-5 text-4xl font-black text-slate-900'>
              Selamat Datang
            </h1>

            <p className='mt-3 leading-7 text-slate-600'>
              Pilih jenis akun untuk melanjutkan ke halaman login.
            </p>
          </div>

          <div className='space-y-5'>
            {loginOptions.map(option => {
              const Icon = option.icon

              return (
                <Link
                  key={option.href}
                  href={option.href}
                  className='group block rounded-2xl border border-slate-200 bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:border-orange-400 hover:bg-orange-50 hover:shadow-lg'
                >
                  <div className='flex items-start gap-4'>
                    <div className='flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100 text-orange-600 transition group-hover:bg-orange-500 group-hover:text-white'>
                      <Icon className='h-7 w-7' />
                    </div>

                    <div className='flex-1'>
                      <h3 className='font-bold text-slate-900 transition group-hover:text-orange-600'>
                        {option.title}
                      </h3>

                      <p className='mt-2 text-sm leading-6 text-slate-600'>
                        {option.description}
                      </p>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>

          <Button
            asChild
            className='mt-8 h-12 w-full bg-orange-500 text-white hover:bg-orange-600'
          >
            <Link href='/'>Kembali ke Beranda</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  )
}
