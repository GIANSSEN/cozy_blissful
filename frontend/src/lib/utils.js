import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merges Tailwind class names safely, resolving conflicts.
 * Drop-in replacement for shadcn's cn() utility.
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
