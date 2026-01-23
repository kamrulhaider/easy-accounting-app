import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number | null | undefined, currency: string = 'USD', options?: { compact?: boolean }): string {
    if (amount === null || amount === undefined) return "-";

    const code = (currency || 'USD').toUpperCase();
    const { compact } = options || {};

    // Special handling for BDT to ensure correct symbol is displayed
    if (code === 'BDT') {
        return '৳' + new Intl.NumberFormat('en-US', {
            minimumFractionDigits: compact ? 0 : 2,
            maximumFractionDigits: compact ? 1 : 2,
            notation: compact ? "compact" : undefined,
        }).format(amount);
    }

    // Check if currency code is valid, fallback to USD if potentially problematic
    try {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: code,
            minimumFractionDigits: compact ? 0 : 2,
            maximumFractionDigits: compact ? 1 : 2,
            notation: compact ? "compact" : undefined,
        }).format(amount);
    } catch (e) {
        // Fallback to USD if custom currency code is invalid
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: compact ? 0 : 2,
            maximumFractionDigits: compact ? 1 : 2,
            notation: compact ? "compact" : undefined,
        }).format(amount);
    }
}
