import type { AppNotification, AuditLogEntry } from '@/types'

export const MOCK_NOTIFICATIONS: AppNotification[] = [
    {
        id: 'ntf-1',
        title: 'Objection window closing',
        message: 'RRTS-DSJ-CORR objection period ends in 4 days across 3 villages.',
        severity: 'WARNING',
        isRead: false,
        createdAt: '2026-09-01T09:12:00+05:30',
        projectId: 'prj-002',
    },
    {
        id: 'ntf-2',
        title: 'Compensation disbursed',
        message: '₹4.2 Cr released to 86 landowners under NH-548-BYPASS.',
        severity: 'INFO',
        isRead: false,
        createdAt: '2026-08-30T16:40:00+05:30',
        projectId: 'prj-001',
    },
    {
        id: 'ntf-3',
        title: 'Court stay order received',
        message: 'MEDARAM-IRR-2 possession activity paused pending High Court review.',
        severity: 'CRITICAL',
        isRead: true,
        createdAt: '2026-08-27T11:05:00+05:30',
        projectId: 'prj-003',
    },
    {
        id: 'ntf-4',
        title: 'Survey report uploaded',
        message: 'DMIC-NODE-7 drone survey report v2 submitted for review.',
        severity: 'INFO',
        isRead: true,
        createdAt: '2026-08-25T14:22:00+05:30',
        projectId: 'prj-004',
    },
]

export const MOCK_AUDIT_LOG: AuditLogEntry[] = [
    {
        id: 'aud-1',
        actorName: 'R. Venkatesh',
        actorRole: 'Land Acquisition Officer',
        action: 'APPROVED_COMPENSATION',
        entityType: 'CompensationRecord',
        entityId: 'cmp-8841',
        timestamp: '2026-09-01T10:02:00+05:30',
    },
    {
        id: 'aud-2',
        actorName: 'S. Fathima',
        actorRole: 'District Collector',
        action: 'ISSUED_AWARD',
        entityType: 'AcquisitionProject',
        entityId: 'prj-004',
        timestamp: '2026-08-31T17:45:00+05:30',
    },
    {
        id: 'aud-3',
        actorName: 'A. Deshmukh',
        actorRole: 'Surveyor',
        action: 'UPLOADED_DOCUMENT',
        entityType: 'ProjectDocument',
        entityId: 'doc-2291',
        timestamp: '2026-08-31T09:18:00+05:30',
    },
]