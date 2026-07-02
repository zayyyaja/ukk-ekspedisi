"use client";

import { useEffect, useState, useRef } from "react";
import { User, MapPin, UploadCloud, X, Image as ImageIcon, Save } from "lucide-react";

import { CustomerNavbarShell } from "@/components/customer/customer-navbar-shell";
import { apiPatch } from "@/lib/api-client";
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
      let finalPhotoUrl = form.photo;
      
      // Upload file if selected
      if (photoFile) {
        const formData = new FormData();
        formData.append("file", photoFile);
        
        const uploadRes = await fetch("/api/v1/upload", {
          method: "POST",
          body: formData,
        });
        const uploadData = await uploadRes.json();
        
        if (!uploadRes.ok) {
          throw new Error(uploadData.message || "Gagal mengunggah foto profil");
        }
        
        finalPhotoUrl = uploadData.data.url;
      }

      await apiPatch("/api/v1/customer/profile", {
        name: form.name,
        phone: form.phone,
        address: form.address,
        city: form.city,
        photo: finalPhotoUrl || null,
      });
      
      // Update local state to reflect new photo URL
      updateField("photo", finalPhotoUrl);
      setPhotoFile(null); // Clear file so we don't upload again
      
      setMessage("Profile berhasil diperbarui.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (currentError) {
      setError(currentError instanceof Error ? currentError.message : "Gagal menyimpan profile.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <CustomerNavbarShell>
      <div className="mx-auto max-w-5xl">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Profil Saya</h1>
          <p className="mt-2 text-lg text-slate-500">Kelola informasi data diri dan alamat Anda.</p>
        </header>

        {message && (
          <div className="mb-8 rounded-lg border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-800 shadow-sm">
            {message}
          </div>
        )}
        {error && (
          <div className="mb-8 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800 shadow-sm">
            {error}
          </div>
        )}

        <form onSubmit={submit} className="space-y-8">
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Kiri: Data Pribadi */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="mb-6 flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                  <User size={20} />
                </div>
                <h2 className="text-xl font-bold text-slate-900">Data Pribadi</h2>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Nama Lengkap</label>
                  <input 
                    className="flex h-12 w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm transition-colors focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20" 
                    onChange={(event) => updateField("name", event.target.value)} 
                    value={form.name} 
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Email</label>
                  <input 
                    className="flex h-12 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-500 cursor-not-allowed" 
                    readOnly 
                    value={form.email} 
                  />
                  <p className="text-xs text-slate-400">Email tidak dapat diubah.</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Nomor Telepon</label>
                  <input 
                    className="flex h-12 w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm transition-colors focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20" 
                    onChange={(event) => updateField("phone", event.target.value)} 
                    value={form.phone} 
                  />
                </div>
              </div>
            </section>

            {/* Kanan: Alamat, Foto & Submit */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 flex flex-col">
              <div className="mb-6 flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                  <MapPin size={20} />
                </div>
                <h2 className="text-xl font-bold text-slate-900">Alamat & Identitas</h2>
              </div>

              <div className="space-y-6 flex-grow">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Kota</label>
                  <input 
                    className="flex h-12 w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm transition-colors focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20" 
                    onChange={(event) => updateField("city", event.target.value)} 
                    value={form.city} 
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Alamat Lengkap</label>
                  <textarea 
                    className="flex min-h-[100px] w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm transition-colors focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 resize-y" 
                    onChange={(event) => updateField("address", event.target.value)} 
                    value={form.address} 
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Foto Profil</label>
                  
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
                      className="group flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 py-8 transition-colors hover:border-orange-500 hover:bg-orange-50"
                    >
                      <div className="mb-3 rounded-full bg-white p-3 shadow-sm group-hover:bg-orange-100 group-hover:text-orange-600 transition-colors">
                        <UploadCloud size={24} className="text-slate-400 group-hover:text-orange-600" />
                      </div>
                      <p className="text-sm font-medium text-slate-700 group-hover:text-orange-700">Klik untuk unggah foto profil</p>
                      <p className="mt-1 text-xs text-slate-400">JPG, PNG, maksimal 5MB</p>
                    </div>
                  ) : (
                    <div className="relative overflow-hidden rounded-xl border border-slate-200">
                      <div className="relative aspect-video w-full sm:aspect-[21/9]">
                        <img src={photoPreview} alt="Preview Foto Profil" className="object-cover w-full h-full" />
                      </div>
                      <div className="absolute right-3 top-3">
                        <button 
                          type="button" 
                          onClick={removePhoto}
                          className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-red-600 shadow-sm backdrop-blur-sm hover:bg-red-50 transition-colors"
                        >
                          <X size={16} />
                        </button>
                      </div>
                      <div className="bg-slate-50 px-4 py-3 border-t border-slate-200 flex items-center gap-2">
                        <ImageIcon size={16} className="text-slate-400" />
                        <span className="text-sm font-medium text-slate-700 truncate">{photoFile?.name || "Foto Profil Tersimpan"}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100">
                <button 
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-4 text-sm font-bold text-white shadow-lg shadow-orange-500/30 transition-all hover:bg-orange-600 hover:shadow-orange-500/40 disabled:opacity-70 disabled:cursor-not-allowed" 
                  disabled={saving} 
                  type="submit"
                >
                  {saving ? (
                    <>
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      Simpan Perubahan
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
