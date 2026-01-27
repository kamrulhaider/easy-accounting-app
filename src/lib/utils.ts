import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number | null | undefined, currency: string = 'USD', options?: { compact?: boolean }): string {
    if (amount === null || amount === undefined) return "-";

    const code = (currency || 'USD').toUpperCase();
    const { compact } = options || {};

    // Special handling for BDT to ensure correct symbol is displayed in UI
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

/**
 * Formats currency for export (PDF/Excel) using ISO codes instead of symbols
 * to avoid encoding/font issues (e.g. BDT symbol missing in standard PDF fonts).
 */
export function formatCurrencyForExport(amount: number | null | undefined, currency: string = 'USD'): string {
    if (amount === null || amount === undefined) return "-";
    const code = (currency || 'USD').toUpperCase();

    try {
        // Use currencyDisplay: 'code' to get "USD 100.00" instead of "$100.00"
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: code,
            currencyDisplay: 'code'
        }).format(amount);
    } catch (e) {
        return `${code} ${amount.toFixed(2)}`;
    }
}
