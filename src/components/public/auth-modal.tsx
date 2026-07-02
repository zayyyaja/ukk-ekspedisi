"use client";

import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function AuthModal({ children }: { children: React.ReactNode }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-900">Perhatian</DialogTitle>
          <DialogDescription className="text-base text-slate-600 mt-2">
            Anda belum memiliki akun. Silakan login atau daftar terlebih dahulu untuk menggunakan fitur ini.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3 mt-4">
          <Button asChild size="lg" className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold">
            <Link href="/customer/login">
              Login Sekarang
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="w-full font-bold">
            <Link href="/customer/register">
              Daftar Akun Baru
            </Link>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
