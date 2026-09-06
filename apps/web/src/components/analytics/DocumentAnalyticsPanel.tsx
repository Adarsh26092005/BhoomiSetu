import { useNavigate } from 'react-router-dom'
import { FileStack, CheckCircle2, Clock, XCircle, ExternalLink } from 'lucide-react'
import type { DocumentAnalytics } from '@/types/analytics'
import { ROUTES } from '@/constants/routes'
import { Button } from '@/components/ui/button'

interface DocumentAnalyticsPanelProps {
    documents: DocumentAnalytics
}

export function DocumentAnalyticsPanel({ documents }: DocumentAnalyticsPanelProps) {
    const navigate = useNavigate()

    return (
        <div className="rounded-xl border border-ink-200 bg-paper p-5 shadow-xs space-y-4 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-ink-100 pb-3">
                <div className="space-y-0.5">
                    <h3 className="text-sm font-bold text-ink-900 flex items-center gap-2">
                        <FileStack className="h-4 w-4 text-terracotta-600" />
                        <span>Document Scrutiny & Vault Verification Register</span>
                    </h3>
                    <p className="text-[11px] text-ink-500">
                        Title deeds, gazette notifications, survey maps, and revenue records in cryptographic vault
                    </p>
                </div>

                <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={() => navigate(ROUTES.documents)}
                    className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer shrink-0"
                >
                    <span>View Document Register</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                </Button>
            </div>

            {/* Top Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-lg bg-ink-50 p-3 border border-ink-200 space-y-0.5">
                    <span className="text-[10px] text-ink-500 font-bold uppercase tracking-wider block">
                        Vault Records
                    </span>
                    <span className="font-mono text-lg font-black text-ink-900 block">
                        {documents.totalDocuments}
                    </span>
                    <span className="text-[10px] text-ink-500">SHA-256 Verified</span>
                </div>

                <div className="rounded-lg bg-signal-50/60 p-3 border border-signal-200 space-y-0.5">
                    <span className="text-[10px] text-signal-800 font-bold uppercase tracking-wider block flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3 text-signal-600" />
                        <span>Verified Deeds</span>
                    </span>
                    <span className="font-mono text-lg font-black text-signal-950 block">
                        {documents.verifiedCount} ({documents.verificationRatePercentage}%)
                    </span>
                    <span className="text-[10px] text-signal-700">Legally cleared</span>
                </div>

                <div className="rounded-lg bg-amber-50/60 p-3 border border-amber-200 space-y-0.5">
                    <span className="text-[10px] text-amber-800 font-bold uppercase tracking-wider block flex items-center gap-1">
                        <Clock className="h-3 w-3 text-amber-600" />
                        <span>Pending Scrutiny</span>
                    </span>
                    <span className="font-mono text-lg font-black text-amber-950 block">
                        {documents.pendingCount}
                    </span>
                    <span className="text-[10px] text-amber-700">Under SDM inspection</span>
                </div>

                <div className="rounded-lg bg-rust-50/60 p-3 border border-rust-200 space-y-0.5">
                    <span className="text-[10px] text-rust-800 font-bold uppercase tracking-wider block flex items-center gap-1">
                        <XCircle className="h-3 w-3 text-rust-600" />
                        <span>Rejected / Defective</span>
                    </span>
                    <span className="font-mono text-lg font-black text-rust-950 block">
                        {documents.rejectedCount}
                    </span>
                    <span className="text-[10px] text-rust-700">Notice issued to owner</span>
                </div>
            </div>

            {/* Document Category Distribution */}
            <div className="space-y-2 pt-2">
                <span className="font-bold text-ink-800 block text-xs">
                    Document Category Distribution:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {documents.documentsByCategory.map((cat) => (
                        <div
                            key={cat.category}
                            className="rounded-lg border border-ink-100 bg-ink-50/50 p-2.5 space-y-1"
                        >
                            <span className="font-semibold text-ink-900 block truncate">
                                {cat.category}
                            </span>
                            <span className="font-mono text-xs font-bold text-terracotta-700">
                                {cat.count} Files
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
