import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date))
}

export function formatTime(date: Date | string) {
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export function formatDateTime(date: Date | string) {
  return `${formatDate(date)} ${formatTime(date)}`
}

export function truncate(text: string, length: number) {
  if (text.length <= length) return text
  return text.slice(0, length) + '...'
}
