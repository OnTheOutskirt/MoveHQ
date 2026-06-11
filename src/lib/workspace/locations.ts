export function generateLocationId(): string {
  return `loc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}
