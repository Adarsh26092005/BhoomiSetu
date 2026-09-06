import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merge Tailwind class names safely, resolving conflicting utility classes
 * (e.g. "px-2 px-4" -> "px-4"). Used by every UI primitive.
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}