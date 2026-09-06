export interface ApiError {
    statusCode: number
    message: string
    path?: string
}

export interface PaginatedResult<T> {
    items: T[]
    page: number
    pageSize: number
    totalItems: number
    totalPages: number
}

export interface KpiSummary {
    label: string
    value: number
    unit?: 'INR' | 'HECTARE' | 'COUNT' | 'PERCENT'
    deltaPercent?: number
    trend?: 'UP' | 'DOWN' | 'FLAT'
}