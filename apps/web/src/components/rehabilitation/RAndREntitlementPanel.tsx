import * as React from 'react'
import { Award, Plus, CheckCircle2, Loader2, AlertCircle } from 'lucide-react'
import type { RAndRCase, RAndRBenefitType } from '@/types'
import { useDefineEntitlement } from '@/hooks/use-rehabilitation'
import { R_AND_R_BENEFIT_TYPE_META } from '@/constants/status'
import { Button } from '@/components/ui/button'

interface RAndREntitlementPanelProps {
    record: RAndRCase
}

export function RAndREntitlementPanel({ record }: RAndREntitlementPanelProps) {
    const { mutate: defineEntitlement, isPending } = useDefineEntitlement()

    const [isModalOpen, setIsModalOpen] = React.useState(false)
    const [entitlementType, setEntitlementType] = React.useState<RAndRBenefitType>('HOUSING_ASSISTANCE')
    const [description, setDescription] = React.useState('Pucca Constructed House Unit (50 sq.m)')
    const [quantityValue, setQuantityValue] = React.useState('1 Constructed Unit')
    const [remarks, setRemarks] = React.useState('')
    const [successMsg, setSuccessMsg] = React.useState<string | null>(null)

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        defineEntitlement(
            {
                id: record.id,
                entitlementType,
                description,
                quantityValue,
                remarks,
            },
            {
                onSuccess: () => {
                    setIsModalOpen(false)
                    setDescription('')
                    setQuantityValue('')
                    setRemarks('')
                    setSuccessMsg('Entitlement successfully added to R&R plan.')
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
                        <Award className="h-4 w-4" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-ink-900">Defined Entitlement Matrix</h3>
                        <p className="text-[11px] text-ink-500">
                            Second Schedule RFCTLARR statutory entitlement packages defined for this household
                        </p>
                    </div>
                </div>

                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isPending || record.rAndRStatus === 'ON_HOLD' || record.rAndRStatus === 'DISPUTED'}
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
                >
                    <Plus className="h-3.5 w-3.5 text-terracotta-600" />
                    <span>Define Entitlement</span>
                </Button>
            </div>

            {successMsg && (
                <div className="rounded-lg border border-signal-200 bg-signal-50 p-3 text-xs text-signal-900 flex items-center gap-2 font-medium">
                    <CheckCircle2 className="h-4 w-4 text-signal-700 shrink-0" />
                    <span>{successMsg}</span>
                </div>
            )}

            {record.entitlements.length === 0 ? (
                <div className="p-6 text-center text-xs text-ink-500 bg-ink-50 rounded-lg border border-ink-100 space-y-1">
                    <p>No entitlements have been formally defined for this household yet.</p>
                    <p className="text-[11px] text-ink-400">Complete eligibility assessment to prepare the statutory entitlement plan.</p>
                </div>
            ) : (
                <div className="space-y-2.5">
                    {record.entitlements.map((ent) => {
                        const meta = R_AND_R_BENEFIT_TYPE_META[ent.entitlementType]
                        return (
                            <div
                                key={ent.id}
                                className="rounded-lg border border-ink-100 bg-ink-50/40 p-3.5 text-xs space-y-1.5"
                            >
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <span className="rounded bg-ink-100 px-2 py-0.5 text-[10px] font-bold text-ink-800 border border-ink-200">
                                        {meta ? meta.label : ent.entitlementType.replace(/_/g, ' ')}
                                    </span>
                                    <span className="font-mono text-xs font-bold text-signal-800">
                                        {ent.quantityValue ?? 'Statutory Provision'}
                                    </span>
                                </div>

                                <p className="font-semibold text-ink-900 text-xs">{ent.description}</p>

                                {ent.approvalReference && (
                                    <div className="flex items-center justify-between text-[11px] text-ink-500 font-mono pt-1 border-t border-ink-100">
                                        <span>Approval Ref: {ent.approvalReference}</span>
                                        <span className="text-signal-700 font-bold uppercase">{ent.status}</span>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            )}

            {/* Define Entitlement Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/50 backdrop-blur-xs">
                    <div className="w-full max-w-md bg-paper rounded-xl border border-ink-200 p-6 shadow-2xl space-y-4">
                        <div className="flex items-center gap-2.5 border-b border-ink-100 pb-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-ink-100 text-ink-900">
                                <Award className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-ink-900">Define Statutory Entitlement</h3>
                                <p className="text-[11px] text-ink-500 font-mono">Case ID: {record.id}</p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                            <div className="space-y-1.5">
                                <label className="font-semibold text-ink-800">Entitlement Category</label>
                                <select
                                    value={entitlementType}
                                    onChange={(e) => setEntitlementType(e.target.value as RAndRBenefitType)}
                                    className="h-10 w-full rounded-md border border-ink-300 px-3 text-xs text-ink-900 focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
                                >
                                    {Object.entries(R_AND_R_BENEFIT_TYPE_META).map(([k, m]) => (
                                        <option key={k} value={k}>{m.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="font-semibold text-ink-800">Entitlement Description</label>
                                <input
                                    type="text"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    required
                                    className="h-10 w-full rounded-md border border-ink-300 px-3 text-xs text-ink-900 focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="font-semibold text-ink-800">Quantity / Financial Scale</label>
                                <input
                                    type="text"
                                    value={quantityValue}
                                    onChange={(e) => setQuantityValue(e.target.value)}
                                    placeholder="e.g. 1 Constructed House Unit / ₹5,00,000 / 1 Trainee"
                                    className="h-10 w-full rounded-md border border-ink-300 px-3 text-xs text-ink-900 focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="font-semibold text-ink-800">Legal Reference & Remarks</label>
                                <textarea
                                    value={remarks}
                                    onChange={(e) => setRemarks(e.target.value)}
                                    placeholder="Enter reference to Second Schedule provisions..."
                                    rows={2}
                                    className="w-full rounded-md border border-ink-300 p-2 text-xs text-ink-900 focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
                                />
                            </div>

                            <div className="flex items-center gap-1 text-[11px] text-ink-500">
                                <AlertCircle className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                                <span>Operational entitlement record for demo project plan.</span>
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-2 border-t border-ink-200">
                                <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)} disabled={isPending}>
                                    Cancel
                                </Button>
                                <Button type="submit" variant="primary" size="sm" disabled={isPending} className="flex items-center gap-1.5">
                                    {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                                    <span>Register Entitlement</span>
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
