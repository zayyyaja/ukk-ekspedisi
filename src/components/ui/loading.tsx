export function Spinner() {
  return <span aria-label="Memuat" className="spinner" role="status" />;
}

export function Skeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="skeleton-wrap">
      {Array.from({ length: lines }).map((_, index) => (
        <span className="skeleton" key={index} />
      ))}
    </div>
  );
}

export function LoadingState({ label = "Memuat data..." }: { label?: string }) {
  return (
    <section className="panel loading-state">
      <Spinner />
      <span>{label}</span>
    </section>
  );
}
