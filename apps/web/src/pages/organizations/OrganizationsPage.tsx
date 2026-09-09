import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Building2,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  ChevronRight,
  Users,
  Landmark,
  MapPin,
  RefreshCw,
  X,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { organizationsService } from '@/services/organizations.service';
import type {
  CreateOrganizationInput,
  OrganizationRecord,
  OrganizationType,
  OrganizationStatus,
} from '@/types/organization';
import { ROUTES } from '@/constants/routes';

export function OrganizationsPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [organizations, setOrganizations] = useState<OrganizationRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [stateFilter, setStateFilter] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form State for Provisioning Modal
  const [formData, setFormData] = useState<CreateOrganizationInput>({
    name: '',
    code: '',
    type: 'DISTRICT_AUTHORITY',
    state: 'Maharashtra',
    district: '',
    officeAddress: '',
  });

  const fetchOrganizations = async () => {
    setLoading(true);
    try {
      const res = await organizationsService.list({
        search: search.trim() || undefined,
        type: typeFilter !== 'ALL' ? typeFilter : undefined,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        state: stateFilter !== 'ALL' ? stateFilter : undefined,
      });
      setOrganizations(res.items);
      setTotal(res.total);
    } catch (err) {
      console.error('Failed to load organizations', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizations();
  }, [search, typeFilter, statusFilter, stateFilter]);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setErrorMsg('Organization name is mandatory.');
      return;
    }
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      await organizationsService.create(formData);
      setIsModalOpen(false);
      setFormData({
        name: '',
        code: '',
        type: 'DISTRICT_AUTHORITY',
        state: 'Maharashtra',
        district: '',
        officeAddress: '',
      });
      fetchOrganizations();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create organization');
    } finally {
      setIsSubmitting(false);
    }
  };

  // KPI Calculations
  const totalOrgs = total || organizations.length;
  const centralCount = organizations.filter((o) => o.type === 'CENTRAL_MINISTRY').length;
  const stateCount = organizations.filter((o) => o.type === 'STATE_AUTHORITY').length;
  const districtCount = organizations.filter((o) => o.type === 'DISTRICT_AUTHORITY').length;
  const piaCount = organizations.filter((o) => o.type === 'PROJECT_IMPLEMENTING_AGENCY').length;
  const pendingCount = organizations.filter((o) => o.status === 'PENDING_APPROVAL').length;

  const renderStatusBadge = (status: OrganizationStatus) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-semibold bg-signal-100 text-signal-800 border border-signal-200">
            <CheckCircle2 className="h-3 w-3 text-signal-600" /> Active
          </span>
        );
      case 'PENDING_APPROVAL':
        return (
          <span className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-semibold bg-amber-100 text-amber-800 border border-amber-200 animate-pulse">
            <Clock className="h-3 w-3 text-amber-600" /> Pending Approval
          </span>
        );
      case 'SUSPENDED':
        return (
          <span className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-semibold bg-rust-100 text-rust-800 border border-rust-200">
            <AlertTriangle className="h-3 w-3 text-rust-600" /> Suspended
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-semibold bg-ink-100 text-ink-700 border border-ink-300">
            <XCircle className="h-3 w-3 text-ink-500" /> Rejected
          </span>
        );
    }
  };

  const renderTypeBadge = (type: OrganizationType) => {
    switch (type) {
      case 'CENTRAL_MINISTRY':
        return (
          <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-ink-900 text-paper">
            Central Ministry
          </span>
        );
      case 'STATE_AUTHORITY':
        return (
          <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-terracotta-100 text-terracotta-800 border border-terracotta-200">
            State Authority
          </span>
        );
      case 'DISTRICT_AUTHORITY':
        return (
          <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-ink-100 text-ink-800 border border-ink-200">
            District Authority
          </span>
        );
      case 'PROJECT_IMPLEMENTING_AGENCY':
        return (
          <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
            PIA / Concessionaire
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Title & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-ink-200 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-terracotta-600 uppercase tracking-wider">
            <Building2 className="h-4 w-4" /> Administration & Institutional Directory
          </div>
          <h1 className="text-xl font-bold tracking-tight text-ink-900 mt-0.5">
            Organizations Registry
          </h1>
          <p className="text-xs text-ink-500">
            Central ministries, state departments, district collectorates, and project implementing agencies.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link to={ROUTES.piaApprovals}>
            <Button variant="outline" size="sm" className="text-xs font-semibold relative">
              <Clock className="h-3.5 w-3.5 text-amber-600 mr-1.5" />
              PIA Approvals Queue
              {pendingCount > 0 && (
                <span className="ml-1.5 rounded-full bg-amber-500 text-paper px-1.5 py-0.2 text-[10px] font-bold">
                  {pendingCount}
                </span>
              )}
            </Button>
          </Link>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsModalOpen(true)}
            className="text-xs font-semibold"
          >
            <Plus className="h-3.5 w-3.5 mr-1" /> Provision Government Org
          </Button>
        </div>
      </div>

      {/* KPI Summary Cards Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-paper border border-ink-200 rounded-md p-3.5 shadow-xs">
          <p className="text-[11px] font-semibold text-ink-500 uppercase tracking-wider">Total Entities</p>
          <p className="text-2xl font-bold text-ink-900 mt-1">{totalOrgs}</p>
        </div>
        <div className="bg-paper border border-ink-200 rounded-md p-3.5 shadow-xs">
          <p className="text-[11px] font-semibold text-ink-500 uppercase tracking-wider">Central Ministries</p>
          <p className="text-2xl font-bold text-ink-900 mt-1">{centralCount}</p>
        </div>
        <div className="bg-paper border border-ink-200 rounded-md p-3.5 shadow-xs">
          <p className="text-[11px] font-semibold text-ink-500 uppercase tracking-wider">State Authorities</p>
          <p className="text-2xl font-bold text-ink-900 mt-1">{stateCount}</p>
        </div>
        <div className="bg-paper border border-ink-200 rounded-md p-3.5 shadow-xs">
          <p className="text-[11px] font-semibold text-ink-500 uppercase tracking-wider">District Collectorates</p>
          <p className="text-2xl font-bold text-ink-900 mt-1">{districtCount}</p>
        </div>
        <div className="bg-paper border border-ink-200 rounded-md p-3.5 shadow-xs">
          <p className="text-[11px] font-semibold text-ink-500 uppercase tracking-wider">PIA Agencies</p>
          <p className="text-2xl font-bold text-ink-900 mt-1">{piaCount}</p>
        </div>
        <div className="bg-paper border border-amber-200 bg-amber-50/40 rounded-md p-3.5 shadow-xs">
          <p className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider">Pending Review</p>
          <p className="text-2xl font-bold text-amber-900 mt-1">{pendingCount}</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-paper border border-ink-200 rounded-md p-3.5 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search organizations by name, statutory code, district..."
            className="w-full h-9 pl-9 pr-3 text-xs rounded-sm border border-ink-300 bg-paper focus:outline-none focus:ring-1 focus:ring-ink-900"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="h-9 px-2.5 text-xs rounded-sm border border-ink-300 bg-paper focus:outline-none focus:ring-1 focus:ring-ink-900 font-medium text-ink-700"
          >
            <option value="ALL">All Entity Types</option>
            <option value="CENTRAL_MINISTRY">Central Ministries</option>
            <option value="STATE_AUTHORITY">State Authorities</option>
            <option value="DISTRICT_AUTHORITY">District Authorities</option>
            <option value="PROJECT_IMPLEMENTING_AGENCY">PIA / Concessionaires</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 px-2.5 text-xs rounded-sm border border-ink-300 bg-paper focus:outline-none focus:ring-1 focus:ring-ink-900 font-medium text-ink-700"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="PENDING_APPROVAL">Pending Approval</option>
            <option value="SUSPENDED">Suspended</option>
            <option value="REJECTED">Rejected</option>
          </select>

          <select
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value)}
            className="h-9 px-2.5 text-xs rounded-sm border border-ink-300 bg-paper focus:outline-none focus:ring-1 focus:ring-ink-900 font-medium text-ink-700"
          >
            <option value="ALL">All States</option>
            <option value="Karnataka">Karnataka</option>
            <option value="Maharashtra">Maharashtra</option>
            <option value="National">National / Central</option>
            <option value="Delhi">Delhi</option>
            <option value="Madhya Pradesh">Madhya Pradesh</option>
            <option value="Gujarat">Gujarat</option>
          </select>

          {(search || typeFilter !== 'ALL' || statusFilter !== 'ALL' || stateFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearch('');
                setTypeFilter('ALL');
                setStatusFilter('ALL');
                setStateFilter('ALL');
              }}
              className="text-xs font-semibold text-terracotta-600 hover:text-terracotta-800 px-2 py-1"
            >
              Clear Filters
            </button>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={fetchOrganizations}
            className="h-9 px-2 text-ink-600"
            title="Refresh"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Organizations Table */}
      <div className="bg-paper border border-ink-200 rounded-md shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center space-y-2">
            <Loader2 className="h-6 w-6 animate-spin mx-auto text-ink-400" />
            <p className="text-xs text-ink-500 font-medium">Loading organization records...</p>
          </div>
        ) : organizations.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <Building2 className="h-10 w-10 text-ink-300 mx-auto" />
            <h3 className="text-sm font-bold text-ink-800">No organizations match your criteria</h3>
            <p className="text-xs text-ink-500 max-w-sm mx-auto">
              Try adjusting your search query or filter selections above.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-ink-50 border-b border-ink-200 text-ink-600 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Organization Name & Code</th>
                  <th className="py-3 px-4">Entity Type</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Jurisdiction</th>
                  <th className="py-3 px-4 text-center">Officers</th>
                  <th className="py-3 px-4 text-center">Projects</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100 font-medium text-ink-800">
                {organizations.map((org) => (
                  <tr
                    key={org.id}
                    className="hover:bg-ink-50/70 transition-colors group cursor-pointer"
                    onClick={() => navigate(ROUTES.organizationDetail(org.id))}
                  >
                    <td className="py-3 px-4">
                      <div className="font-bold text-ink-900 group-hover:text-terracotta-700 transition-colors">
                        {org.name}
                      </div>
                      <div className="font-mono text-[11px] text-ink-500">
                        {org.code || 'NO-CODE'}
                      </div>
                    </td>
                    <td className="py-3 px-4">{renderTypeBadge(org.type)}</td>
                    <td className="py-3 px-4">{renderStatusBadge(org.status)}</td>
                    <td className="py-3 px-4 text-ink-600">
                      {org.state ? (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-ink-400" />
                          <span>
                            {org.district ? `${org.district}, ` : ''}
                            {org.state}
                          </span>
                        </div>
                      ) : (
                        <span className="text-ink-400 italic">National / Multi-State</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center gap-1 font-semibold text-ink-700">
                        <Users className="h-3 w-3 text-ink-400" />
                        {org.userCount ?? 0}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center gap-1 font-semibold text-ink-700">
                        <Landmark className="h-3 w-3 text-ink-400" />
                        {org.projectCount ?? 0}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <Link
                        to={ROUTES.organizationDetail(org.id)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-ink-700 hover:text-ink-950 underline"
                      >
                        Details <ChevronRight className="h-3 w-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Provision Government Org Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-paper border border-ink-200 rounded-md shadow-xl max-w-lg w-full overflow-hidden">
            <div className="bg-ink-900 text-paper p-4 px-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-terracotta-400" />
                <h3 className="text-sm font-bold">Provision Government Organization</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-ink-400 hover:text-paper"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {errorMsg && (
              <div className="m-4 p-3 bg-rust-50 border border-rust-200 text-xs text-rust-800 rounded">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-ink-800">Organization / Authority Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. District Collectorate Solapur"
                  className="w-full h-9 rounded-sm border border-ink-300 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-ink-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-ink-800">Official Code *</label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="e.g. DIST-SOL-01"
                    className="w-full h-9 rounded-sm border border-ink-300 px-3 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-ink-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-ink-800">Entity Classification *</label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value as OrganizationType })
                    }
                    className="w-full h-9 rounded-sm border border-ink-300 px-2 text-xs bg-paper focus:outline-none focus:ring-1 focus:ring-ink-900"
                  >
                    <option value="CENTRAL_MINISTRY">Central Ministry</option>
                    <option value="STATE_AUTHORITY">State Authority</option>
                    <option value="DISTRICT_AUTHORITY">District Authority</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-ink-800">State / UT</label>
                  <input
                    type="text"
                    value={formData.state || ''}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    placeholder="e.g. Maharashtra"
                    className="w-full h-9 rounded-sm border border-ink-300 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-ink-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-ink-800">District / Division</label>
                  <input
                    type="text"
                    value={formData.district || ''}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    placeholder="e.g. Solapur"
                    className="w-full h-9 rounded-sm border border-ink-300 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-ink-900"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-ink-800">Official Office Address</label>
                <textarea
                  rows={2}
                  value={formData.officeAddress || ''}
                  onChange={(e) => setFormData({ ...formData, officeAddress: e.target.value })}
                  placeholder="Official headquarters address"
                  className="w-full rounded-sm border border-ink-300 p-2 text-xs focus:outline-none focus:ring-1 focus:ring-ink-900"
                />
              </div>

              <div className="pt-3 border-t border-ink-200 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : 'Provision Organization'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
