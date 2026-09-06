import { Home, MapPin, CheckCircle2, Clock } from 'lucide-react'
import type { ResettlementSite } from '@/types'
import { formatDate } from '@/lib/format'

interface ResettlementSiteCardProps {
    site?: ResettlementSite
    relocationRequired: boolean
}

export function ResettlementSiteCard({ site, relocationRequired }: ResettlementSiteCardProps) {
    if (!relocationRequired) {
        return (
            <div className="rounded-xl border border-ink-200 bg-paper p-5 shadow-xs space-y-2">
                <div className="flex items-center gap-2 border-b border-ink-100 pb-3">
                    <Home className="h-4 w-4 text-ink-500" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-ink-700">
                        Resettlement Site Allotment
                    </h3>
                </div>
                <p className="text-xs text-ink-500">
                    No physical resettlement site allocation required. Household receives in-situ livelihood support.
                </p>
            </div>
        )
    }

    if (!site) {
        return (
            <div className="rounded-xl border border-ink-200 bg-paper p-5 shadow-xs space-y-2">
                <div className="flex items-center gap-2 border-b border-ink-100 pb-3">
                    <Home className="h-4 w-4 text-terracotta-600" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-ink-700">
                        Resettlement Site Allotment
                    </h3>
                </div>
                <div className="p-4 text-center text-xs text-ink-500 bg-ink-50 rounded-lg border border-ink-100">
                    Site allocation is currently pending in the Model Township master layout.
                </div>
            </div>
        )
    }

    return (
        <div className="rounded-xl border border-ink-200 bg-paper p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-ink-100 pb-3">
                <div className="flex items-center gap-2">
                    <Home className="h-4 w-4 text-terracotta-600" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-ink-700">
                        Designated Resettlement Site
                    </h3>
                </div>

                <span className="font-mono text-xs font-bold text-terracotta-700 bg-terracotta-50 px-2 py-0.5 rounded border border-terracotta-200">
                    {site.siteReference}
                </span>
            </div>

            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-4 text-xs">
                <div className="sm:col-span-2">
                    <dt className="text-ink-400 font-medium text-[11px]">Township Site Location</dt>
                    <dd className="font-semibold text-ink-900 mt-0.5 flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-terracotta-600 shrink-0" />
                        <span>{site.location}</span>
                    </dd>
                </div>

                <div>
                    <dt className="text-ink-400 font-medium text-[11px]">Allotment Date</dt>
                    <dd className="font-mono font-bold text-ink-900 mt-0.5">
                        {site.allocationDate ? formatDate(site.allocationDate) : 'In Allocation'}
                    </dd>
                </div>

                <div>
                    <dt className="text-ink-400 font-medium text-[11px]">Infrastructure Readiness</dt>
                    <dd className="font-semibold mt-0.5 flex items-center gap-1">
                        {site.infrastructureReadiness === 'READY' ? (
                            <span className="text-signal-700 font-bold flex items-center gap-1">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                <span>Civil & Utilities Ready</span>
                            </span>
                        ) : (
                            <span className="text-amber-800 flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5" />
                                <span>Work In Progress</span>
                            </span>
                        )}
                    </dd>
                </div>

                <div className="sm:col-span-2">
                    <dt className="text-ink-400 font-medium text-[11px]">Handover Status</dt>
                    <dd className="font-semibold text-ink-900 mt-0.5">
                        {site.handoverStatus === 'HANDED_OVER' ? (
                            <span className="inline-flex items-center gap-1 rounded bg-signal-50 px-2 py-0.5 text-xs font-bold text-signal-800 border border-signal-200">
                                <CheckCircle2 className="h-3.5 w-3.5 text-signal-600" />
                                <span>Plot Keys Handed Over to Beneficiary</span>
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1 rounded bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-800 border border-amber-200">
                                <span>Handover Scheduled upon Relocation</span>
                            </span>
                        )}
                    </dd>
                </div>
            </dl>
        </div>
    )
}
