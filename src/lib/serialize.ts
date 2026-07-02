export function toJsonSafe<T>(value: T) {
  return JSON.parse(
    JSON.stringify(value, (_key, currentValue: unknown) => {
      if (typeof currentValue === "bigint") {
        return currentValue.toString();
      }

      return currentValue;
    }),
  ) as T;
}

export function paginationMeta(total: number, page: number, limit: number) {
  return {
    page,
    perPage: limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
}
