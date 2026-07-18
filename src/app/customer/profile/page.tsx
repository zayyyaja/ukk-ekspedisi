"use client";

import { useEffect, useState, useRef } from "react";
import { User, MapPin, UploadCloud, X, Image as ImageIcon, Save, ShieldAlert, AlertTriangle, CheckCircle } from "lucide-react";

import { apiPatchForm, ApiClientError } from "@/lib/api-client";
import { getCurrentUser } from "@/lib/auth-client";
import { FormField, FormTextarea } from "@/components/ui/form-system";
import { BentoHeader } from "@/components/customer/bento-header";

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
    <div className="w-full font-body">
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-12 gap-6 mb-8">
        <BentoHeader />
      </div>
      <div className="mx-auto max-w-5xl font-body pb-16 p-4 sm:p-6 lg:p-8">
        {/* Header Section */}
        <header className="mb-10">
          <h1 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">My Profile</h1>
          <p className="mt-2 text-sm font-medium text-muted">
            Manage your personal information and delivery address.
          </p>
        </header>

        {/* Message Banner Status */}
        {message && (
          <div className="mb-8 border border-green-500/20 bg-green-500/10 p-4 text-sm font-medium text-green-700 rounded-xl flex items-center gap-3">
            <CheckCircle size={18} className="shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {error && (
          <div className="mb-8 border border-destructive/20 bg-destructive/5 p-4 text-sm font-medium text-destructive rounded-xl flex items-center gap-3">
            <AlertTriangle size={18} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={submit} className="space-y-8">
          <div className="grid gap-8 lg:grid-cols-2">
            
            {/* KIRI: Blok Form Data Pribadi */}
            <section className="border border-border/50 bg-surface/80 backdrop-blur-xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl">
              <div className="mb-8 flex items-center gap-4 border-b border-border/60 pb-5">
                <div className="flex h-12 w-12 items-center justify-center bg-primary/10 text-primary rounded-xl">
                  <User size={20} />
                </div>
                <h2 className="text-lg font-semibold text-ink">Personal Data</h2>
              </div>

              <div className="space-y-6">
                <FormField 
                  label="Full Name" 
                  value={form.name} 
                  onChange={(event) => updateField("name", event.target.value)} 
                />
                
                <div className="grid gap-2">
                  <FormField 
                    label="Email" 
                    value={form.email} 
                    readOnly 
                    className="bg-surface/50 text-slate-400 cursor-not-allowed"
                  />
                  <p className="text-[11px] font-medium text-muted flex items-center gap-1.5 mt-0.5">
                    <ShieldAlert size={14} />
                    Registered email cannot be changed.
                  </p>
                </div>

                <FormField 
                  label="Phone Number" 
                  value={form.phone} 
                  onChange={(event) => updateField("phone", event.target.value)} 
                />
              </div>
            </section>

            {/* KANAN: Blok Alamat, Unggah Foto & Submit Perubahan */}
            <section className="border border-border/50 bg-surface/80 backdrop-blur-xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl flex flex-col justify-between">
              <div>
                <div className="mb-8 flex items-center gap-4 border-b border-border/60 pb-5">
                  <div className="flex h-12 w-12 items-center justify-center bg-primary/10 text-primary rounded-xl">
                    <MapPin size={20} />
                  </div>
                  <h2 className="text-lg font-semibold text-ink">Address & Shipping</h2>
                </div>

                <div className="space-y-6">
                  <FormField 
                    label="City" 
                    value={form.city} 
                    onChange={(event) => updateField("city", event.target.value)} 
                  />

                  <FormTextarea 
                    label="Full Address" 
                    value={form.address} 
                    onChange={(event) => updateField("address", event.target.value)} 
                  />

                  <div className="grid gap-2">
                    <span className="text-sm font-semibold text-ink">Profile Picture</span>
                    
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
                        className="group flex cursor-pointer flex-col items-center justify-center border-2 border-dashed border-border/60 bg-background/50 py-10 transition-all hover:border-primary/50 hover:bg-primary/5 rounded-2xl"
                      >
                        <div className="mb-4 bg-surface p-4 shadow-sm rounded-xl group-hover:bg-primary group-hover:text-primary-foreground transition-colors text-muted border border-border/60 group-hover:border-primary">
                          <UploadCloud size={28} />
                        </div>
                        <p className="text-sm font-semibold text-ink">Upload Photo</p>
                        <p className="mt-1 text-xs font-medium text-muted">JPG, PNG / Max 5MB</p>
                      </div>
                    ) : (
                      <div className="border border-border/60 bg-background/50 overflow-hidden rounded-2xl shadow-sm relative">
                        <div className="relative aspect-video w-full sm:aspect-[21/9]">
                          <img src={photoPreview} alt="Profile Preview" className="object-cover w-full h-full border-b border-border/60" />
                        </div>
                        
                        <div className="absolute right-4 top-4">
                          <button 
                            type="button" 
                            onClick={removePhoto}
                            className="flex h-10 w-10 items-center justify-center bg-white/90 backdrop-blur-md text-destructive hover:bg-destructive hover:text-white transition-all rounded-xl shadow-sm"
                          >
                            <X size={18} />
                          </button>
                        </div>
                        
                        <div className="bg-surface/50 px-5 py-4 flex items-center gap-3 text-xs font-medium text-muted">
                          <ImageIcon size={16} />
                          <span className="truncate">{photoFile?.name || "Current profile picture"}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Blok Tombol Submit Perubahan */}
              <div className="mt-10 pt-8 border-t border-border/60">
                <button 
                  className="flex h-14 w-full items-center justify-center gap-2 bg-primary text-primary-foreground font-semibold text-base transition-all hover:bg-primary/90 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed shadow-sm" 
                  disabled={saving} 
                  type="submit"
                >
                  {saving ? (
                    <>
                      <div className="h-6 w-6 animate-spin border-2 border-white/30 border-t-white rounded-full" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={20} />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </section>

          </div>
        </form>
      </div>
    </div>
  );
}