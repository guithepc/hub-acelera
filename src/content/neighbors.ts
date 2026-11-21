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
  const letter = (word: string | undefined) =>
    /^\p{L}/u.test(word ?? "") ? (Array.from(word ?? "")[0] ?? "") : "";
  const named = words.filter((word) => letter(word) !== "");
  const first = letter(named[0]);
  const last = named.length > 1 ? letter(named.at(-1)) : "";
  return (first + last).toUpperCase();
}
