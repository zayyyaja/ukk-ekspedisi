import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export function CtaSection() {
  return (
    <section className="bg-background px-4 py-16">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 rounded-lg bg-slate-950 p-8 text-white sm:p-10 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase text-blue-300">Mulai kirim</p>
          <h2 className="mt-2 text-3xl font-bold">Siap Mengirim Paket Hari Ini?</h2>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link href="/customer/register">
              Daftar Sekarang
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/customer/login">Login Customer</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
