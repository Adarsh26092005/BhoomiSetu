import * as React from 'react'
import { MapPin, CheckCircle2, Clock, AlertTriangle, Loader2 } from 'lucide-react'
import type { PossessionRecord, SiteVerificationResult } from '@/types'
import { useRecordSiteVerification } from '@/hooks/use-possession'
import { formatDate } from '@/lib/format'
import { Button } from '@/components/ui/button'

interface SiteVerificationPanelProps {
    record: PossessionRecord
}

export function SiteVerificationPanel({ record }: SiteVerificationPanelProps) {
    const { mutate: recordVerification, isPending } = useRecordSiteVerification()

    const [isModalOpen, setIsModalOpen] = React.useState(false)
    const [visitDate, setVisitDate] = React.useState(new Date().toISOString().split('T')[0])
    const [officer, setOfficer] = React.useState(record.assignedOfficer ?? 'Anand Kumar')
    const [result, setResult] = React.useState<SiteVerificationResult>('VERIFIED')
    const [observations, setObservations] = React.useState(
        'All 4 boundary stones pegged with differential GPS survey. No physical encumbrances or unauthorized construction remaining.',
    )
    const [remarks, setRemarks] = React.useState('')
    const [successMsg, setSuccessMsg] = React.useState<string | null>(null)

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        recordVerification(
            { id: record.id, visitDate, officer, result, observations, remarks },
            {
                onSuccess: () => {
                    setIsModalOpen(false)
                    setSuccessMsg('On-ground DGPS site verification observations successfully logged.')
                    setTimeout(() => setSuccessMsg(null), 4000)
                },
            },
        )
    }

    const hasVerification = Boolean(record.siteVerificationDate)

    return (
        <div className="rounded-xl border border-ink-200 bg-paper p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-ink-100 pb-3">
                <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-terracotta-600" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-ink-700">
                        On-Ground Site Demarcation & Verification
                    </h3>
                </div>

                <span className="font-mono text-xs font-semibold text-ink-700">
                    {hasVerification ? (
                        <span className="text-signal-700 font-bold flex items-center gap-1">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>Verification Recorded</span>
                        </span>
                    ) : (
                        'Verification Pending'
                    )}
                </span>
            </div>

            {successMsg && (
                <div className="rounded-lg border border-signal-200 bg-signal-50 p-3 text-xs text-signal-900 flex items-center gap-2 font-medium">
                    <CheckCircle2 className="h-4 w-4 text-signal-700 shrink-0" />
                    <span>{successMsg}</span>
                </div>
            )}

            {hasVerification ? (
                <div className="space-y-3 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="rounded-lg bg-ink-50 p-3 border border-ink-100">
                            <span className="text-[10px] text-ink-400 block font-medium">Inspection Date & Officer</span>
                            <strong className="text-ink-900 block mt-0.5">
                                {formatDate(record.siteVerificationDate!)} • {record.siteVerificationOfficer ?? record.assignedOfficer}
                            </strong>
                        </div>

                        <div className="rounded-lg bg-ink-50 p-3 border border-ink-100">
                            <span className="text-[10px] text-ink-400 block font-medium">Verification Result</span>
                            <span className="font-bold flex items-center gap-1 mt-0.5">
                                {record.siteVerificationResult === 'VERIFIED' ? (
                                    <span className="text-signal-700 flex items-center gap-1">
                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                        <span>Verified & Clear</span>
                                    </span>
                                ) : record.siteVerificationResult === 'BLOCKED' ? (
                                    <span className="text-rust-700 flex items-center gap-1">
                                        <AlertTriangle className="h-3.5 w-3.5" />
                                        <span>Blocked / Obstruction</span>
                                    </span>
                                ) : (
                                    <span className="text-amber-800 flex items-center gap-1">
                                        <Clock className="h-3.5 w-3.5" />
                                        <span>Requires Re-Survey</span>
                                    </span>
                                )}
                            </span>
                        </div>
                    </div>

                    {record.siteObservations && (
                        <div className="rounded-lg border border-ink-200 bg-ink-50/50 p-3 space-y-1">
                            <span className="text-[11px] font-bold text-ink-700 block">DGPS Surveyor Field Observations:</span>
                            <p className="text-ink-800 text-[11px] leading-relaxed">{record.siteObservations}</p>
                        </div>
                    )}
                </div>
            ) : (
                <div className="p-5 text-center text-xs text-ink-500 bg-ink-50 rounded-lg border border-ink-100 space-y-2">
                    <p>No joint site verification record found for cadastral plot {record.surveyNumber}.</p>
                </div>
            )}

            <div className="flex items-center justify-end pt-2 border-t border-ink-100">
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isPending || record.possessionStatus === 'ON_HOLD' || record.possessionStatus === 'DISPUTED'}
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
                >
                    <MapPin className="h-3.5 w-3.5 text-terracotta-600" />
                    <span>{hasVerification ? 'Update Site Inspection' : 'Record Site Verification'}</span>
                </Button>
            </div>

            {/* Record Verification Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/50 backdrop-blur-xs">
                    <div className="w-full max-w-md bg-paper rounded-xl border border-ink-200 p-6 shadow-2xl space-y-4">
                        <div className="flex items-center gap-2.5 border-b border-ink-100 pb-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-ink-100 text-ink-900">
                                <MapPin className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-ink-900">Record Cadastral Site Verification</h3>
                                <p className="text-[11px] text-ink-500 font-mono">Plot: {record.surveyNumber} ({record.village})</p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                            <div className="space-y-1.5">
                                <label className="font-semibold text-ink-800">Inspection Visit Date</label>
                                <input
                                    type="date"
                                    value={visitDate}
                                    onChange={(e) => setVisitDate(e.target.value)}
                                    required
                                    className="h-10 w-full rounded-md border border-ink-300 px-3 font-mono text-xs text-ink-900 focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="font-semibold text-ink-800">Verifying Survey Officer</label>
                                <input
                                    type="text"
                                    value={officer}
                                    onChange={(e) => setOfficer(e.target.value)}
                                    required
                                    className="h-10 w-full rounded-md border border-ink-300 px-3 text-xs text-ink-900 focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="font-semibold text-ink-800">Verification Result</label>
                                <select
                                    value={result}
                                    onChange={(e) => setResult(e.target.value as SiteVerificationResult)}
                                    className="h-10 w-full rounded-md border border-ink-300 px-3 text-xs text-ink-900 focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
                                >
                                    <option value="VERIFIED">VERIFIED (Boundary Clear & Pegged)</option>
                                    <option value="REQUIRES_REVIEW">REQUIRES_REVIEW (Minor Overlap / Culvert)</option>
                                    <option value="BLOCKED">BLOCKED (Physical Encroachment / Stay)</option>
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="font-semibold text-ink-800">DGPS Field Demarcation Observations</label>
                                <textarea
                                    value={observations}
                                    onChange={(e) => setObservations(e.target.value)}
                                    rows={3}
                                    required
                                    className="w-full rounded-md border border-ink-300 p-2.5 text-xs text-ink-900 focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="font-semibold text-ink-800">Operational Remarks</label>
                                <textarea
                                    value={remarks}
                                    onChange={(e) => setRemarks(e.target.value)}
                                    placeholder="Enter additional inspection notes or survey team details..."
                                    rows={2}
                                    className="w-full rounded-md border border-ink-300 p-2 text-xs text-ink-900 focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-2 border-t border-ink-200">
                                <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)} disabled={isPending}>
                                    Cancel
                                </Button>
                                <Button type="submit" variant="primary" size="sm" disabled={isPending} className="flex items-center gap-1.5">
                                    {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                                    <span>Log Site Verification</span>
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
