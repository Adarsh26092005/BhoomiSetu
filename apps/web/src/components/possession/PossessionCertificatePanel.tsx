import * as React from 'react'
import { Award, CheckCircle2, Loader2 } from 'lucide-react'
import type { PossessionRecord } from '@/types'
import { useGenerateMockPossessionCertificate } from '@/hooks/use-possession'
import { formatDate } from '@/lib/format'
import { Button } from '@/components/ui/button'

interface PossessionCertificatePanelProps {
    record: PossessionRecord
}

export function PossessionCertificatePanel({ record }: PossessionCertificatePanelProps) {
    const { mutate: generateCert, isPending } = useGenerateMockPossessionCertificate()

    const [isModalOpen, setIsModalOpen] = React.useState(false)
    const [certRef, setCertRef] = React.useState('')
    const [remarks, setRemarks] = React.useState('')
    const [successMsg, setSuccessMsg] = React.useState<string | null>(null)

    const handleOpenModal = () => {
        setCertRef(`POS-CERT-2026-${record.district.slice(0, 2).toUpperCase()}-${Date.now().toString().slice(-4)}`)
        setRemarks('')
        setIsModalOpen(true)
    }

    const handleGenerate = (e: React.FormEvent) => {
        e.preventDefault()
        generateCert(
            { id: record.id, certificateRef: certRef, remarks },
            {
                onSuccess: () => {
                    setIsModalOpen(false)
                    setSuccessMsg('Form 22 Possession Handover Certificate successfully registered.')
                    setTimeout(() => setSuccessMsg(null), 4000)
                },
            },
        )
    }

    const hasCert = Boolean(record.certificateId || record.possessionStatus === 'CERTIFICATE_ISSUED')
    const isTaken = record.possessionStatus === 'POSSESSION_TAKEN' || record.possessionStatus === 'CERTIFICATE_PENDING'

    return (
        <div className="rounded-xl border border-ink-200 bg-paper p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-ink-100 pb-3">
                <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-terracotta-600" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-ink-700">
                        Form 22 Possession Handover Certificate
                    </h3>
                </div>

                <span className="font-mono text-xs font-semibold text-ink-700">
                    {hasCert ? (
                        <span className="text-signal-700 font-bold flex items-center gap-1">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>Certificate Issued</span>
                        </span>
                    ) : isTaken ? (
                        'Certificate Pending'
                    ) : (
                        'Awaiting Possession'
                    )}
                </span>
            </div>

            {successMsg && (
                <div className="rounded-lg border border-signal-200 bg-signal-50 p-3 text-xs text-signal-900 flex items-center gap-2 font-medium">
                    <CheckCircle2 className="h-4 w-4 text-signal-700 shrink-0" />
                    <span>{successMsg}</span>
                </div>
            )}

            {hasCert ? (
                <div className="rounded-lg border border-signal-200 bg-signal-50/50 p-4 space-y-2 text-xs text-signal-950 font-mono">
                    <div className="flex justify-between items-center">
                        <span className="font-sans text-ink-600">Certificate Reference Number:</span>
                        <strong className="text-ink-900 font-bold">{record.certificateId}</strong>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="font-sans text-ink-600">Statutory Registration Date:</span>
                        <strong className="text-ink-900">{record.certificateDate ? formatDate(record.certificateDate) : 'Registered'}</strong>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="font-sans text-ink-600">Issuing Competent Officer:</span>
                        <strong className="text-ink-900 font-sans">{record.assignedOfficer}</strong>
                    </div>
                    <div className="pt-2 border-t border-signal-200 flex items-center gap-1.5 text-signal-800 font-sans text-[11px]">
                        <CheckCircle2 className="h-4 w-4 text-signal-600" />
                        <span>Form 22 Handover Certificate signed and registered in Revenue Record Registry.</span>
                    </div>
                </div>
            ) : (
                <div className="p-5 text-center text-xs text-ink-500 bg-ink-50 rounded-lg border border-ink-100 space-y-1">
                    <p>Form 22 certificate is issued once physical possession is completed on the ground.</p>
                    {isTaken && (
                        <p className="text-terracotta-700 font-semibold">Physical possession is complete. You can now register the Form 22 certificate.</p>
                    )}
                </div>
            )}

            <div className="flex items-center justify-end pt-2 border-t border-ink-100">
                {isTaken && !hasCert && (
                    <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        disabled={isPending}
                        onClick={handleOpenModal}
                        className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
                    >
                        <Award className="h-3.5 w-3.5" />
                        <span>Issue Form 22 Certificate</span>
                    </Button>
                )}

                {hasCert && (
                    <span className="text-signal-700 font-semibold text-[11px] flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Statutory Certificate Sealed & Handed Over</span>
                    </span>
                )}
            </div>

            {/* Issue Certificate Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/50 backdrop-blur-xs">
                    <div className="w-full max-w-md bg-paper rounded-xl border border-ink-200 p-6 shadow-2xl space-y-4">
                        <div className="flex items-center gap-2.5 border-b border-ink-100 pb-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-signal-100 text-signal-900">
                                <Award className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-ink-900">Issue Form 22 Possession Certificate</h3>
                                <p className="text-[11px] text-ink-500 font-mono">Plot: {record.surveyNumber} ({record.village})</p>
                            </div>
                        </div>

                        <form onSubmit={handleGenerate} className="space-y-4 text-xs">
                            <div className="space-y-1.5">
                                <label className="font-semibold text-ink-800">Form 22 Certificate Reference Number</label>
                                <input
                                    type="text"
                                    value={certRef}
                                    onChange={(e) => setCertRef(e.target.value)}
                                    required
                                    className="h-10 w-full rounded-md border border-ink-300 px-3 font-mono text-xs text-ink-900 focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="font-semibold text-ink-800">Handover Remarks & Authority Attestation</label>
                                <textarea
                                    value={remarks}
                                    onChange={(e) => setRemarks(e.target.value)}
                                    placeholder="Enter certificate attestation memo details..."
                                    rows={3}
                                    className="w-full rounded-md border border-ink-300 p-2.5 text-xs text-ink-900 focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-2 border-t border-ink-200">
                                <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)} disabled={isPending}>
                                    Cancel
                                </Button>
                                <Button type="submit" variant="primary" size="sm" disabled={isPending} className="flex items-center gap-1.5">
                                    {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                                    <span>Register Certificate</span>
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
