"use client";

export function ConfirmDialog({
  open,
  title,
  message,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  title: string;
  message: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!open) {
    return null;
  }

  return (
    <div className="modal-backdrop">
      <section className="auth-card">
        <h2>{title}</h2>
        <p className="subtitle">{message}</p>
        <div className="page-head">
          <button className="button secondary" onClick={onCancel} type="button">Batal</button>
          <button className="button danger" onClick={onConfirm} type="button">Ya, lanjut</button>
        </div>
      </section>
    </div>
  );
}
