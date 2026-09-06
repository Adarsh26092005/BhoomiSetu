import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Clock,
  CheckCircle2,
  XCircle,
  MapPin,
  ShieldCheck,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { organizationsService } from '@/services/organizations.service';
import type { OrganizationRecord } from '@/types/organization';
import { ROUTES } from '@/constants/routes';

export function PiaApprovalQueuePage() {
  const [loading, setLoading] = useState(true);
  const [pendingOrgs, setPendingOrgs] = useState<OrganizationRecord[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<OrganizationRecord | null>(null);
  const [reviewModal, setReviewModal] = useState<'APPROVE' | 'REJECT' | null>(null);
  const [remarks, setRemarks] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchPending = async () => {
    setLoading(true);
    try {
      const res = await organizationsService.list({
        status: 'PENDING_APPROVAL',
        type: 'PROJECT_IMPLEMENTING_AGENCY',
      });
      setPendingOrgs(res.items);
    } catch (err) {
      console.error('Failed to load pending PIAs', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleReviewAction = async () => {
    if (!selectedOrg || !reviewModal) return;
    setActionLoading(true);
    try {
      if (reviewModal === 'APPROVE') {
        await organizationsService.approvePia(selectedOrg.id, {
          remarks: remarks || 'Approved after statutory document inspection.',
        });
      } else {
        await organizationsService.rejectPia(selectedOrg.id, {
          rejectionReason: remarks || 'Statutory criteria not met.',
        });
      }
      setReviewModal(null);
      setSelectedOrg(null);
      setRemarks('');
      fetchPending();
    } catch (err: any) {
      alert(err.message || 'Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-ink-200 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-700 uppercase tracking-wider">
            <Clock className="h-4 w-4 text-amber-600" /> Administrative Review Queue
          </div>
          <h1 className="text-xl font-bold tracking-tight text-ink-900 mt-0.5">
            Implementing Agency (PIA) Onboarding Approvals
          </h1>
          <p className="text-xs text-ink-500">
            Review submitted contractor, PSU, and concessionaire registration applications prior to portal activation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchPending}
            className="text-xs font-semibold"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Queue
          </Button>

          <Link to={ROUTES.organizations}>
            <Button variant="ghost" size="sm" className="text-xs">
              All Organizations →
            </Button>
          </Link>
        </div>
      </div>

      {/* Review Information Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-md p-4 flex items-start gap-3 text-xs text-amber-900">
        <ShieldCheck className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold">Administrative Verification Procedure:</p>
          <p className="text-amber-800 leading-relaxed">
            Approving a PIA activates the organization and enables the primary liaison officer to sign in. The audit trail records the approving officer and justification remarks permanently in the sovereign system ledger.
          </p>
        </div>
      </div>

      {/* Pending Applications List */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-16 text-center space-y-2 bg-paper border border-ink-200 rounded-md">
            <Loader2 className="h-6 w-6 animate-spin mx-auto text-ink-400" />
            <p className="text-xs text-ink-500 font-medium">Checking pending registrations...</p>
          </div>
        ) : pendingOrgs.length === 0 ? (
          <div className="bg-paper border border-ink-200 rounded-md p-12 text-center space-y-3">
            <CheckCircle2 className="h-10 w-10 text-signal-600 mx-auto" />
            <h3 className="text-sm font-bold text-ink-900">Approval Queue is Clear</h3>
            <p className="text-xs text-ink-500 max-w-sm mx-auto">
              There are currently no implementing agency registration requests awaiting administrative review.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {pendingOrgs.map((org) => (
              <div
                key={org.id}
                className="bg-paper border border-ink-200 rounded-md p-5 shadow-xs hover:border-amber-400 transition-colors space-y-4"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-ink-100 pb-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                        {org.code || 'PENDING-CODE'}
                      </span>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-ink-900 text-paper">
                        PIA Onboarding Application
                      </span>
                    </div>
                    <h2 className="text-base font-bold text-ink-900 mt-1">{org.name}</h2>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="accent"
                      size="sm"
                      onClick={() => {
                        setSelectedOrg(org);
                        setReviewModal('APPROVE');
                      }}
                      className="text-xs font-semibold"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Approve & Activate
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedOrg(org);
                        setReviewModal('REJECT');
                      }}
                      className="text-xs font-semibold text-rust-700 border-rust-200 hover:bg-rust-50"
                    >
                      <XCircle className="h-3.5 w-3.5 mr-1" /> Reject Request
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="space-y-1">
                    <span className="text-[10px] font-semibold uppercase text-ink-400">Headquarters / Location</span>
                    <p className="font-medium text-ink-800 flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-terracotta-600" />
                      <span>{org.district ? `${org.district}, ` : ''}{org.state || 'India'}</span>
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-semibold uppercase text-ink-400">Nodal Liaison Contact</span>
                    <p className="font-medium text-ink-800">
                      {org.jurisdiction?.nodalOfficerName || 'Primary Representative'}
                    </p>
                    <p className="text-[11px] text-ink-500 font-mono">
                      {org.jurisdiction?.nodalOfficerEmail || 'liaison@company.com'}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-semibold uppercase text-ink-400">Application Date</span>
                    <p className="font-medium text-ink-800">
                      {new Date(org.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>

                {org.jurisdiction?.officeAddress && (
                  <div className="bg-paper-subtle p-3 rounded text-[11px] text-ink-600 border border-ink-100">
                    <span className="font-semibold text-ink-800">Office Address: </span>
                    {org.jurisdiction.officeAddress}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Review Modal */}
      {reviewModal && selectedOrg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-paper border border-ink-200 rounded-md shadow-xl max-w-md w-full p-6 space-y-4 text-xs">
            <h3 className="text-sm font-bold text-ink-900">
              {reviewModal === 'APPROVE' ? 'Approve Implementing Agency' : 'Reject Registration Request'}
            </h3>

            <p className="text-ink-600 leading-relaxed">
              {reviewModal === 'APPROVE'
                ? `You are about to approve "${selectedOrg.name}". This will transition the status to ACTIVE and enable portal authentication for the agency liaison.`
                : `You are rejecting the registration application for "${selectedOrg.name}". The applicant will not receive active platform access.`}
            </p>

            <div className="space-y-1">
              <label className="font-semibold text-ink-800">Audit Remarks / Justification *</label>
              <textarea
                rows={3}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Enter mandatory audit remarks..."
                className="w-full rounded-sm border border-ink-300 p-2 text-xs focus:outline-none focus:ring-1 focus:ring-ink-900"
              />
            </div>

            <div className="pt-2 border-t border-ink-200 flex items-center justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setReviewModal(null);
                  setSelectedOrg(null);
                }}
                disabled={actionLoading}
              >
                Cancel
              </Button>
              <Button
                variant={reviewModal === 'APPROVE' ? 'accent' : 'primary'}
                size="sm"
                onClick={handleReviewAction}
                disabled={actionLoading}
              >
                {actionLoading ? 'Processing...' : reviewModal === 'APPROVE' ? 'Confirm Approval' : 'Confirm Rejection'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
