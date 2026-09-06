import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Building2,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  MapPin,
  Users,
  Landmark,
  ShieldCheck,
  ShieldAlert,
  GitFork,
  Calendar,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { organizationsService } from '@/services/organizations.service';
import type { OrganizationRecord } from '@/types/organization';
import { ROUTES } from '@/constants/routes';

export function OrganizationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [org, setOrg] = useState<OrganizationRecord | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionModal, setActionModal] = useState<'SUSPEND' | 'ACTIVATE' | 'APPROVE' | 'REJECT' | null>(null);
  const [remarks, setRemarks] = useState('');

  const loadOrg = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await organizationsService.getById(id);
      setOrg(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Organization not found');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrg();
  }, [id]);

  const handleAction = async () => {
    if (!id || !actionModal) return;
    setActionLoading(true);
    try {
      if (actionModal === 'APPROVE') {
        await organizationsService.approvePia(id, { remarks: remarks || 'Approved by authority' });
      } else if (actionModal === 'REJECT') {
        await organizationsService.rejectPia(id, { rejectionReason: remarks || 'Statutory documentation rejected' });
      } else if (actionModal === 'SUSPEND') {
        await organizationsService.suspend(id, { suspensionReason: remarks || 'Administrative compliance suspension' });
      } else if (actionModal === 'ACTIVATE') {
        await organizationsService.activate(id);
      }
      setActionModal(null);
      setRemarks('');
      await loadOrg();
    } catch (err: any) {
      alert(err.message || 'Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center space-y-3">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-ink-500" />
        <p className="text-xs text-ink-500 font-medium">Loading organization details...</p>
      </div>
    );
  }

  if (!org || errorMsg) {
    return (
      <div className="py-16 text-center space-y-4 max-w-md mx-auto">
        <AlertCircle className="h-10 w-10 text-rust-600 mx-auto" />
        <h2 className="text-base font-bold text-ink-900">Organization Record Not Found</h2>
        <p className="text-xs text-ink-500">{errorMsg || 'The requested entity does not exist or has been removed.'}</p>
        <Button variant="outline" size="sm" onClick={() => navigate(ROUTES.organizations)}>
          <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Return to Directory
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-ink-200 pb-4">
        <div className="flex items-center gap-2 text-xs text-ink-500">
          <Link
            to={ROUTES.organizations}
            className="font-semibold text-ink-700 hover:text-ink-900 flex items-center gap-1"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Organizations
          </Link>
          <span>/</span>
          <span className="font-mono text-ink-900 font-semibold">{org.code || 'NO-CODE'}</span>
        </div>

        <div className="flex items-center gap-2">
          {org.status === 'PENDING_APPROVAL' && (
            <>
              <Button
                variant="accent"
                size="sm"
                onClick={() => setActionModal('APPROVE')}
                className="text-xs font-semibold"
              >
                <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Review & Approve PIA
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActionModal('REJECT')}
                className="text-xs font-semibold text-rust-700 border-rust-200 hover:bg-rust-50"
              >
                <XCircle className="h-3.5 w-3.5 mr-1" /> Reject Request
              </Button>
            </>
          )}

          {org.status === 'ACTIVE' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActionModal('SUSPEND')}
              className="text-xs font-semibold text-rust-700 border-rust-200 hover:bg-rust-50"
            >
              <AlertTriangle className="h-3.5 w-3.5 mr-1" /> Suspend Organization
            </Button>
          )}

          {org.status === 'SUSPENDED' && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setActionModal('ACTIVATE')}
              className="text-xs font-semibold"
            >
              <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Reactivate Organization
            </Button>
          )}
        </div>
      </div>

      {/* Identity Card */}
      <div className="bg-paper border border-ink-200 rounded-md p-6 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-terracotta-700 bg-terracotta-50 px-2 py-0.5 rounded border border-terracotta-200">
                {org.code || 'STATUTORY-ENTITY'}
              </span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-ink-900 text-paper">
                {org.type.replace(/_/g, ' ')}
              </span>
              {org.status === 'ACTIVE' && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-signal-800 bg-signal-100 px-2 py-0.5 rounded">
                  <CheckCircle2 className="h-3 w-3" /> ACTIVE
                </span>
              )}
              {org.status === 'PENDING_APPROVAL' && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                  <Clock className="h-3 w-3" /> PENDING APPROVAL
                </span>
              )}
              {org.status === 'SUSPENDED' && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rust-800 bg-rust-100 px-2 py-0.5 rounded">
                  <AlertTriangle className="h-3 w-3" /> SUSPENDED
                </span>
              )}
            </div>
            <h1 className="text-xl font-bold tracking-tight text-ink-900">{org.name}</h1>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium text-ink-600">
            <div className="text-right">
              <div className="text-ink-400 text-[11px]">System Record ID</div>
              <div className="font-mono text-ink-800 text-[11px]">{org.id}</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-ink-100 text-xs">
          <div className="space-y-1">
            <span className="text-ink-400 font-semibold uppercase text-[10px]">Territorial Jurisdiction</span>
            <div className="font-medium text-ink-800 flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-terracotta-600" />
              <span>
                {org.district ? `${org.district}, ` : ''}
                {org.state || 'National (All States & UTs)'}
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-ink-400 font-semibold uppercase text-[10px]">Institutional Structure</span>
            <div className="font-medium text-ink-800 flex items-center gap-1.5">
              <GitFork className="h-3.5 w-3.5 text-ink-500" />
              <span>{org.parent?.name || 'Top-Level Sovereign Entity (No Parent)'}</span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-ink-400 font-semibold uppercase text-[10px]">Onboarding Timestamp</span>
            <div className="font-medium text-ink-800 flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-ink-500" />
              <span>{new Date(org.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Details & Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Office & Operational Scope */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section: Operational Office Address */}
          <div className="bg-paper border border-ink-200 rounded-md p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-ink-900 border-b border-ink-100 pb-2 flex items-center gap-2">
              <Building2 className="h-3.5 w-3.5 text-terracotta-600" /> Headquarters & Official Address
            </h3>
            <p className="text-xs text-ink-700 leading-relaxed">
              {org.jurisdiction?.officeAddress || 'Official registered address recorded in sovereign gazette.'}
            </p>

            {org.jurisdiction?.jurisdictionDistricts && (
              <div className="pt-2">
                <span className="text-[11px] font-semibold text-ink-500 block mb-1">
                  Assigned Revenue Districts in Charge:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {org.jurisdiction.jurisdictionDistricts.map((d: string) => (
                    <span
                      key={d}
                      className="text-[11px] font-medium bg-ink-100 text-ink-800 px-2 py-0.5 rounded border border-ink-200"
                    >
                      {d}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Section: Members & Personnel */}
          <div className="bg-paper border border-ink-200 rounded-md p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-ink-100 pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-ink-900 flex items-center gap-2">
                <Users className="h-3.5 w-3.5 text-terracotta-600" /> Official Personnel & Officers ({org.userCount ?? 0})
              </h3>
              <Link
                to={ROUTES.users}
                className="text-xs font-semibold text-terracotta-700 hover:underline"
              >
                View in Directory →
              </Link>
            </div>
            <p className="text-xs text-ink-500">
              Authorized officers, survey leads, and project liaison managers associated with this organization.
            </p>
          </div>

          {/* Section: Active Infrastructure Projects */}
          <div className="bg-paper border border-ink-200 rounded-md p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-ink-100 pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-ink-900 flex items-center gap-2">
                <Landmark className="h-3.5 w-3.5 text-terracotta-600" /> Infrastructure Projects ({org.projectCount ?? 0})
              </h3>
              <Link
                to={ROUTES.projects}
                className="text-xs font-semibold text-terracotta-700 hover:underline"
              >
                View Projects →
              </Link>
            </div>
            <p className="text-xs text-ink-500">
              National land acquisition projects actively managed or executed by this entity.
            </p>
          </div>
        </div>

        {/* Right Column: Statutory & Audit Info */}
        <div className="space-y-6">
          <div className="bg-paper border border-ink-200 rounded-md p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-ink-900 border-b border-ink-100 pb-2 flex items-center gap-2">
              <ShieldCheck className="h-3.5 w-3.5 text-signal-600" /> Sovereign Compliance & Verification
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-start justify-between">
                <span className="text-ink-500">Application Status:</span>
                <span className="font-semibold text-ink-900">{org.status}</span>
              </div>
              <div className="flex items-start justify-between">
                <span className="text-ink-500">System State:</span>
                <span className="font-semibold text-ink-900">{org.isActive ? 'Active Login' : 'Inactive / Blocked'}</span>
              </div>
              <div className="flex items-start justify-between">
                <span className="text-ink-500">External MCA / GST:</span>
                <span className="font-mono text-ink-600 text-[11px]">Future Integration</span>
              </div>
            </div>
          </div>

          {/* Statutory Notice */}
          <div className="bg-paper-subtle border border-ink-200 rounded-md p-4 text-[11px] text-ink-600 space-y-1.5 leading-relaxed">
            <div className="font-bold text-ink-900 flex items-center gap-1.5">
              <ShieldAlert className="h-3.5 w-3.5 text-terracotta-600" /> Administrative Authority Note
            </div>
            <p>
              Organizational hierarchy, state jurisdiction assignment, and suspension states directly govern backend role-based access control (RBAC) boundaries for associated officers.
            </p>
          </div>
        </div>
      </div>

      {/* Confirmation & Remark Modal */}
      {actionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-paper border border-ink-200 rounded-md shadow-xl max-w-md w-full p-6 space-y-4 text-xs">
            <h3 className="text-sm font-bold text-ink-900">
              {actionModal === 'APPROVE' && 'Confirm Approval of PIA Registration'}
              {actionModal === 'REJECT' && 'Confirm Rejection of PIA Registration'}
              {actionModal === 'SUSPEND' && 'Confirm Suspension of Organization'}
              {actionModal === 'ACTIVATE' && 'Confirm Reactivation of Organization'}
            </h3>

            <p className="text-ink-600 leading-relaxed">
              {actionModal === 'APPROVE' &&
                'Approving will activate the organization and enable primary liaison login to the NLAMS platform.'}
              {actionModal === 'REJECT' &&
                'Rejecting will mark the application as rejected and prevent unauthorized portal access.'}
              {actionModal === 'SUSPEND' &&
                'Suspending this entity will block authenticated access for all assigned officers and liaison accounts.'}
              {actionModal === 'ACTIVATE' &&
                'Reactivating will restore operational status for this authority in the system.'}
            </p>

            <div className="space-y-1">
              <label className="font-semibold text-ink-800">Administrative Remarks / Justification *</label>
              <textarea
                rows={3}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Enter mandatory audit remark / reference..."
                className="w-full rounded-sm border border-ink-300 p-2 text-xs focus:outline-none focus:ring-1 focus:ring-ink-900"
              />
            </div>

            <div className="pt-2 border-t border-ink-200 flex items-center justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActionModal(null)}
                disabled={actionLoading}
              >
                Cancel
              </Button>
              <Button
                variant={actionModal === 'REJECT' || actionModal === 'SUSPEND' ? 'accent' : 'primary'}
                size="sm"
                onClick={handleAction}
                disabled={actionLoading}
              >
                {actionLoading ? 'Processing...' : 'Confirm Action'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
