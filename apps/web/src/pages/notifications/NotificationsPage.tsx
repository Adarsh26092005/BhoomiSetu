import { Bell } from 'lucide-react'
import { ModulePlaceholder } from '@/pages/placeholder/ModulePlaceholder'

export function NotificationsPage() {
    return (
        <ModulePlaceholder
            title="System Notifications & Statutory Alerts"
            subtitle="Real-time alerts for objection deadlines, high-risk delays, stay orders, and disbursement approvals."
            icon={Bell}
            badgeText="System Hub"
            features={[
                'Categorized alerts: Statutory Deadlines, Fund Disbursals, Court Orders, and Survey Approvals',
                'SMS & Email gateway broadcast logs for affected landholders',
                'Role-specific notification inbox with actionable resolve buttons',
                'Historical alert archive with filter by project and date range',
            ]}
        />
    )
}
