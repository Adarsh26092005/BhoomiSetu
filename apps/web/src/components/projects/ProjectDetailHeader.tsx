import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  FileStack,
  Flag,
  GitBranch,
  HeartHandshake,
  Layers,
  Loader2,
  Map,
  MapPin,
  Send,
  Wallet,
  X,
} from 'lucide-react';
import type { AcquisitionProject, ProjectStatus } from '@/types';
import { StatusBadge } from '@/components/common/StatusBadge';
import { formatDate } from '@/lib/format';
import { ROUTES } from '@/constants/routes';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth.store';
import { useUpdateProjectStatus } from '@/hooks/use-projects';

function getAuthorizedTransitions(
  role?: string,
  accountType?: string,
  currentStatus?: ProjectStatus,
): ProjectStatus[] {
  if (!currentStatus) return [];
  const isPia =
    accountType === 'PIA_USER' || role === 'PROJECT_IMPLEMENTING_AGENCY';

  if (isPia) {
    if (currentStatus === 'DRAFT') {
      return ['SUBMITTED', 'ON_HOLD'];
    }
    // After SUBMITTED, all government transitions are locked/read-only for PIA
    return [];
  }

  // Government Officer / Competent Authority Role Mappings
  switch (currentStatus) {
    case 'SUBMITTED':
      if (
        [
          'LAND_ACQUISITION_OFFICER',
          'DISTRICT_OFFICER',
          'STATE_OFFICER',
          'CENTRAL_OFFICER',
          'SUPER_ADMIN',
        ].includes(role || '')
      ) {
        return ['UNDER_SCRUTINY', 'ON_HOLD', 'REJECTED'];
      }
      return [];
    case 'UNDER_SCRUTINY':
      if (
        [
          'LAND_ACQUISITION_OFFICER',
          'VERIFICATION_OFFICER',
          'DISTRICT_OFFICER',
          'STATE_OFFICER',
          'CENTRAL_OFFICER',
          'SUPER_ADMIN',
        ].includes(role || '')
      ) {
        return ['DOCUMENT_VERIFICATION', 'DISTRICT_APPROVAL', 'ON_HOLD', 'REJECTED'];
      }
      return [];
    case 'DOCUMENT_VERIFICATION':
      if (
        [
          'LAND_ACQUISITION_OFFICER',
          'VERIFICATION_OFFICER',
          'DISTRICT_OFFICER',
          'STATE_OFFICER',
          'CENTRAL_OFFICER',
          'SUPER_ADMIN',
        ].includes(role || '')
      ) {
        return [
          'DISTRICT_APPROVAL',
          'STATE_APPROVAL',
          'NOTIFICATION_ISSUED',
          'ON_HOLD',
          'REJECTED',
        ];
      }
      return [];
    case 'DISTRICT_APPROVAL':
      if (
        [
          'DISTRICT_OFFICER',
          'LAND_ACQUISITION_OFFICER',
          'STATE_OFFICER',
          'CENTRAL_OFFICER',
          'SUPER_ADMIN',
        ].includes(role || '')
      ) {
        return ['STATE_APPROVAL', 'NOTIFICATION_ISSUED', 'ON_HOLD', 'REJECTED'];
      }
      return [];
    case 'STATE_APPROVAL':
      if (
        ['STATE_OFFICER', 'CENTRAL_OFFICER', 'SUPER_ADMIN'].includes(
          role || '',
        )
      ) {
        return ['CENTRAL_APPROVAL', 'NOTIFICATION_ISSUED', 'ON_HOLD', 'REJECTED'];
      }
      return [];
    case 'CENTRAL_APPROVAL':
      if (['CENTRAL_OFFICER', 'SUPER_ADMIN'].includes(role || '')) {
        return ['NOTIFICATION_ISSUED', 'ON_HOLD', 'REJECTED'];
      }
      return [];
    case 'NOTIFICATION_ISSUED':
      if (
        [
          'LAND_ACQUISITION_OFFICER',
          'DISTRICT_OFFICER',
          'STATE_OFFICER',
          'CENTRAL_OFFICER',
          'SUPER_ADMIN',
        ].includes(role || '')
      ) {
        return ['AWARD_DECLARED', 'ON_HOLD', 'REJECTED'];
      }
      return [];
    case 'AWARD_DECLARED':
      if (
        [
          'LAND_ACQUISITION_OFFICER',
          'FINANCE_OFFICER',
          'DISTRICT_OFFICER',
          'STATE_OFFICER',
          'CENTRAL_OFFICER',
          'SUPER_ADMIN',
        ].includes(role || '')
      ) {
        return ['COMPENSATION_ASSESSED', 'ON_HOLD', 'REJECTED'];
      }
      return [];
    case 'COMPENSATION_ASSESSED':
      if (
        [
          'FINANCE_OFFICER',
          'DISTRICT_OFFICER',
          'STATE_OFFICER',
          'CENTRAL_OFFICER',
          'SUPER_ADMIN',
        ].includes(role || '')
      ) {
        return [
          'COMPENSATION_DISBURSED',
          'POSSESSION_PENDING',
          'ON_HOLD',
          'REJECTED',
        ];
      }
      return [];
    case 'COMPENSATION_DISBURSED':
      if (
        [
          'LAND_ACQUISITION_OFFICER',
          'FINANCE_OFFICER',
          'DISTRICT_OFFICER',
          'STATE_OFFICER',
          'CENTRAL_OFFICER',
          'SUPER_ADMIN',
        ].includes(role || '')
      ) {
        return ['POSSESSION_PENDING', 'POSSESSION_COMPLETED', 'ON_HOLD'];
      }
      return [];
    case 'POSSESSION_PENDING':
      if (
        [
          'LAND_ACQUISITION_OFFICER',
          'DISTRICT_OFFICER',
          'STATE_OFFICER',
          'CENTRAL_OFFICER',
          'SUPER_ADMIN',
        ].includes(role || '')
      ) {
        return ['POSSESSION_COMPLETED', 'ON_HOLD'];
      }
      return [];
    case 'POSSESSION_COMPLETED':
      if (
        [
          'R_AND_R_OFFICER',
          'LAND_ACQUISITION_OFFICER',
          'DISTRICT_OFFICER',
          'STATE_OFFICER',
          'CENTRAL_OFFICER',
          'SUPER_ADMIN',
        ].includes(role || '')
      ) {
        return ['R_AND_R_IN_PROGRESS', 'COMPLETED', 'ON_HOLD'];
      }
      return [];
    case 'R_AND_R_IN_PROGRESS':
      if (
        [
          'R_AND_R_OFFICER',
          'LAND_ACQUISITION_OFFICER',
          'DISTRICT_OFFICER',
          'STATE_OFFICER',
          'CENTRAL_OFFICER',
          'SUPER_ADMIN',
        ].includes(role || '')
      ) {
        return ['COMPLETED', 'ON_HOLD'];
      }
      return [];
    case 'ON_HOLD':
      if (
        [
          'LAND_ACQUISITION_OFFICER',
          'DISTRICT_OFFICER',
          'STATE_OFFICER',
          'CENTRAL_OFFICER',
          'SUPER_ADMIN',
        ].includes(role || '')
      ) {
        return [
          'DRAFT',
          'SUBMITTED',
          'UNDER_SCRUTINY',
          'DISTRICT_APPROVAL',
          'REJECTED',
        ];
      }
      return [];
    case 'REJECTED':
      return [];
    case 'COMPLETED':
      return [];
    default:
      return [];
  }
}

