/**
 * Formats a number as Indian Rupees using the en-IN lakh/crore grouping.
 * NLAMS deals in project budgets and compensation amounts, so this is
 * used throughout dashboards and tables.
 */
export function formatINR(amount: number, options?: { compact?: boolean }) {
    if (options?.compact) {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            notation: 'compact',
            maximumFractionDigits: 1,
        }).format(amount)
    }

    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(amount)
}

export function formatArea(hectares: number) {
    return `${new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(hectares)} ha`
}

export function formatDate(value: string | Date) {
    const date = typeof value === 'string' ? new Date(value) : value
    return new Intl.DateTimeFormat('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(date)
}

export function formatDateTime(value: string | Date) {
    const date = typeof value === 'string' ? new Date(value) : value
    return new Intl.DateTimeFormat('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(date)
}

export function initials(name: string) {
    return name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join('')
}