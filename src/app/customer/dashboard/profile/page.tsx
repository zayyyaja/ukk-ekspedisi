"use client";

import { useEffect, useState } from "react";

import { useOnlineStatus } from "@/hooks/use-online-status";
import { getCurrentUser } from "@/lib/auth-client";
import { getCachedProfile, saveProfile } from "@/lib/offline-profile";

export default function CustomerProfilePage() {
  const [user, setUser] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [offlineSavedAt, setOfflineSavedAt] = useState("");
  const online = useOnlineStatus();

  useEffect(() => {
    if (!online) {
      getCachedProfile()
        .then((cached) => {
          if (cached) {
            setUser(cached.data);
            setOfflineSavedAt(cached.savedAt);
          } else {
            setError("Belum ada profile tersimpan untuk mode offline.");
          }
        })
        .finally(() => setLoading(false));
      return;
    }

    getCurrentUser()
      .then((response) => {
        setUser(response.data);
        setOfflineSavedAt(new Date().toISOString());
        void saveProfile(response.data);
      })
      .catch((currentError) =>
        setError(currentError instanceof Error ? currentError.message : "Gagal memuat profile."),
      )
      .finally(() => setLoading(false));
  }, [online]);

  return (
    <section className="content">
      <div className="page-head">
        <div>
          <h1>Profile</h1>
          <p className="subtitle">Data akun customer yang sedang login.</p>
          {offlineSavedAt && !online && (
            <p className="muted">Profile terakhir tersimpan: {offlineSavedAt}</p>
          )}
        </div>
      </div>
      {loading && <div className="panel">Memuat profile...</div>}
      {error && <div className="alert error">{error}</div>}
      {user && (
        <section className="panel form-grid">
          {["name", "email", "phone", "city", "address", "photo"].map((key) => (
            <div className="field" key={key}>
              <label>{key}</label>
              <input className="input" readOnly value={String(user[key] ?? "-")} />
            </div>
          ))}
          <p className="muted">Edit profile belum diaktifkan karena endpoint update profile belum tersedia.</p>
        </section>
      )}
    </section>
  );
}
