import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Clock,
  CheckCircle2,
  XCircle,
  PauseCircle,
  MapPin,
  ShieldCheck,
  Loader2,
  RefreshCw,
  Building2,
  UserCheck,
  Landmark,
  FileText,
  AlertCircle,
  Calendar,
  User,
  Check,
  History,
  Shield,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { approvalService, type ApprovalRequestRecord } from '@/services/approval.service';
import { useAuthStore } from '@/store/auth.store';
import { ROUTES } from '@/constants/routes';

export function PiaApprovalQueuePage() {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<ApprovalRequestRecord[]>([]);
  const [counts, setCounts] = useState<{
    ALL: number;
    PENDING: number;
    APPROVED: number;
    ON_HOLD: number;
    REJECTED: number;
  }>({
    ALL: 0,
    PENDING: 0,
    APPROVED: 0,
    ON_HOLD: 0,
    REJECTED: 0,
  });
  const [selectedRequest, setSelectedRequest] = useState<ApprovalRequestRecord | null>(null);
  const [reviewModal, setReviewModal] = useState<'APPROVE' | 'REJECT' | 'HOLD' | null>(null);
  const [remarks, setRemarks] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'PENDING' | 'APPROVED' | 'ON_HOLD' | 'REJECTED' | 'ALL'>('PENDING');

  const effectiveScope = useAuthStore((state) => state.effectiveScope);

  const fetchCounts = useCallback(async () => {
    try {
      const [allRes, pendingRes, approvedRes, holdRes, rejectedRes] = await Promise.all([
        approvalService.listApprovalRequests({ limit: 1 }),
        approvalService.listApprovalRequests({ status: 'PENDING', limit: 1 }),
        approvalService.listApprovalRequests({ status: 'APPROVED', limit: 1 }),
        approvalService.listApprovalRequests({ status: 'ON_HOLD', limit: 1 }),
        approvalService.listApprovalRequests({ status: 'REJECTED', limit: 1 }),
      ]);
      setCounts({
        ALL: allRes.total || 0,
        PENDING: pendingRes.total || 0,
        APPROVED: approvedRes.total || 0,
        ON_HOLD: holdRes.total || 0,
        REJECTED: rejectedRes.total || 0,
      });
    } catch (err) {
      console.error('Failed to fetch approval counts:', err);
    }
  }, []);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const res = await approvalService.listApprovalRequests({
        status: statusFilter === 'ALL' ? undefined : statusFilter,
        limit: 50,
      });
      setRequests(res.items || []);
    } catch (err) {
      console.error('Failed to load approval requests', err);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchRequests();
    fetchCounts();
  }, [fetchRequests, fetchCounts]);

  const handleReviewAction = async () => {
    if (!selectedRequest || !reviewModal) return;
    setActionLoading(true);
    try {
      if (reviewModal === 'APPROVE') {
        await approvalService.approveRequest(selectedRequest.id, {
          remarks: remarks || 'Approved after statutory jurisdiction verification.',
        });
      } else if (reviewModal === 'HOLD') {
        await approvalService.holdRequest(selectedRequest.id, {
          remarks: remarks || 'Put on hold pending additional statutory documents.',
        });
      } else {
        await approvalService.rejectRequest(selectedRequest.id, {
          rejectionReason: remarks || 'Statutory jurisdiction criteria not met.',
        });
      }
      setReviewModal(null);
      setSelectedRequest(null);
      setRemarks('');
      await Promise.all([fetchRequests(), fetchCounts()]);
    } catch (err: any) {
      alert(err.message || 'Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  const getRequestTypeBadge = (type: string) => {
    switch (type) {
      case 'LAND_ACQUISITION_REQUEST':
        return (
          <span className="inline-flex items-center gap-1 font-mono text-[11px] font-bold text-terracotta-800 bg-terracotta-100 border border-terracotta-300 px-2 py-0.5 rounded">
            <Landmark className="h-3 w-3 text-terracotta-700" /> Land Acquisition Request
          </span>
        );
      case 'PIA_REGISTRATION':
        return (
          <span className="inline-flex items-center gap-1 font-mono text-[11px] font-bold text-amber-800 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded">
            <Building2 className="h-3 w-3 text-amber-700" /> PIA Agency Registration
          </span>
        );
      case 'OFFICER_REGISTRATION':
        return (
          <span className="inline-flex items-center gap-1 font-mono text-[11px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded">
            <UserCheck className="h-3 w-3 text-emerald-700" /> Officer Registration
          </span>
        );
      default:
        return (
          <span className="font-mono text-[11px] font-bold text-ink-700 bg-ink-100 px-2 py-0.5 rounded">
            {type}
          </span>
        );
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded">
            <Clock className="h-3 w-3" /> PENDING REVIEW
          </span>
        );
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded">
            <CheckCircle2 className="h-3 w-3 text-emerald-600" /> APPROVED
          </span>
        );
      case 'ON_HOLD':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-800 bg-sky-100 border border-sky-300 px-2 py-0.5 rounded">
            <PauseCircle className="h-3 w-3 text-sky-600" /> ON HOLD
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rust-800 bg-rust-100 border border-rust-300 px-2 py-0.5 rounded">
            <XCircle className="h-3 w-3 text-rust-600" /> REJECTED
          </span>
        );
      default:
        return null;
    }
  };

  const formatIST = (dateStr?: string | null) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Title & Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-ink-200 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-terracotta-700 uppercase tracking-wider">
            <ShieldCheck className="h-4 w-4 text-terracotta-600" /> Sovereign Platform Governance & Onboarding
          </div>
          <h1 className="text-xl font-bold tracking-tight text-ink-900 mt-0.5">
            Jurisdiction Approval Queue & History
          </h1>
          <p className="text-xs text-ink-500">
            {effectiveScope?.isCentral || effectiveScope?.isNational
              ? 'National Oversight — Reviewing and auditing approval records across all States & Union Territories.'
              : (effectiveScope?.administrativeAreaCode || effectiveScope?.areaCode)
              ? `Authorized jurisdiction records for ${effectiveScope?.administrativeAreaName || effectiveScope?.areaName || effectiveScope?.state} (${effectiveScope?.administrativeAreaCode || effectiveScope?.areaCode}).`
              : 'Statutory approvals and permanent historical ledger of authorized personnel and agencies.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              fetchRequests();
              fetchCounts();
            }}
            className="text-xs font-semibold"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Queue
          </Button>

          <Link to={ROUTES.organizations}>
            <Button variant="ghost" size="sm" className="text-xs text-ink-600">
              Organizations Registry →
            </Button>
          </Link>
        </div>
      </div>

      {/* Scope Context Banner */}
      <div className="bg-paper border border-ink-200 rounded-md p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-terracotta-100 flex items-center justify-center text-terracotta-700 font-bold shrink-0 border border-terracotta-200">
            {effectiveScope?.administrativeAreaCode || effectiveScope?.areaCode
              ? (effectiveScope.administrativeAreaCode || effectiveScope.areaCode)!.slice(0, 2)
              : 'GOI'}
          </div>
          <div>
            <div className="font-bold text-ink-900 flex items-center gap-2">
              <span>Jurisdiction Scope:</span>
              <span className="text-terracotta-700 font-mono">
                {effectiveScope?.isCentral || effectiveScope?.isNational
                  ? 'Republic of India (National Scope)'
                  : `${effectiveScope?.administrativeAreaName || effectiveScope?.areaName || effectiveScope?.state} [${effectiveScope?.administrativeAreaCode || effectiveScope?.areaCode || 'STATE'}]`}
              </span>
            </div>
            <div className="text-ink-500 text-[11px] mt-0.5">
              {effectiveScope?.isCentral || effectiveScope?.isNational
                ? 'Authorized to review all state, district, and central agency requests.'
                : `Assigned Districts: ${effectiveScope?.districts?.join(', ') || 'All Area Districts'}`}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-ink-600 text-[11px] bg-ink-50 px-3 py-1.5 rounded border border-ink-200">
          <Shield className="h-3.5 w-3.5 text-emerald-600" />
          <span>Statutory Authority: <strong>Active Super Admin</strong></span>
        </div>
      </div>

      {/* KPI Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <button
          type="button"
          onClick={() => setStatusFilter('ALL')}
          className={`bg-paper border rounded-md p-3.5 text-left transition-all cursor-pointer ${
            statusFilter === 'ALL' ? 'border-ink-900 ring-1 ring-ink-900' : 'border-ink-200 hover:border-ink-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-ink-500 uppercase tracking-wider">Total Requests</span>
            <History className="h-4 w-4 text-ink-400" />
          </div>
          <p className="text-2xl font-bold text-ink-900 mt-1">{counts.ALL}</p>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('PENDING')}
          className={`bg-paper border rounded-md p-3.5 text-left transition-all cursor-pointer ${
            statusFilter === 'PENDING'
              ? 'border-amber-600 ring-1 ring-amber-600 bg-amber-50/30'
              : 'border-amber-200 hover:border-amber-300 bg-amber-50/10'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider">Pending Review</span>
            <Clock className="h-4 w-4 text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-amber-900 mt-1">{counts.PENDING}</p>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('APPROVED')}
          className={`bg-paper border rounded-md p-3.5 text-left transition-all cursor-pointer ${
            statusFilter === 'APPROVED'
              ? 'border-emerald-600 ring-1 ring-emerald-600 bg-emerald-50/30'
              : 'border-emerald-200 hover:border-emerald-300 bg-emerald-50/10'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider">Approved History</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-emerald-900 mt-1">{counts.APPROVED}</p>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('ON_HOLD')}
          className={`bg-paper border rounded-md p-3.5 text-left transition-all cursor-pointer ${
            statusFilter === 'ON_HOLD'
              ? 'border-sky-600 ring-1 ring-sky-600 bg-sky-50/30'
              : 'border-sky-200 hover:border-sky-300 bg-sky-50/10'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-sky-800 uppercase tracking-wider">On Hold</span>
            <PauseCircle className="h-4 w-4 text-sky-600" />
          </div>
          <p className="text-2xl font-bold text-sky-900 mt-1">{counts.ON_HOLD}</p>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('REJECTED')}
          className={`bg-paper border rounded-md p-3.5 text-left transition-all cursor-pointer ${
            statusFilter === 'REJECTED'
              ? 'border-rust-600 ring-1 ring-rust-600 bg-rust-50/30'
              : 'border-rust-200 hover:border-rust-300 bg-rust-50/10'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-rust-800 uppercase tracking-wider">Rejected</span>
            <XCircle className="h-4 w-4 text-rust-600" />
          </div>
          <p className="text-2xl font-bold text-rust-900 mt-1">{counts.REJECTED}</p>
        </button>
      </div>

      {/* Main Filter Navigation Bar */}
      <div className="flex items-center justify-between gap-3 border-b border-ink-200 pb-2">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <button
            type="button"
            onClick={() => setStatusFilter('PENDING')}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-bold rounded-md transition-colors cursor-pointer ${
              statusFilter === 'PENDING'
                ? 'bg-ink-900 text-paper shadow-xs'
                : 'text-ink-600 hover:bg-ink-100'
            }`}
          >
            <Clock className="h-3.5 w-3.5" />
            <span>Pending Review</span>
            <span
              className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                statusFilter === 'PENDING' ? 'bg-amber-400 text-ink-950' : 'bg-ink-200 text-ink-800'
              }`}
            >
              {counts.PENDING}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('APPROVED')}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-bold rounded-md transition-colors cursor-pointer ${
              statusFilter === 'APPROVED'
                ? 'bg-emerald-800 text-paper shadow-xs'
                : 'text-ink-600 hover:bg-ink-100'
            }`}
          >
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" />
            <span>Approved / Approval History</span>
            <span
              className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                statusFilter === 'APPROVED' ? 'bg-paper text-emerald-900' : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {counts.APPROVED}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('ON_HOLD')}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-bold rounded-md transition-colors cursor-pointer ${
              statusFilter === 'ON_HOLD'
                ? 'bg-sky-800 text-paper shadow-xs'
                : 'text-ink-600 hover:bg-ink-100'
            }`}
          >
            <PauseCircle className="h-3.5 w-3.5 text-sky-300" />
            <span>On Hold</span>
            <span
              className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                statusFilter === 'ON_HOLD' ? 'bg-paper text-sky-900' : 'bg-sky-100 text-sky-800'
              }`}
            >
              {counts.ON_HOLD}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('REJECTED')}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-bold rounded-md transition-colors cursor-pointer ${
              statusFilter === 'REJECTED'
                ? 'bg-rust-800 text-paper shadow-xs'
                : 'text-ink-600 hover:bg-ink-100'
            }`}
          >
            <XCircle className="h-3.5 w-3.5 text-rust-300" />
            <span>Rejected</span>
            <span
              className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                statusFilter === 'REJECTED' ? 'bg-paper text-rust-900' : 'bg-rust-100 text-rust-800'
              }`}
            >
              {counts.REJECTED}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('ALL')}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-bold rounded-md transition-colors cursor-pointer ${
              statusFilter === 'ALL'
                ? 'bg-ink-900 text-paper shadow-xs'
                : 'text-ink-600 hover:bg-ink-100'
            }`}
          >
            <span>All Requests</span>
            <span
              className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                statusFilter === 'ALL' ? 'bg-paper text-ink-900' : 'bg-ink-200 text-ink-800'
              }`}
            >
              {counts.ALL}
            </span>
          </button>
        </div>
      </div>

      {/* Section Subheader for Active Tab */}
      <div className="flex items-center justify-between text-xs text-ink-600">
        <div>
          <span className="font-bold text-ink-900 uppercase tracking-wider">
            {statusFilter === 'APPROVED'
              ? 'Approval History Ledger (Authorized Entities & Officers)'
              : statusFilter === 'PENDING'
              ? 'Actionable Onboarding & Registration Requests'
              : statusFilter === 'ON_HOLD'
              ? 'Requests On Hold (Pending Document Submission)'
              : statusFilter === 'REJECTED'
              ? 'Rejected Onboarding Applications'
              : 'All Jurisdictional Requests'}
          </span>
          <p className="text-[11px] text-ink-500 mt-0.5">
            Displaying {requests.length} records matching current filter in your assigned administrative area.
          </p>
        </div>
      </div>

      {/* Applications / History List */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-16 text-center space-y-2 bg-paper border border-ink-200 rounded-md">
            <Loader2 className="h-6 w-6 animate-spin mx-auto text-ink-400" />
            <p className="text-xs text-ink-500 font-medium">Querying jurisdiction approval ledger...</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="bg-paper border border-ink-200 rounded-md p-12 text-center space-y-3">
            {statusFilter === 'APPROVED' ? (
              <History className="h-10 w-10 text-ink-300 mx-auto" />
            ) : statusFilter === 'PENDING' ? (
              <CheckCircle2 className="h-10 w-10 text-emerald-600 mx-auto" />
            ) : (
              <AlertCircle className="h-10 w-10 text-ink-300 mx-auto" />
            )}
            <h3 className="text-sm font-bold text-ink-900">
              {statusFilter === 'APPROVED'
                ? 'No Approved Records in History'
                : statusFilter === 'PENDING'
                ? 'Approval Queue is Clear'
                : `No requests with status "${statusFilter}"`}
            </h3>
            <p className="text-xs text-ink-500 max-w-sm mx-auto">
              {statusFilter === 'APPROVED'
                ? 'Approved requests will appear here with full reviewer and timestamp details.'
                : `There are currently no records with status "${statusFilter}" in your jurisdiction.`}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {requests.map((req) => {
              const meta = req.metadata || {};
              const org = req.organization;
              const user = req.requesterUser;
              const isPending = req.status === 'PENDING';
              const isApproved = req.status === 'APPROVED';
              const isRejected = req.status === 'REJECTED';
              const isOnHold = req.status === 'ON_HOLD';

              const applicantName =
                req.requestType === 'OFFICER_REGISTRATION'
                  ? user?.fullName || meta.adminFullName || 'Government Officer'
                  : meta.proposedProjectName || org?.name || meta.companyName || 'Implementing Agency';

              const applicantEmail = user?.email || meta.adminEmail || 'contact@entity.gov.in';

              return (
                <div
                  key={req.id}
                  className={`bg-paper border rounded-md p-5 shadow-xs transition-all space-y-4 ${
                    isApproved
                      ? 'border-emerald-200 border-l-4 border-l-emerald-600 hover:border-emerald-300'
                      : isPending
                      ? 'border-amber-200 border-l-4 border-l-amber-500 hover:border-amber-300'
                      : isRejected
                      ? 'border-rust-200 border-l-4 border-l-rust-500'
                      : 'border-sky-200 border-l-4 border-l-sky-500'
                  }`}
                >
                  {/* Card Header */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-ink-100 pb-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {getRequestTypeBadge(req.requestType)}
                        {getStatusBadge(req.status)}
                        {req.administrativeArea && (
                          <span className="font-mono text-[10px] bg-ink-100 text-ink-700 px-2 py-0.5 rounded font-semibold border border-ink-200">
                            {req.administrativeArea.code} • {req.administrativeArea.name}
                          </span>
                        )}
                        <span className="font-mono text-[10px] text-ink-400">
                          ID: {req.id}
                        </span>
                      </div>

                      <h2 className="text-base font-bold text-ink-900 mt-1 flex items-center gap-2">
                        <span>{applicantName}</span>
                      </h2>

                      {meta.proposedProjectCode && (
                        <p className="text-xs text-ink-500 font-mono">
                          Project Ref: <span className="font-bold text-ink-800">{meta.proposedProjectCode}</span> • Category: {meta.projectPurpose || 'Statutory Public Work'}
                        </p>
                      )}
                    </div>

                    {/* Action Buttons for Pending or On Hold */}
                    {(isPending || isOnHold) && (
                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          variant="accent"
                          size="sm"
                          onClick={() => {
                            setSelectedRequest(req);
                            setReviewModal('APPROVE');
                          }}
                          className="text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-paper"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Approve Request
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedRequest(req);
                            setReviewModal('HOLD');
                          }}
                          className="text-xs font-semibold text-sky-700 border-sky-200 hover:bg-sky-50"
                        >
                          <PauseCircle className="h-3.5 w-3.5 mr-1" /> Put On Hold
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedRequest(req);
                            setReviewModal('REJECT');
                          }}
                          className="text-xs font-semibold text-rust-700 border-rust-200 hover:bg-rust-50"
                        >
                          <XCircle className="h-3.5 w-3.5 mr-1" /> Reject
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Comprehensive Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    {/* Applicant & Entity Details */}
                    <div className="space-y-1 bg-ink-50/70 p-3 rounded border border-ink-200">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-ink-500 flex items-center gap-1">
                        <User className="h-3 w-3" /> Requester / Organization
                      </span>
                      <p className="font-bold text-ink-900">{applicantName}</p>
                      <p className="text-[11px] text-ink-600 font-mono">{applicantEmail}</p>
                      {org && (
                        <p className="text-[11px] text-ink-700 font-medium pt-1">
                          Org: {org.name} {org.code ? `[${org.code}]` : ''}
                        </p>
                      )}
                      {user?.designation && (
                        <p className="text-[11px] text-ink-500 italic">
                          Designation: {user.designation}
                        </p>
                      )}
                    </div>

                    {/* Geographic & Administrative Area */}
                    <div className="space-y-1 bg-terracotta-50/40 p-3 rounded border border-terracotta-200">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-terracotta-800 flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-terracotta-600" /> Jurisdiction & Location
                      </span>
                      <p className="font-bold text-ink-900">
                        {req.district ? `${req.district}, ` : ''}{req.state}
                      </p>
                      <p className="text-[11px] text-terracotta-800 font-medium">
                        Area: {req.administrativeArea?.name || 'Assigned Area'} ({req.administrativeArea?.code || 'STATE'})
                      </p>
                      {meta.landRequirementArea && (
                        <p className="text-[11px] text-ink-700 pt-1">
                          Proposed Extent: <strong>{meta.landRequirementArea} {meta.landRequirementUnit || 'HECTARES'}</strong>
                        </p>
                      )}
                    </div>

                    {/* Timeline & Submissions */}
                    <div className="space-y-1 bg-ink-50/70 p-3 rounded border border-ink-200">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-ink-500 flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> Application Timeline
                      </span>
                      <p className="text-ink-700">
                        Submitted: <span className="font-semibold text-ink-900">{formatIST(req.submittedAt || req.createdAt)}</span>
                      </p>
                      {req.reviewedAt && (
                        <p className="text-ink-700">
                          Reviewed: <span className="font-semibold text-ink-900">{formatIST(req.reviewedAt)}</span>
                        </p>
                      )}
                      <p className="text-[11px] text-ink-500 pt-1">
                        Status: <strong className="uppercase">{req.status}</strong>
                      </p>
                    </div>
                  </div>

                  {/* APPROVAL AUDIT CARD FOR APPROVED REQUESTS */}
                  {isApproved && (
                    <div className="bg-emerald-50/60 border border-emerald-300 rounded p-3.5 space-y-2 text-xs">
                      <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
                        <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                          <Check className="h-4 w-4 text-emerald-700" />
                          <span>Statutory Approval Record</span>
                        </div>
                        <span className="text-[11px] font-mono text-emerald-800">
                          Approved On: {formatIST(req.reviewedAt || req.updatedAt)}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        <div>
                          <span className="text-[10px] font-bold uppercase text-emerald-800 block">
                            Approved By Authorized Super Admin:
                          </span>
                          <p className="font-semibold text-ink-900">
                            {req.reviewedBy?.fullName || 'Super Administrator'}
                          </p>
                          <p className="text-[11px] font-mono text-ink-600">
                            {req.reviewedBy?.email || 'superadmin@nlams.gov.in'}
                          </p>
                        </div>

                        <div>
                          <span className="text-[10px] font-bold uppercase text-emerald-800 block">
                            Verification & Approval Remarks:
                          </span>
                          <p className="text-ink-800 italic bg-paper/70 p-1.5 rounded border border-emerald-200 mt-0.5">
                            {meta.approvalRemarks || 'Verified against statutory jurisdiction records and authorized for platform access.'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* REJECTION REASON / REMARKS */}
                  {isRejected && (
                    <div className="bg-rust-50 border border-rust-200 rounded p-3.5 space-y-2 text-xs">
                      <div className="flex items-center justify-between border-b border-rust-200 pb-2">
                        <div className="flex items-center gap-1.5 font-bold text-rust-900">
                          <XCircle className="h-4 w-4 text-rust-700" />
                          <span>Rejection Reason & Auditor Notes</span>
                        </div>
                        <span className="text-[11px] font-mono text-rust-800">
                          Rejected On: {formatIST(req.reviewedAt || req.updatedAt)}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        <div>
                          <span className="text-[10px] font-bold uppercase text-rust-800 block">
                            Reviewed By:
                          </span>
                          <p className="font-semibold text-ink-900">
                            {req.reviewedBy?.fullName || 'Super Administrator'} ({req.reviewedBy?.email || 'superadmin@nlams.gov.in'})
                          </p>
                        </div>

                        <div>
                          <span className="text-[10px] font-bold uppercase text-rust-800 block">
                            Rejection Grounds:
                          </span>
                          <p className="text-rust-900 font-medium bg-paper/70 p-1.5 rounded border border-rust-200 mt-0.5">
                            {req.rejectionReason || 'Application does not meet jurisdiction criteria.'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ON HOLD REMARKS */}
                  {isOnHold && (
                    <div className="bg-sky-50 border border-sky-200 rounded p-3.5 space-y-2 text-xs">
                      <div className="flex items-center justify-between border-b border-sky-200 pb-2">
                        <div className="flex items-center gap-1.5 font-bold text-sky-900">
                          <PauseCircle className="h-4 w-4 text-sky-700" />
                          <span>Clarification Request / Hold Remarks</span>
                        </div>
                        <span className="text-[11px] font-mono text-sky-800">
                          Held On: {formatIST(req.reviewedAt || req.updatedAt)}
                        </span>
                      </div>

                      <p className="text-sky-900 bg-paper/70 p-2 rounded border border-sky-200">
                        {meta.holdRemarks || req.rejectionReason || 'Application put on hold pending revenue documentation clarification.'}
                      </p>
                    </div>
                  )}

                  {/* Acquisition Description */}
                  {meta.proposedLandDescription && (
                    <div className="bg-paper-subtle p-3 rounded text-[11px] text-ink-700 border border-ink-100 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-ink-900">
                        <FileText className="h-3.5 w-3.5 text-terracotta-600" />
                        <span>Proposed Acquisition Details:</span>
                      </div>
                      <p className="leading-relaxed pl-5">{meta.proposedLandDescription}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Review Action Modal */}
      {reviewModal && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-paper border border-ink-200 rounded-md shadow-xl max-w-md w-full p-6 space-y-4 text-xs">
            <h3 className="text-sm font-bold text-ink-900 flex items-center gap-2">
              {reviewModal === 'APPROVE' ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>Approve Jurisdiction Request</span>
                </>
              ) : reviewModal === 'HOLD' ? (
                <>
                  <PauseCircle className="h-4 w-4 text-sky-600" />
                  <span>Place Request On Hold</span>
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 text-rust-600" />
                  <span>Reject Request</span>
                </>
              )}
            </h3>

            <p className="text-ink-600 leading-relaxed">
              {reviewModal === 'APPROVE'
                ? `You are about to approve "${
                    selectedRequest.metadata?.proposedProjectName ||
                    selectedRequest.organization?.name ||
                    selectedRequest.requesterUser?.fullName
                  }" in ${selectedRequest.district ? `${selectedRequest.district}, ` : ''}${selectedRequest.state}. This will activate their credentials and record the approval in history.`
                : reviewModal === 'HOLD'
                ? `You are putting this application on hold. The applicant will be requested to provide additional documentation.`
                : `You are rejecting this application in ${selectedRequest.state}.`}
            </p>

            <div className="space-y-1">
              <label className="font-semibold text-ink-800">Statutory Remarks / Justification *</label>
              <textarea
                rows={3}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder={
                  reviewModal === 'APPROVE'
                    ? 'Enter statutory verification remarks...'
                    : reviewModal === 'HOLD'
                    ? 'State required documents or clarification reasons...'
                    : 'State reasons for rejection...'
                }
                className="w-full rounded-sm border border-ink-300 p-2 text-xs focus:outline-none focus:ring-1 focus:ring-ink-900"
              />
            </div>

            <div className="pt-2 border-t border-ink-200 flex items-center justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setReviewModal(null);
                  setSelectedRequest(null);
                }}
                disabled={actionLoading}
              >
                Cancel
              </Button>
              <Button
                variant={
                  reviewModal === 'APPROVE'
                    ? 'accent'
                    : reviewModal === 'HOLD'
                    ? 'outline'
                    : 'primary'
                }
                size="sm"
                onClick={handleReviewAction}
                disabled={actionLoading}
                className={reviewModal === 'APPROVE' ? 'bg-emerald-700 hover:bg-emerald-800 text-paper' : ''}
              >
                {actionLoading
                  ? 'Processing...'
                  : reviewModal === 'APPROVE'
                  ? 'Confirm Approval'
                  : reviewModal === 'HOLD'
                  ? 'Confirm Put On Hold'
                  : 'Confirm Rejection'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
