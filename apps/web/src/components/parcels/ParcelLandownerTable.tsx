import { Users, CheckCircle2, AlertCircle, Clock, ShieldCheck, CreditCard } from 'lucide-react'
import type { Landowner } from '@/types'
import { formatINR } from '@/lib/format'

interface ParcelLandownerTableProps {
    owners: Landowner[]
    totalCompensationInr: number
}

export function ParcelLandownerTable({ owners, totalCompensationInr }: ParcelLandownerTableProps) {
    return (
        <div className="rounded-xl border border-ink-200 bg-paper shadow-xs overflow-hidden space-y-0">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-5 border-b border-ink-200 bg-paper">
                <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded bg-ink-900 text-paper">
                        <Users className="h-4 w-4" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-ink-900">Registered Landowners & Title Shares</h3>
                        <p className="text-[11px] text-ink-500">
                            Co-owners, title verification status, and direct DBT compensation distribution
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 text-xs">
                    <span className="rounded bg-ink-100 px-2.5 py-1 font-mono font-semibold text-ink-800 border border-ink-200">
                        {owners.length} Registered {owners.length === 1 ? 'Owner' : 'Co-Owners'}
                    </span>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                    <thead>
                        <tr className="border-b border-ink-200 bg-ink-50/70 text-[11px] font-bold text-ink-600 uppercase tracking-wider">
                            <th scope="col" className="py-3 px-4">Landowner Name</th>
                            <th scope="col" className="py-3 px-4">Father / Spouse</th>
                            <th scope="col" className="py-3 px-4">Aadhaar Reference</th>
                            <th scope="col" className="py-3 px-4 text-center">Plot Share (%)</th>
                            <th scope="col" className="py-3 px-4 text-right">Compensation Share</th>
                            <th scope="col" className="py-3 px-4 text-center">Verification</th>
                            <th scope="col" className="py-3 px-4 text-center">DBT Escrow Link</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-ink-100 font-sans">
                        {owners.map((owner) => {
                            const compShare = owner.compensationAmountInr ?? (totalCompensationInr * (owner.shareInParcelPercent / 100))

                            return (
                                <tr key={owner.id} className="hover:bg-ink-50/40 transition-colors">
                                    {/* Name */}
                                    <td className="py-3 px-4 font-semibold text-ink-900">
                                        {owner.fullName}
                                        <span className="text-[10px] font-normal text-ink-400 block font-mono">
                                            ID: {owner.id}
                                        </span>
                                    </td>

                                    {/* Relationship */}
                                    <td className="py-3 px-4 text-ink-700">{owner.fatherOrSpouseName}</td>

                                    {/* Masked Aadhaar */}
                                    <td className="py-3 px-4 font-mono text-ink-600 text-[11px]">
                                        XXXX-XXXX-{owner.aadhaarLast4}
                                    </td>

                                    {/* Share % */}
                                    <td className="py-3 px-4 text-center font-mono font-bold text-ink-900">
                                        <span className="rounded bg-ink-100 px-2 py-0.5 text-xs">
                                            {owner.shareInParcelPercent}%
                                        </span>
                                    </td>

                                    {/* Compensation Share */}
                                    <td className="py-3 px-4 text-right font-mono font-bold text-ink-900 text-xs">
                                        {formatINR(compShare)}
                                    </td>

                                    {/* Verification Status */}
                                    <td className="py-3 px-4 text-center">
                                        {owner.verificationStatus === 'VERIFIED' ? (
                                            <span className="inline-flex items-center gap-1 rounded bg-signal-50 px-2 py-0.5 text-[10px] font-semibold text-signal-700 border border-signal-200">
                                                <CheckCircle2 className="h-3 w-3" />
                                                <span>Verified</span>
                                            </span>
                                        ) : owner.verificationStatus === 'DISPUTED' ? (
                                            <span className="inline-flex items-center gap-1 rounded bg-rust-50 px-2 py-0.5 text-[10px] font-semibold text-rust-700 border border-rust-200">
                                                <AlertCircle className="h-3 w-3" />
                                                <span>Disputed</span>
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 rounded bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-800 border border-amber-200">
                                                <Clock className="h-3 w-3" />
                                                <span>Pending</span>
                                            </span>
                                        )}
                                    </td>

                                    {/* Bank Linkage */}
                                    <td className="py-3 px-4 text-center">
                                        {owner.bankAccountLinked ? (
                                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-signal-700">
                                                <ShieldCheck className="h-3.5 w-3.5" />
                                                <span>Seeded (PFMS)</span>
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-ink-400">
                                                <CreditCard className="h-3.5 w-3.5" />
                                                <span>Pending Bank</span>
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
