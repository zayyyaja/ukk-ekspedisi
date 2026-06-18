import { Inbox } from "lucide-react";

export function EmptyState({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <section className="panel empty-state">
      <Inbox size={32} />
      <h2>{title}</h2>
      {description && <p className="muted">{description}</p>}
    </section>
  );
}
