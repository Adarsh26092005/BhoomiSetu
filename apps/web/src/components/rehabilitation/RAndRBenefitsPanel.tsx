import * as React from 'react'
import { HeartHandshake, Plus, CheckCircle2, Edit3, Loader2 } from 'lucide-react'
import type { RAndRCase, RAndRBenefitType, RAndRBenefitStatus, RAndRBenefit } from '@/types'
import { useAddRAndRBenefit, useUpdateRAndRBenefit } from '@/hooks/use-rehabilitation'
import { R_AND_R_BENEFIT_TYPE_META, R_AND_R_BENEFIT_STATUS_META } from '@/constants/status'
import { StatusBadge } from '@/components/common/StatusBadge'
import { formatINR, formatDate } from '@/lib/format'
import { Button } from '@/components/ui/button'

interface RAndRBenefitsPanelProps {
    record: RAndRCase
}

export function RAndRBenefitsPanel({ record }: RAndRBenefitsPanelProps) {
    const { mutate: addBenefit, isPending: isAdding } = useAddRAndRBenefit()
    const { mutate: updateBenefit, isPending: isUpdating } = useUpdateRAndRBenefit()

    const [isAddModalOpen, setIsAddModalOpen] = React.useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = React.useState(false)
    const [selectedBenefit, setSelectedBenefit] = React.useState<RAndRBenefit | null>(null)

    // Add state
    const [benefitType, setBenefitType] = React.useState<RAndRBenefitType>('LIVELIHOOD_ASSISTANCE')
    const [plannedValue, setPlannedValue] = React.useState(500000)
    const [approvedValue, setApprovedValue] = React.useState(500000)
    const [officer, setOfficer] = React.useState(record.assignedOfficer ?? 'Anand Kumar')
    const [addRemarks, setAddRemarks] = React.useState('')

    // Edit state
    const [editStatus, setEditStatus] = React.useState<RAndRBenefitStatus>('DELIVERED')
    const [deliveredValue, setDeliveredValue] = React.useState(0)
    const [editRemarks, setEditRemarks] = React.useState('')
    const [successMsg, setSuccessMsg] = React.useState<string | null>(null)

    const isPending = isAdding || isUpdating

    const handleAddSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        addBenefit(
            {
                id: record.id,
                benefitType,
                plannedValue: Number(plannedValue),
                approvedValue: Number(approvedValue),
                responsibleOfficer: officer,
                remarks: addRemarks,
            },
            {
                onSuccess: () => {
                    setIsAddModalOpen(false)
                    setAddRemarks('')
                    setSuccessMsg('Benefit package item successfully scheduled.')
                    setTimeout(() => setSuccessMsg(null), 4000)
                },
            },
        )
    }

    const handleOpenEdit = (ben: RAndRBenefit) => {
        setSelectedBenefit(ben)
        setEditStatus(ben.status)
        setDeliveredValue(ben.deliveredValue || ben.approvedValue)
        setEditRemarks(ben.remarks ?? '')
        setIsEditModalOpen(true)
    }

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedBenefit) return

        updateBenefit(
            {
                id: record.id,
                benefitId: selectedBenefit.id,
                status: editStatus,
                deliveredValue: Number(deliveredValue),
                deliveryDate: editStatus === 'DELIVERED' || editStatus === 'VERIFIED' ? new Date().toISOString().split('T')[0] : undefined,
                verificationDate: editStatus === 'VERIFIED' ? new Date().toISOString().split('T')[0] : undefined,
                remarks: editRemarks,
            },
            {
                onSuccess: () => {
                    setIsEditModalOpen(false)
                    setSelectedBenefit(null)
                    setSuccessMsg('Benefit delivery progress updated.')
                    setTimeout(() => setSuccessMsg(null), 4000)
                },
            },
        )
    }

    return (
        <div className="rounded-xl border border-ink-200 bg-paper p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-ink-100 pb-3">
                <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded bg-ink-100 text-ink-700">
                        <HeartHandshake className="h-4 w-4" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-ink-900">R&R Assistance & Benefit Delivery</h3>
                        <p className="text-[11px] text-ink-500">
                            Approved rehabilitation grants, housing allowances, and shifting assistance
                        </p>
                    </div>
                </div>

                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isPending || record.rAndRStatus === 'ON_HOLD' || record.rAndRStatus === 'DISPUTED'}
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
                >
                    <Plus className="h-3.5 w-3.5 text-terracotta-600" />
                    <span>Add Benefit Item</span>
                </Button>
            </div>

            {successMsg && (
                <div className="rounded-lg border border-signal-200 bg-signal-50 p-3 text-xs text-signal-900 flex items-center gap-2 font-medium">
                    <CheckCircle2 className="h-4 w-4 text-signal-700 shrink-0" />
                    <span>{successMsg}</span>
                </div>
            )}

            {record.benefits.length === 0 ? (
                <div className="p-6 text-center text-xs text-ink-500 bg-ink-50 rounded-lg border border-ink-100">
                    No benefit line items recorded. Click "Add Benefit Item" to configure assistance values.
                </div>
            ) : (
                <div className="space-y-3">
                    {record.benefits.map((ben) => {
                        const meta = R_AND_R_BENEFIT_TYPE_META[ben.benefitType]
                        const isDelivered = ben.status === 'DELIVERED' || ben.status === 'VERIFIED'

                        return (
                            <div
                                key={ben.id}
                                className="rounded-lg border border-ink-100 bg-ink-50/40 p-3.5 text-xs space-y-2"
                            >
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <div className="space-y-0.5">
                                        <span className="font-bold text-ink-900 text-xs block">
                                            {meta ? meta.label : ben.benefitType.replace(/_/g, ' ')}
                                        </span>
                                        <span className="text-[10px] text-ink-500 font-mono">
                                            Officer: {ben.responsibleOfficer}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <StatusBadge status={ben.status} type="randr-benefit" />
                                        <button
                                            type="button"
                                            onClick={() => handleOpenEdit(ben)}
                                            className="rounded p-1 text-ink-500 hover:bg-ink-200 hover:text-ink-900 transition-colors cursor-pointer"
                                            title="Update status"
                                        >
                                            <Edit3 className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-2 text-[11px] font-mono pt-1 border-t border-ink-100">
                                    <div>
                                        <span className="text-ink-400 block text-[10px]">Planned Value</span>
                                        <span className="font-bold text-ink-800">{formatINR(ben.plannedValue)}</span>
                                    </div>
                                    <div>
                                        <span className="text-ink-400 block text-[10px]">Approved Value</span>
                                        <span className="font-bold text-ink-900">{formatINR(ben.approvedValue)}</span>
                                    </div>
                                    <div>
                                        <span className="text-ink-400 block text-[10px]">Delivered Value</span>
                                        <span className={`font-bold ${isDelivered ? 'text-signal-700' : 'text-amber-700'}`}>
                                            {formatINR(ben.deliveredValue)}
                                        </span>
                                    </div>
                                </div>

                                {ben.deliveryDate && (
                                    <div className="flex items-center justify-between text-[10px] text-ink-500 font-mono">
                                        <span>Delivery Date: {formatDate(ben.deliveryDate)}</span>
                                        {ben.verificationDate && <span className="text-signal-700">Verified: {formatDate(ben.verificationDate)}</span>}
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            )}

            {/* Add Benefit Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/50 backdrop-blur-xs">
                    <div className="w-full max-w-md bg-paper rounded-xl border border-ink-200 p-6 shadow-2xl space-y-4">
                        <div className="flex items-center gap-2.5 border-b border-ink-100 pb-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-ink-100 text-ink-900">
                                <HeartHandshake className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-ink-900">Add R&R Benefit Item</h3>
                                <p className="text-[11px] text-ink-500 font-mono">Case ID: {record.id}</p>
                            </div>
                        </div>

                        <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
                            <div className="space-y-1.5">
                                <label className="font-semibold text-ink-800">Benefit Type</label>
                                <select
                                    value={benefitType}
                                    onChange={(e) => setBenefitType(e.target.value as RAndRBenefitType)}
                                    className="h-10 w-full rounded-md border border-ink-300 px-3 text-xs text-ink-900 focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
                                >
                                    {Object.entries(R_AND_R_BENEFIT_TYPE_META).map(([k, m]) => (
                                        <option key={k} value={k}>{m.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <label className="font-semibold text-ink-800">Planned Value (₹)</label>
                                    <input
                                        type="number"
                                        value={plannedValue}
                                        onChange={(e) => setPlannedValue(Number(e.target.value))}
                                        required
                                        className="h-10 w-full rounded-md border border-ink-300 px-3 font-mono text-xs text-ink-900 focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="font-semibold text-ink-800">Approved Value (₹)</label>
                                    <input
                                        type="number"
                                        value={approvedValue}
                                        onChange={(e) => setApprovedValue(Number(e.target.value))}
                                        required
                                        className="h-10 w-full rounded-md border border-ink-300 px-3 font-mono text-xs text-ink-900 focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="font-semibold text-ink-800">Responsible Officer</label>
                                <input
                                    type="text"
                                    value={officer}
                                    onChange={(e) => setOfficer(e.target.value)}
                                    required
                                    className="h-10 w-full rounded-md border border-ink-300 px-3 text-xs text-ink-900 focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="font-semibold text-ink-800">Approval / Disbursement Notes</label>
                                <textarea
                                    value={addRemarks}
                                    onChange={(e) => setAddRemarks(e.target.value)}
                                    rows={2}
                                    className="w-full rounded-md border border-ink-300 p-2 text-xs text-ink-900 focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-2 border-t border-ink-200">
                                <Button type="button" variant="outline" size="sm" onClick={() => setIsAddModalOpen(false)} disabled={isPending}>
                                    Cancel
                                </Button>
                                <Button type="submit" variant="primary" size="sm" disabled={isPending} className="flex items-center gap-1.5">
                                    {isAdding && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                                    <span>Register Benefit</span>
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Benefit Modal */}
            {isEditModalOpen && selectedBenefit && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/50 backdrop-blur-xs">
                    <div className="w-full max-w-md bg-paper rounded-xl border border-ink-200 p-6 shadow-2xl space-y-4">
                        <div className="flex items-center gap-2.5 border-b border-ink-100 pb-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-signal-100 text-signal-900">
                                <Edit3 className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-ink-900">Update Benefit Delivery Status</h3>
                                <p className="text-[11px] text-ink-500 font-mono">{selectedBenefit.benefitType.replace(/_/g, ' ')}</p>
                            </div>
                        </div>

                        <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
                            <div className="space-y-1.5">
                                <label className="font-semibold text-ink-800">Delivery Status</label>
                                <select
                                    value={editStatus}
                                    onChange={(e) => setEditStatus(e.target.value as RAndRBenefitStatus)}
                                    className="h-10 w-full rounded-md border border-ink-300 px-3 text-xs text-ink-900 focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
                                >
                                    {Object.entries(R_AND_R_BENEFIT_STATUS_META).map(([k, m]) => (
                                        <option key={k} value={k}>{m.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="font-semibold text-ink-800">Delivered Financial Value (₹)</label>
                                <input
                                    type="number"
                                    value={deliveredValue}
                                    onChange={(e) => setDeliveredValue(Number(e.target.value))}
                                    required
                                    className="h-10 w-full rounded-md border border-ink-300 px-3 font-mono text-xs text-ink-900 focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="font-semibold text-ink-800">Delivery Remarks</label>
                                <textarea
                                    value={editRemarks}
                                    onChange={(e) => setEditRemarks(e.target.value)}
                                    rows={2}
                                    className="w-full rounded-md border border-ink-300 p-2 text-xs text-ink-900 focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-2 border-t border-ink-200">
                                <Button type="button" variant="outline" size="sm" onClick={() => setIsEditModalOpen(false)} disabled={isPending}>
                                    Cancel
                                </Button>
                                <Button type="submit" variant="primary" size="sm" disabled={isPending} className="flex items-center gap-1.5">
                                    {isUpdating && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                                    <span>Update Status</span>
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
