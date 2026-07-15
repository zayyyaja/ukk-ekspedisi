"use client";

import { useEffect, useState, useRef } from "react";
import { User, MapPin, UploadCloud, X, Image as ImageIcon, Save, ShieldAlert, AlertTriangle, CheckCircle } from "lucide-react";

import { CustomerNavbarShell } from "@/components/customer/customer-navbar-shell";
import { apiPatchForm, ApiClientError } from "@/lib/api-client";
import { getCurrentUser } from "@/lib/auth-client";

type ProfileForm = {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  photo: string;
};

export default function CustomerProfilePage() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<ProfileForm>({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    photo: "",
  });
  
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getCurrentUser()
      .then((response) => {
        const user = response.data;
        const photoUrl = String(user?.photo ?? "");
        setForm({
          name: String(user?.name ?? ""),
          email: String(user?.email ?? ""),
          phone: String(user?.phone ?? ""),
          address: String(user?.address ?? ""),
          city: String(user?.city ?? ""),
          photo: photoUrl,
        });
        if (photoUrl) setPhotoPreview(photoUrl);
      })
      .catch((currentError) => setError(currentError instanceof Error ? currentError.message : "Gagal memuat profile."));
  }, []);

  function updateField(field: keyof ProfileForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setError("File harus berupa gambar (JPG, PNG, dll)");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError("Ukuran file maksimal 5MB");
        return;
      }
      setPhotoFile(file);
      const url = URL.createObjectURL(file);
      setPhotoPreview(url);
      setError("");
    }
  };

  const removePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    updateField("photo", "");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("name", form.name.trim());
      formData.append("phone", form.phone.trim());
      formData.append("address", form.address.trim());
      formData.append("city", form.city.trim());

      if (photoFile) {
        formData.append("photo", photoFile);
      } else if (!photoPreview && !form.photo) {
        formData.append("removePhoto", "true");
      }

      const response = await apiPatchForm<{ photo?: string | null }>(
        "/api/v2/customer/profile",
        formData,
      );

      const savedPhoto = response.data?.photo ?? null;
      updateField("photo", savedPhoto ?? "");
      setPhotoPreview(savedPhoto);
      setPhotoFile(null);
      setMessage("Profile berhasil diperbarui.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (currentError) {
      if (currentError instanceof ApiClientError) {
        setError(currentError.message);
      } else {
        setError(currentError instanceof Error ? currentError.message : "Gagal menyimpan profile.");
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <CustomerNavbarShell>
      <div className="mx-auto max-w-5xl font-mono select-none pb-12">
        {/* Header Section */}
        <header className="mb-8 border-b-4 border-slate-900 pb-6">
          <p className="text-2xs font-black uppercase tracking-[0.2em] text-amber-600">// ACCOUNT_IDENTITY_NODE</p>
          <h1 className="mt-1 text-3xl font-black uppercase tracking-wide text-slate-900 sm:text-4xl">PROFIL SAYA</h1>
          <p className="mt-1 text-xs font-bold text-slate-500">Kelola master parameter informasi data diri dan otorisasi alamat logistik Anda.</p>
        </header>

        {/* Message Banner Status */}
        {message && (
          <div className="mb-8 border-4 border-slate-900 bg-emerald-50 p-4 text-2xs font-black uppercase tracking-wider text-emerald-950 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] rounded-sm flex items-center gap-2">
            <CheckCircle size={14} className="text-emerald-600 shrink-0" />
            <span>[ SYSTEM_SUCCESS ]: {message}</span>
          </div>
        )}

        {error && (
          <div className="mb-8 border-4 border-slate-900 bg-rose-100 p-4 text-2xs font-black uppercase tracking-wider text-rose-950 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] rounded-sm flex items-center gap-2">
            <AlertTriangle size={14} className="text-rose-600 shrink-0" />
            <span>[ SYSTEM_CRITICAL ]: {error}</span>
          </div>
        )}

        <form onSubmit={submit} className="space-y-8">
          <div className="grid gap-8 lg:grid-cols-2">
            
            {/* KIRI: Blok Form Data Pribadi */}
            <section className="border-4 border-slate-900 bg-white p-6 shadow-[5px_5px_0px_0px_rgba(15,23,42,1)] rounded-sm">
              <div className="mb-6 flex items-center gap-3 border-b-2 border-dashed border-slate-200 pb-4">
                <div className="flex h-9 w-9 items-center justify-center border-2 border-slate-900 bg-slate-900 text-white rounded-xs">
                  <User size={16} />
                </div>
                <h2 className="text-xs font-black uppercase tracking-wider text-slate-900">DATA_PRIBADI_CORE</h2>
              </div>

              <div className="space-y-5 text-2xs font-bold uppercase tracking-wide">
                <div className="space-y-2">
                  <label className="text-slate-500 block font-black">// NAMA LENGKAP</label>
                  <input 
                    type="text"
                    className="flex h-11 w-full border-2 border-slate-900 bg-white px-3 text-xs font-bold text-slate-900 outline-none transition-all placeholder:text-slate-300 focus:bg-amber-50/20 focus:ring-2 focus:ring-slate-900 rounded-sm" 
                    onChange={(event) => updateField("name", event.target.value)} 
                    value={form.name} 
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-slate-400 block font-black">// ELECTRONIC MAIL (EMAIL)</label>
                  <input 
                    type="text"
                    className="flex h-11 w-full border-2 border-slate-200 bg-slate-100 px-3 text-xs font-bold text-slate-400 cursor-not-allowed outline-none rounded-sm" 
                    readOnly 
                    value={form.email} 
                  />
                  <p className="text-[10px] font-bold text-slate-400 leading-none lowercase tracking-normal flex items-center gap-1">
                    <ShieldAlert size={10} className="text-slate-400" />
                    Enkripsi konstan: Email registrasi utama tidak dapat diubah di terminal client.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-slate-500 block font-black">// NOMOR TELEPON SELULER</label>
                  <input 
                    type="text"
                    className="flex h-11 w-full border-2 border-slate-900 bg-white px-3 text-xs font-bold text-slate-900 outline-none transition-all placeholder:text-slate-300 focus:bg-amber-50/20 focus:ring-2 focus:ring-slate-900 rounded-sm" 
                    onChange={(event) => updateField("phone", event.target.value)} 
                    value={form.phone} 
                  />
                </div>
              </div>
            </section>

            {/* KANAN: Blok Alamat, Unggah Foto & Submit Perubahan */}
            <section className="border-4 border-slate-900 bg-white p-6 shadow-[5px_5px_0px_0px_rgba(15,23,42,1)] rounded-sm flex flex-col justify-between">
              <div>
                <div className="mb-6 flex items-center gap-3 border-b-2 border-dashed border-slate-200 pb-4">
                  <div className="flex h-9 w-9 items-center justify-center border-2 border-slate-900 bg-slate-900 text-white rounded-xs">
                    <MapPin size={16} />
                  </div>
                  <h2 className="text-xs font-black uppercase tracking-wider text-slate-900">ALAMAT_IDENTITAS_HUB</h2>
                </div>

                <div className="space-y-5 text-2xs font-bold uppercase tracking-wide">
                  <div className="space-y-2">
                    <label className="text-slate-500 block font-black">// REGIONAL KOTA</label>
                    <input 
                      type="text"
                      className="flex h-11 w-full border-2 border-slate-900 bg-white px-3 text-xs font-bold text-slate-900 outline-none transition-all focus:bg-amber-50/20 focus:ring-2 focus:ring-slate-900 rounded-sm" 
                      onChange={(event) => updateField("city", event.target.value)} 
                      value={form.city} 
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-slate-500 block font-black">// ALAMAT DOMISILI LENGKAP</label>
                    <textarea 
                      className="flex min-h-[100px] w-full border-2 border-slate-900 bg-white px-3 py-2.5 text-xs font-bold text-slate-900 outline-none transition-all focus:bg-amber-50/20 focus:ring-2 focus:ring-slate-900 resize-y rounded-sm" 
                      onChange={(event) => updateField("address", event.target.value)} 
                      value={form.address} 
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-slate-500 block font-black">// FOTO PROFIL MANIFES</label>
                    
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      ref={fileInputRef} 
                      onChange={handleFileChange}
                    />

                    {!photoPreview ? (
                      <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="group flex cursor-pointer flex-col items-center justify-center border-2 border-dashed border-slate-300 bg-slate-50 py-7 transition-all hover:border-slate-900 hover:bg-amber-50/20 rounded-sm"
                      >
                        <div className="mb-2 border-2 border-slate-900 bg-white p-2.5 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] rounded-xs group-hover:bg-amber-400 transition-colors">
                          <UploadCloud size={20} className="text-slate-900" />
                        </div>
                        <p className="text-3xs font-black uppercase text-slate-800 tracking-wider">UNGKAH FILE IMAGE</p>
                        <p className="mt-0.5 text-[9px] text-slate-400 uppercase font-bold">JPG, PNG / MAX_SIZE: 5 megabytes</p>
                      </div>
                    ) : (
                      <div className="border-2 border-slate-900 bg-white overflow-hidden rounded-sm shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] relative">
                        <div className="relative aspect-video w-full bg-slate-950 sm:aspect-[21/9]">
                          <img src={photoPreview} alt="Preview Foto Profil" className="object-cover w-full h-full border-b-2 border-slate-900" />
                        </div>
                        
                        <div className="absolute right-3 top-3">
                          <button 
                            type="button" 
                            onClick={removePhoto}
                            className="flex h-7 w-7 items-center justify-center border-2 border-slate-900 bg-white text-rose-600 shadow-[1px_1px_0px_0px_rgba(15,23,42,1)] hover:bg-rose-50 transition-all rounded-xs active:translate-x-[0.5px] active:translate-y-[0.5px]"
                          >
                            <X size={14} className="stroke-[2.5]" />
                          </button>
                        </div>
                        
                        <div className="bg-slate-50 px-3 py-2 flex items-center gap-2 text-3xs font-black uppercase text-slate-700">
                          <ImageIcon size={12} className="text-slate-400" />
                          <span className="truncate max-w-[280px]">{photoFile?.name || "PROFILE_PHOTO_ACTIVE.JPG"}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Blok Tombol Submit Perubahan */}
              <div className="mt-8 pt-4 border-t-2 border-dashed border-slate-200">
                <button 
                  className="flex h-12 w-full items-center justify-center gap-2 border-2 border-slate-950 bg-amber-400 font-black text-slate-950 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_rgba(15,23,42,1)] text-2xs uppercase tracking-widest transition-all rounded-sm disabled:opacity-50 disabled:cursor-not-allowed" 
                  disabled={saving} 
                  type="submit"
                >
                  {saving ? (
                    <>
                      <div className="h-4 w-4 animate-spin border-2 border-slate-950 border-t-transparent rounded-full" />
                      SYNCHRONIZING...
                    </>
                  ) : (
                    <>
                      <Save size={14} className="stroke-[2.5]" />
                      SIMPAN PERUBAHAN DATA
                    </>
                  )}
                </button>
              </div>
            </section>

          </div>
        </form>
      </div>
    </CustomerNavbarShell>
  );
}