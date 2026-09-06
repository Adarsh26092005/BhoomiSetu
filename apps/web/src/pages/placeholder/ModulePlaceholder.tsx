import type { LucideIcon } from 'lucide-react'
import { Sparkles, Construction } from 'lucide-react'

interface ModulePlaceholderProps {
    title: string
    subtitle: string
    icon: LucideIcon
    badgeText?: string
    features?: string[]
}

export function ModulePlaceholder({
    title,
    subtitle,
    icon: Icon,
    badgeText = 'Under Development',
    features = [],
}: ModulePlaceholderProps) {
    return (
        <div className="space-y-6">
            {/* Header Banner */}
            <div className="rounded-lg border border-ink-200 bg-paper p-6 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-ink-900 text-paper shadow-xs">
                            <Icon className="h-6 w-6" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-xl font-bold tracking-tight text-ink-900">{title}</h1>
                                <span className="rounded bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700 border border-amber-200">
                                    {badgeText}
                                </span>
                            </div>
                            <p className="mt-1 text-xs text-ink-500 max-w-2xl">{subtitle}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Planned Architecture / Content Box */}
            <div className="rounded-lg border border-dashed border-ink-300 bg-paper/60 p-8 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-ink-100 text-ink-600 mb-3">
                    <Construction className="h-6 w-6 text-terracotta-600" />
                </div>
                <h2 className="text-base font-semibold text-ink-900">Module Architecture Initialized</h2>
                <p className="mt-1 text-xs text-ink-500 max-w-md mx-auto">
                    The routing, access guards, and data contracts for this domain are active. Full interactive features will be connected in subsequent steps.
                </p>

                {features.length > 0 && (
                    <div className="mt-6 inline-block text-left bg-paper border border-ink-200 rounded-lg p-4 shadow-xs">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-ink-400 mb-2 flex items-center gap-1.5">
                            <Sparkles className="h-3.5 w-3.5 text-terracotta-600" />
                            Planned Capabilities
                        </p>
                        <ul className="space-y-1.5 text-xs text-ink-700">
                            {features.map((feat) => (
                                <li key={feat} className="flex items-center gap-2">
                                    <span className="h-1.5 w-1.5 rounded-full bg-terracotta-500" />
                                    <span>{feat}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    )
}
