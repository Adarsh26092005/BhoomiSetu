import { Users, ShieldCheck, Home, Briefcase, FileText, AlertTriangle } from 'lucide-react'
import type { AffectedHousehold } from '@/types'

interface AffectedHouseholdCardProps {
    household: AffectedHousehold
}

export function AffectedHouseholdCard({ household }: AffectedHouseholdCardProps) {
    return (
        <div className="rounded-xl border border-ink-200 bg-paper p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-ink-100 pb-3">
                <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-terracotta-600" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-ink-700">
                        Affected Household Profile
                    </h3>
                </div>

                <span className="font-mono text-xs font-bold text-ink-900 bg-ink-100 px-2 py-0.5 rounded border border-ink-200">
                    {household.householdReference}
                </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                <div className="rounded-lg bg-ink-50 p-3 border border-ink-200 space-y-0.5">
                    <span className="text-[10px] text-ink-500 font-medium">Household Census Size</span>
                    <span className="font-mono font-bold text-sm text-ink-900 block flex items-center gap-1">
                        <Users className="h-3.5 w-3.5 text-ink-600" />
                        <span>{household.familySize} Members</span>
                    </span>
                    <span className="text-[10px] text-ink-500 block">
                        {household.affectedMembers} Physically Displaced
                    </span>
                </div>

                <div className="rounded-lg bg-ink-50 p-3 border border-ink-200 space-y-0.5">
                    <span className="text-[10px] text-ink-500 font-medium">Vulnerable Members</span>
                    <span className="font-mono font-bold text-sm text-ink-900 block flex items-center gap-1">
                        <ShieldCheck className="h-3.5 w-3.5 text-amber-600" />
                        <span>{household.vulnerableMemberCount} Persons</span>
                    </span>
                    <span className="text-[10px] text-ink-500 block">
                        Senior citizens / PwD / Minors
                    </span>
                </div>

                <div className="rounded-lg bg-ink-50 p-3 border border-ink-200 space-y-0.5">
                    <span className="text-[10px] text-ink-500 font-medium">Primary Livelihood Base</span>
                    <span className="font-semibold text-ink-900 block text-xs truncate flex items-center gap-1" title={household.livelihoodType}>
                        <Briefcase className="h-3.5 w-3.5 text-ink-600 shrink-0" />
                        <span>{household.livelihoodType}</span>
                    </span>
                    <span className="text-[10px] text-signal-700 block font-medium">
                        Displacement Affected
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-lg border border-ink-100 bg-ink-50/40">
                    <span className="text-ink-600 flex items-center gap-1.5">
                        <Home className="h-3.5 w-3.5 text-ink-500" />
                        <span>Physical Relocation Required:</span>
                    </span>
                    <span className={`font-bold ${household.relocationRequired ? 'text-amber-800' : 'text-ink-700'}`}>
                        {household.relocationRequired ? 'Yes (Displaced Family)' : 'No (In-situ Assistance)'}
                    </span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg border border-ink-100 bg-ink-50/40">
                    <span className="text-ink-600 flex items-center gap-1.5">
                        <FileText className="h-3.5 w-3.5 text-ink-500" />
                        <span>Documentation Scrutiny:</span>
                    </span>
                    <span className="font-bold flex items-center gap-1">
                        {household.documentationStatus === 'COMPLETE' ? (
                            <span className="text-signal-700 flex items-center gap-1">
                                <ShieldCheck className="h-3.5 w-3.5" />
                                <span>Verified Complete</span>
                            </span>
                        ) : household.documentationStatus === 'DISCREPANCY' ? (
                            <span className="text-rust-700 flex items-center gap-1">
                                <AlertTriangle className="h-3.5 w-3.5" />
                                <span>Discrepancy Flagged</span>
                            </span>
                        ) : (
                            <span className="text-amber-800">Pending Certificates</span>
                        )}
                    </span>
                </div>
            </div>
        </div>
    )
}
