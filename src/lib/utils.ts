import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Keeps only digits and a single decimal point, so weight can never end up as unparseable garbage. */
export function sanitizeDecimal(value: string): string {
  const cleaned = value.replace(/[^\d.]/g, "");
  const firstDot = cleaned.indexOf(".");
  if (firstDot === -1) return cleaned;
  return cleaned.slice(0, firstDot + 1) + cleaned.slice(firstDot + 1).replace(/\./g, "");
}

/** Keeps only digits, so reps can never end up as unparseable garbage. */
export function sanitizeInt(value: string): string {
  return value.replace(/\D/g, "");
}
