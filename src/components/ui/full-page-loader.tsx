import { Terminal } from "lucide-react";

export function FullPageLoader({ label = "Memuat..." }: { label?: string }) {
  return (
    <div className="fixed inset-0 z-100 flex flex-col items-center justify-center bg-slate-100 font-mono select-none">
      {/* Pola Grid Latar Belakang Khas Cetak Biru Gudang */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-size-[30px_30px] opacity-70" />

      {/* Kontainer Konten Utama */}
      <div className="relative z-10 flex flex-col items-center gap-6 border-4 border-slate-900 bg-white p-8 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] rounded-md max-w-sm w-full text-center mx-4">
        
        {/* Style Tag Kustom Untuk Inject Animasi Kargo Mekanis Tanpa Edit Config */}
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes industrialStompShaker {
            0%, 100% { transform: translateY(0) scale(1); filter: drop-shadow(0px 0px 0px #000); }
            30% { transform: translateY(-8px) scale(1.02); }
            35% { transform: translateY(2px) scale(0.98); }
            38% { transform: translateY(0) scale(1); }
            45% { transform: translateX(1px) translateY(-0.5px); }
            50% { transform: translateX(-1px) translateY(0.5px); }
            55% { transform: translateX(1.5px) translateY(0px); }
            60% { transform: translateX(-1px) translateY(-0.5px); }
            65% { transform: translateX(0) translateY(0); }
          }
          .animate-industrial {
            animation: industrialStompShaker 2s infinite ease-in-out;
          }
        `}} />

        {/* Logo Dengan Animasi Mekanis Piston & Konveyor */}
        <div className="relative flex h-28 w-28 items-center justify-center border-4 border-slate-900 bg-amber-400 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] rounded-sm overflow-hidden">
          {/* Garis arsiran gudang di latar belakang logo */}
          <div className="absolute inset-0 bg-[linear-gradient(45deg,#000_25%,transparent_25%,transparent_50%,#000_50%,#000_75%,transparent_75%,transparent)] bg-size-[16px_16px] opacity-10" />
          
          <img 
            src="/images/icon-192.png" 
            alt="image/png" 
            className="relative z-10 h-20 w-20 object-contain animate-industrial" 
          />
        </div>

        {/* Bar Indikator Pemuatan: Menggantikan Loader Spinner Biasa Jadi Barikade Kargo */}
        <div className="relative h-5 w-full overflow-hidden border-2 border-slate-900 bg-slate-200 rounded-sm">
          <div 
            className="h-full w-[200%] bg-[linear-gradient(-45deg,#0f172a_25%,#fbbf24_25%,#fbbf24_50%,#0f172a_50%,#0f172a_75%,#fbbf24_75%,#fbbf24)] bg-size-[20px_20px]" 
            style={{
              animation: 'moveBarricade 1s linear infinite'
            }}
          />
          <style dangerouslySetInnerHTML={{__html: `
            @keyframes moveBarricade {
              0% { background-position: 0 0; }
              100% { background-position: 40px 0; }
            }
          `}} />
        </div>

        {/* Teks Status Transmisi */}
        <div className="space-y-1.5 w-full">
          <div className="flex items-center justify-center gap-1.5 text-slate-400 text-[10px] font-black uppercase tracking-widest">
            <Terminal size={10} className="stroke-[2.5]" />
            <span>SYS_PIPELINE // CONNECTING</span>
          </div>
          <p className="text-2xs font-black uppercase tracking-wide text-slate-900 truncate px-2 border border-dashed border-slate-300 py-1 bg-slate-50">
            {label}
          </p>
        </div>

      </div>
    </div>
  );
}