import type { Metadata } from 'next'
import { ShieldCheck, UserRound, Home, ArrowRight } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export const metadata: Metadata = {
  title: 'Pilih Akses Login - dEkspedisi',
  description: 'Pilih login sebagai Customer atau Staff Ekspedisi.'
}

const loginOptions = [
  {
    title: 'Login Customer',
    description: 'Masuk untuk cek ongkir, buat order pengiriman baru, dan tracking nomor resi paket.',
    href: '/customer/login',
    icon: UserRound,
    accentColor: 'bg-amber-400'
  },
  {
    title: 'Login Staff / Admin',
    description: 'Masuk khusus petugas Admin, Kasir, Kurir lapangan, atau Manager operasional gudang.',
    href: '/staff/login',
    icon: ShieldCheck,
    accentColor: 'bg-rose-400'
  }
]

export default function LoginPage () {
  return (
    <main className='relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-100 px-4 py-12 font-mono select-none'>
      {/* Pola Grid Kasar Khas Gudang Logistik */}
      <div className='absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:30px_30px] opacity-70' />

      {/* Kartu Pilihan Login Utama */}
      <Card className='relative z-10 w-full max-w-lg border-4 border-slate-900 bg-white p-2 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] rounded-sm'>
        
        {/* Dekorasi Garis Atas */}
        <div className="h-3 w-full bg-[linear-gradient(-45deg,#0f172a_25%,#fbbf24_25%,#fbbf24_50%,#0f172a_50%,#0f172a_75%,#fbbf24_75%,#fbbf24)] bg-[size:16px_16px] border-b-2 border-slate-900" />

        <CardContent className='p-6 md:p-8'>
          {/* Header Judul */}
          <div className='mb-8 text-center'>
            <span className='inline-flex border-2 border-slate-900 bg-amber-400 px-3 py-0.5 text-3xs font-black uppercase tracking-widest text-slate-900 rounded-xs'>
              dEkspedisi
            </span>

            <h1 className='mt-4 text-2xl font-black text-slate-900 uppercase tracking-tight sm:text-3xl'>
              PILIH HAK AKSES
            </h1>

            <p className='mt-2 text-2xs font-bold uppercase text-slate-400 tracking-wide'>
              Silakan pilih jenis akun Anda untuk masuk ke sistem logistik.
            </p>
          </div>

          {/* List Pilihan Menu Tombol Kotak */}
          <div className='space-y-4'>
            {loginOptions.map(option => {
              const Icon = option.icon

              return (
                <Link
                  key={option.href}
                  href={option.href}
                  className='group block border-2 border-slate-900 bg-slate-50 p-4 transition-all rounded-sm shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[5px_5px_0px_0px_rgba(15,23,42,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]'
                >
                  <div className='flex items-center gap-4'>
                    {/* Kotak Ikon */}
                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center border-2 border-slate-900 ${option.accentColor} text-slate-900 rounded-sm shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]`}>
                      <Icon className='h-5 w-5 stroke-[2.5]' />
                    </div>

                    {/* Deskripsi Teks */}
                    <div className='flex-1 min-w-0 text-left'>
                      <h3 className='text-xs font-black text-slate-900 uppercase tracking-wide flex items-center justify-between'>
                        <span>{option.title}</span>
                        <ArrowRight className="h-3.5 w-3.5 stroke-[3] text-slate-400 opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0 group-hover:text-slate-900" />
                      </h3>

                      <p className='mt-1 text-[11px] font-bold text-slate-500 leading-normal normal-case'>
                        {option.description}
                      </p>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>

          {/* Tombol Kembali ke Homepage */}
          <Button
            asChild
            className='mt-6 h-11 w-full bg-slate-900 text-white border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[5px_5px_0px_0px_rgba(15,23,42,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] text-2xs font-black uppercase tracking-wider rounded-sm transition-all'
          >
            <Link href='/'>
              <Home className="mr-2 h-3.5 w-3.5 stroke-[2.5]" />
              Kembali ke Beranda Utama
            </Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  )
}