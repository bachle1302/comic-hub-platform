export function formatCompactNumber(value: number): string {
  return new Intl.NumberFormat("vi-VN", {
    compactDisplay: "short",
    maximumFractionDigits: 1,
    notation: "compact",
  }).format(value);
}

export function formatDate(value: string): string {
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}