interface ProjectDetailHeaderProps {
  project: AcquisitionProject;
}

export function ProjectDetailHeader({ project }: ProjectDetailHeaderProps) {
  const navigate = useNavigate();
  const session = useAuthStore((state) => state.session);
  const user = session?.user;
  const isViewer = user?.role === 'VIEWER';
  const isPiaUser =
    user?.accountType === 'PIA_USER' ||
    user?.role === 'PROJECT_IMPLEMENTING_AGENCY';

  const updateStatusMutation = useUpdateProjectStatus();
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [selectedStatus, setSelectedStatus] = React.useState<ProjectStatus | ''>('');
  const [remarks, setRemarks] = React.useState('');
  const [rejectionReason, setRejectionReason] = React.useState('');
  const [holdReason, setHoldReason] = React.useState('');
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const agencyName =
    typeof project.implementingAgency === 'object' && (project.implementingAgency as any)?.name
      ? (project.implementingAgency as any).name
      : String(project.implementingAgency || 'Implementing Agency');

  const possibleTransitions = getAuthorizedTransitions(
    user?.role,
    user?.accountType,
    project.status,
  );

  const handleOpenModal = (targetStatus?: ProjectStatus) => {
    setSelectedStatus(targetStatus || possibleTransitions[0] || '');
    setRemarks('');
    setRejectionReason('');
    setHoldReason('');
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleSubmitTransition = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStatus) return;
    setErrorMsg(null);

    try {
      await updateStatusMutation.mutateAsync({
        id: project.id,
        payload: {
          status: selectedStatus as ProjectStatus,
          remarks: remarks.trim() || undefined,
          rejectionReason: selectedStatus === 'REJECTED' ? rejectionReason.trim() : undefined,
          holdReason: selectedStatus === 'ON_HOLD' ? holdReason.trim() : undefined,
        },
      });
      setIsModalOpen(false);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Status transition failed. Please verify your administrative authority.';
      setErrorMsg(Array.isArray(msg) ? msg.join(', ') : msg);
    }
  };

  return (
    <div className="rounded-xl border border-ink-200 bg-paper p-5 sm:p-6 shadow-xs space-y-4">
      {/* Top Navigation & Breadcrumb */}
      <div className="flex items-center justify-between gap-3 border-b border-ink-100 pb-3">
        <button
          type="button"
          onClick={() => navigate(ROUTES.projects)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-600 hover:text-ink-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Projects Register</span>
        </button>

        <div className="flex items-center gap-3">
          {/* PIA Draft Submission Action */}
          {isPiaUser && project.status === 'DRAFT' && (
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => handleOpenModal('SUBMITTED')}
              className="inline-flex items-center gap-1.5 text-xs font-semibold shadow-xs"
            >
              <Send className="h-3.5 w-3.5" />
              <span>Submit for Statutory Scrutiny</span>
            </Button>
          )}

          {/* Government Officer Progress Action */}
          {!isViewer && !isPiaUser && possibleTransitions.length > 0 && (
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => handleOpenModal()}
              className="inline-flex items-center gap-1.5 text-xs font-semibold shadow-xs"
            >
              <GitBranch className="h-3.5 w-3.5" />
              <span>Progress Status</span>
            </Button>
          )}

          <div className="flex items-center gap-2 text-xs text-ink-500 font-mono">
            <span>
              Scheme ID: <strong className="text-ink-900">{project.id}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* PIA Submitted Informational Banner */}
      {isPiaUser && project.status === 'SUBMITTED' && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 text-amber-900 p-3.5 rounded-lg text-xs">
          <Clock className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Awaiting Government Review: </span>
            This acquisition proposal has been submitted and is currently undergoing preliminary statutory scrutiny by the Competent Government Authority. All lifecycle decisions and milestone approvals are managed by authorized government officers.
          </div>
        </div>
      )}

      {/* Main Title & Scope Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-sm font-bold text-ink-900 bg-ink-100 px-2.5 py-0.5 rounded border border-ink-200">
              {project.code}
            </span>
            <StatusBadge status={project.status} />
            <span className="rounded bg-terracotta-50 px-2 py-0.5 text-[11px] font-bold text-terracotta-800 border border-terracotta-200">
              {project.category.replace('_', ' ')}
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-ink-900">
            {project.title}
          </h1>

          <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-ink-600">
            <span className="flex items-center gap-1 font-medium text-ink-800">
              <Building2 className="h-3.5 w-3.5 text-ink-500" />
              <span>{agencyName}</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-terracotta-600" />
              <span>
                {project.districts.join(', ')}, {project.state}
              </span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-ink-500">
              <Calendar className="h-3.5 w-3.5" />
              <span>Notified: {formatDate(project.notifiedOn || '')}</span>
            </span>
          </div>
        </div>

        {/* Quick Module Navigation Actions */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => navigate(`${ROUTES.parcels}?projectId=${project.id}`)}
            className="flex items-center gap-1.5 text-xs font-semibold text-terracotta-700 hover:text-terracotta-900 border-terracotta-200 bg-terracotta-50/50"
          >
            <Layers className="h-3.5 w-3.5 text-terracotta-600" />
            <span>View Parcels ({project.parcelCount})</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => navigate(`${ROUTES.gis}?projectId=${project.id}`)}
            className="flex items-center gap-1.5 text-xs font-semibold text-terracotta-700 border-terracotta-200 bg-terracotta-50/50"
          >
            <Map className="h-3.5 w-3.5 text-terracotta-600" />
            <span>View on GIS</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => navigate(`${ROUTES.documents}?projectId=${project.id}`)}
            className="flex items-center gap-1.5 text-xs font-semibold"
          >
            <FileStack className="h-3.5 w-3.5 text-ink-600" />
            <span>Documents ({project.documentCount ?? 0})</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => navigate(`${ROUTES.compensation}?projectId=${project.id}`)}
            className="flex items-center gap-1.5 text-xs font-semibold"
          >
            <Wallet className="h-3.5 w-3.5 text-signal-600" />
            <span>Compensation</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => navigate(`${ROUTES.possession}?projectId=${project.id}`)}
            className="flex items-center gap-1.5 text-xs font-semibold text-terracotta-700 border-terracotta-200 bg-terracotta-50/50"
          >
            <Flag className="h-3.5 w-3.5 text-terracotta-600" />
            <span>Possession</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => navigate(`${ROUTES.rehabilitation}?projectId=${project.id}`)}
            className="flex items-center gap-1.5 text-xs font-semibold text-ink-800 border-ink-300 bg-ink-100"
          >
            <HeartHandshake className="h-3.5 w-3.5 text-terracotta-600" />
            <span>R&R</span>
          </Button>
        </div>
      </div>

      {/* Controlled Status Transition Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/50 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-paper rounded-xl border border-ink-200 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-ink-200 bg-ink-50/70">
              <div className="flex items-center gap-2">
                <GitBranch className="h-4 w-4 text-terracotta-600" />
                <h3 className="text-sm font-bold text-ink-900">Transition Project Statutory Stage</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-ink-400 hover:text-ink-900"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitTransition} className="p-6 space-y-4 text-xs">
              {errorMsg && (
                <div className="rounded-lg border border-rust-200 bg-rust-50 p-3 text-xs text-rust-900 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-rust-700 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="font-semibold text-ink-800">Current Statutory Status</label>
                <div>
                  <StatusBadge status={project.status} />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-ink-800">Target Next Stage *</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as ProjectStatus)}
                  className="h-9 w-full rounded-md border border-ink-300 px-3 text-xs text-ink-900 focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
                  required
                >
                  {possibleTransitions.map((s) => (
                    <option key={s} value={s}>
                      {s.replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>
              </div>

              {selectedStatus === 'REJECTED' && (
                <div className="space-y-1">
                  <label className="font-semibold text-rust-800">Statutory Rejection Reason *</label>
                  <textarea
                    rows={2}
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="State the statutory grounds for proposal rejection..."
                    className="w-full rounded-md border border-rust-300 p-2 text-xs text-ink-900 focus:border-rust-500 focus:outline-none"
                    required
                  />
                </div>
              )}

              {selectedStatus === 'ON_HOLD' && (
                <div className="space-y-1">
                  <label className="font-semibold text-amber-800">Administrative Hold Reason *</label>
                  <textarea
                    rows={2}
                    value={holdReason}
                    onChange={(e) => setHoldReason(e.target.value)}
                    placeholder="Specify stay orders, pending legal verifications, or dispute details..."
                    className="w-full rounded-md border border-amber-300 p-2 text-xs text-ink-900 focus:border-amber-500 focus:outline-none"
                    required
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="font-semibold text-ink-800">Approval / Statutory Notes</label>
                <textarea
                  rows={2}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Official administrative endorsement remarks or gazette reference..."
                  className="w-full rounded-md border border-ink-300 p-2 text-xs text-ink-900 focus:border-terracotta-500 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-ink-200 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                  disabled={updateStatusMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={updateStatusMutation.isPending}
                  className="flex items-center gap-1.5"
                >
                  {updateStatusMutation.isPending ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Updating Status...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Confirm Statutory Transition</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
