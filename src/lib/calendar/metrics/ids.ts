export function generateMetricSlotId(): string {
  return `metric-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function generateResourceCategoryId(): string {
  return `res-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}
