"use client";

export function FilterBar({
  search,
  onSearch,
  children,
}: {
  search?: string;
  onSearch?: (value: string) => void;
  children?: React.ReactNode;
}) {
  return (
    <section className="panel staff-filter">
      {onSearch && (
        <input
          className="input"
          onChange={(event) => onSearch(event.target.value)}
          placeholder="Cari data"
          value={search ?? ""}
        />
      )}
      {children}
    </section>
  );
}
