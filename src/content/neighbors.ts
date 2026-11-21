export function neighbors<T>(
  items: readonly T[],
  index: number,
): { previous: T; next: T } | undefined {
  if (items.length < 2) return undefined;
  const previous = items.at(index - 1);
  const next = items[(index + 1) % items.length];
  if (previous === undefined || next === undefined) return undefined;
  return { previous, next };
}

export function initials(name: string): string {
  const words = name.trim().split(/\s+/);
  const first = words[0]?.[0] ?? "";
  const last = words.length > 1 ? (words.at(-1)?.[0] ?? "") : "";
  return (first + last).toUpperCase();
}
