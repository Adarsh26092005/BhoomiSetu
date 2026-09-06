import type { LucideIcon } from 'lucide-react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface KpiCardProps {
    title: string
    value: string | number
    unit?: string
    subtitle?: string
    change?: {
        value: string | number
        direction: 'up' | 'down' | 'neutral'
        period?: string
    }
    icon: LucideIcon
    accentColor?: 'ink' | 'terracotta' | 'signal' | 'amber' | 'rust'
    className?: string
}

export function KpiCard({
    title,
    value,
    unit,
    subtitle,
    change,
    icon: Icon,
    accentColor = 'ink',
    className,
}: KpiCardProps) {
    const iconColors = {
        ink: 'bg-ink-100 text-ink-900 border-ink-200',
        terracotta: 'bg-terracotta-50 text-terracotta-700 border-terracotta-200',
        signal: 'bg-signal-50 text-signal-700 border-signal-200',
        amber: 'bg-amber-50 text-amber-700 border-amber-200',
        rust: 'bg-rust-50 text-rust-700 border-rust-200',
    }[accentColor]

    return (
        <div
            className={cn(
                'group relative flex flex-col justify-between rounded-xl border border-ink-200 bg-paper p-4 sm:p-5 shadow-xs transition-all hover:border-ink-300 hover:shadow-sm',
                className,
            )}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                    <p className="text-[11px] font-semibold tracking-wider uppercase text-ink-500">{title}</p>
                    <div className="flex items-baseline gap-1.5 flex-wrap">
                        <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-ink-900 font-mono">
                            {value}
                        </span>
                        {unit && <span className="text-xs font-semibold text-ink-500">{unit}</span>}
                    </div>
                </div>

                <div
                    className={cn(
                        'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border transition-transform group-hover:scale-105',
                        iconColors,
                    )}
                >
                    <Icon className="h-5 w-5" />
                </div>
            </div>

            {(subtitle || change) && (
                <div className="mt-3 pt-3 border-t border-ink-100 flex items-center justify-between text-[11px] text-ink-500 gap-2">
                    {subtitle && <span className="truncate">{subtitle}</span>}
                    {change && (
                        <span
                            className={cn(
                                'inline-flex items-center gap-0.5 font-semibold shrink-0',
                                change.direction === 'up' && 'text-signal-700',
                                change.direction === 'down' && 'text-rust-700',
                                change.direction === 'neutral' && 'text-ink-600',
                            )}
                        >
                            {change.direction === 'up' && <TrendingUp className="h-3 w-3" />}
                            {change.direction === 'down' && <TrendingDown className="h-3 w-3" />}
                            {change.direction === 'neutral' && <Minus className="h-3 w-3" />}
                            <span>{change.value}</span>
                            {change.period && <span className="text-[10px] text-ink-400 font-normal">({change.period})</span>}
                        </span>
                    )}
                </div>
            )}
        </div>
    )
}
