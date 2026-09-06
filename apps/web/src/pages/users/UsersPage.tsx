import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Users,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  Shield,
  ChevronRight,
  RefreshCw,
  X,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usersService } from '@/services/users.service';
import { organizationsService } from '@/services/organizations.service';
import type { UserRecord, CreateUserInput } from '@/types/user-admin';
import type { AccountType, UserRole } from '@/types/auth';
import type { OrganizationRecord } from '@/types/organization';
import { ROUTES } from '@/constants/routes';

const CANONICAL_ROLES: { value: UserRole; label: string; group: 'GOV' | 'PIA' | 'ALL' }[] = [
  { value: 'SUPER_ADMIN', label: 'Super Administrator', group: 'GOV' },
  { value: 'CENTRAL_OFFICER', label: 'Central Officer (Ministry)', group: 'GOV' },
  { value: 'STATE_OFFICER', label: 'State Officer (Authority)', group: 'GOV' },
  { value: 'DISTRICT_OFFICER', label: 'District Officer (Collectorate)', group: 'GOV' },
  { value: 'LAND_ACQUISITION_OFFICER', label: 'Land Acquisition Officer (LAO / CALA)', group: 'GOV' },
  { value: 'SURVEY_OFFICER', label: 'Survey Officer (DILR)', group: 'GOV' },
  { value: 'REVENUE_OFFICER', label: 'Revenue Officer (Tahsildar)', group: 'GOV' },
  { value: 'VERIFICATION_OFFICER', label: 'Verification Officer (Valuation / SDO)', group: 'GOV' },
  { value: 'FINANCE_OFFICER', label: 'Finance Officer (Treasury / PFMS Lead)', group: 'GOV' },
  { value: 'R_AND_R_OFFICER', label: 'Rehabilitation & Resettlement Officer', group: 'GOV' },
  { value: 'PROJECT_IMPLEMENTING_AGENCY', label: 'Project Implementing Agency (PIA / Concessionaire)', group: 'PIA' },
  { value: 'VIEWER', label: 'Read-Only Viewer / Auditor', group: 'ALL' },
];

export function UsersPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [accountTypeFilter, setAccountTypeFilter] = useState<string>('ALL');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [organizations, setOrganizations] = useState<OrganizationRecord[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form State for User Provisioning
  const [formData, setFormData] = useState<CreateUserInput>({
    fullName: '',
    email: '',
    phone: '',
    designation: '',
    accountType: 'GOVERNMENT_OFFICER',
    role: 'LAND_ACQUISITION_OFFICER',
    organizationId: '',
    password: 'DefaultPass2026!',
    isActive: true,
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await usersService.list({
        search: search.trim() || undefined,
        accountType: accountTypeFilter !== 'ALL' ? accountTypeFilter : undefined,
        role: roleFilter !== 'ALL' ? roleFilter : undefined,
        isActive: statusFilter === 'ALL' ? undefined : statusFilter === 'ACTIVE',
      });
      setUsers(res.items);
      setTotal(res.total);
    } catch (err) {
      console.error('Failed to load users', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search, accountTypeFilter, roleFilter, statusFilter]);

  useEffect(() => {
    organizationsService.list({ limit: 100 }).then((res) => {
      setOrganizations(res.items);
      if (res.items.length > 0 && !formData.organizationId) {
        setFormData((prev) => ({ ...prev, organizationId: res.items[0].id }));
      }
    });
  }, []);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.email.trim() || !formData.organizationId) {
      setErrorMsg('Please complete all required fields.');
      return;
    }
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      await usersService.create(formData);
      setIsModalOpen(false);
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        designation: '',
        accountType: 'GOVERNMENT_OFFICER',
        role: 'LAND_ACQUISITION_OFFICER',
        organizationId: organizations[0]?.id || '',
        password: 'DefaultPass2026!',
        isActive: true,
      });
      fetchUsers();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create user account');
    } finally {
      setIsSubmitting(false);
    }
  };

  // KPI Calculations
  const totalUsers = total || users.length;
  const govCount = users.filter((u) => u.accountType === 'GOVERNMENT_OFFICER').length;
  const piaCount = users.filter((u) => u.accountType === 'PIA_USER').length;
  const activeCount = users.filter((u) => u.isActive).length;

  const renderRoleBadge = (role: UserRole) => {
    const isGov = role !== 'PROJECT_IMPLEMENTING_AGENCY' && role !== 'VIEWER';
    return (
      <span
        className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-semibold border ${
          role === 'SUPER_ADMIN'
            ? 'bg-ink-900 text-paper border-ink-950'
            : isGov
            ? 'bg-terracotta-50 text-terracotta-800 border-terracotta-200'
            : role === 'PROJECT_IMPLEMENTING_AGENCY'
            ? 'bg-slate-100 text-slate-800 border-slate-300'
            : 'bg-ink-50 text-ink-700 border-ink-200'
        }`}
      >
        <Shield className="h-3 w-3 opacity-70" />
        {role.replace(/_/g, ' ')}
      </span>
    );
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-ink-200 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-terracotta-600 uppercase tracking-wider">
            <Users className="h-4 w-4" /> Administration & Role Management
          </div>
          <h1 className="text-xl font-bold tracking-tight text-ink-900 mt-0.5">
            User Accounts Directory
          </h1>
          <p className="text-xs text-ink-500">
            Government officers, competent authorities (CALA), survey leads, and implementing agency liaisons.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsModalOpen(true)}
            className="text-xs font-semibold"
          >
            <Plus className="h-3.5 w-3.5 mr-1" /> Provision User Account
          </Button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-paper border border-ink-200 rounded-md p-3.5 shadow-xs">
          <p className="text-[11px] font-semibold text-ink-500 uppercase tracking-wider">Total Accounts</p>
          <p className="text-2xl font-bold text-ink-900 mt-1">{totalUsers}</p>
        </div>
        <div className="bg-paper border border-ink-200 rounded-md p-3.5 shadow-xs">
          <p className="text-[11px] font-semibold text-ink-500 uppercase tracking-wider">Government Officers</p>
          <p className="text-2xl font-bold text-ink-900 mt-1">{govCount}</p>
        </div>
        <div className="bg-paper border border-ink-200 rounded-md p-3.5 shadow-xs">
          <p className="text-[11px] font-semibold text-ink-500 uppercase tracking-wider">PIA Users</p>
          <p className="text-2xl font-bold text-ink-900 mt-1">{piaCount}</p>
        </div>
        <div className="bg-paper border border-ink-200 rounded-md p-3.5 shadow-xs">
          <p className="text-[11px] font-semibold text-signal-700 uppercase tracking-wider">Active Status</p>
          <p className="text-2xl font-bold text-signal-800 mt-1">{activeCount}</p>
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
            placeholder="Search users by full name, official email, or designation..."
            className="w-full h-9 pl-9 pr-3 text-xs rounded-sm border border-ink-300 bg-paper focus:outline-none focus:ring-1 focus:ring-ink-900"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={accountTypeFilter}
            onChange={(e) => setAccountTypeFilter(e.target.value)}
            className="h-9 px-2.5 text-xs rounded-sm border border-ink-300 bg-paper focus:outline-none focus:ring-1 focus:ring-ink-900 font-medium text-ink-700"
          >
            <option value="ALL">All Account Types</option>
            <option value="GOVERNMENT_OFFICER">Government Officers</option>
            <option value="PIA_USER">PIA Users</option>
          </select>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="h-9 px-2.5 text-xs rounded-sm border border-ink-300 bg-paper focus:outline-none focus:ring-1 focus:ring-ink-900 font-medium text-ink-700"
          >
            <option value="ALL">All 12 Canonical Roles</option>
            {CANONICAL_ROLES.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 px-2.5 text-xs rounded-sm border border-ink-300 bg-paper focus:outline-none focus:ring-1 focus:ring-ink-900 font-medium text-ink-700"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active Only</option>
            <option value="INACTIVE">Inactive / Revoked</option>
          </select>

          {(search || accountTypeFilter !== 'ALL' || roleFilter !== 'ALL' || statusFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearch('');
                setAccountTypeFilter('ALL');
                setRoleFilter('ALL');
                setStatusFilter('ALL');
              }}
              className="text-xs font-semibold text-terracotta-600 hover:text-terracotta-800 px-2 py-1"
            >
              Clear Filters
            </button>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={fetchUsers}
            className="h-9 px-2 text-ink-600"
            title="Refresh"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-paper border border-ink-200 rounded-md shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center space-y-2">
            <Loader2 className="h-6 w-6 animate-spin mx-auto text-ink-400" />
            <p className="text-xs text-ink-500 font-medium">Loading user accounts...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <Users className="h-10 w-10 text-ink-300 mx-auto" />
            <h3 className="text-sm font-bold text-ink-800">No user accounts found</h3>
            <p className="text-xs text-ink-500 max-w-sm mx-auto">
              No registered officers or PIA accounts match your filter selections.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-ink-50 border-b border-ink-200 text-ink-600 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Officer Name & Designation</th>
                  <th className="py-3 px-4">Account Type</th>
                  <th className="py-3 px-4">Canonical Role</th>
                  <th className="py-3 px-4">Organization</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100 font-medium text-ink-800">
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-ink-50/70 transition-colors group cursor-pointer"
                    onClick={() => navigate(ROUTES.userDetail(user.id))}
                  >
                    <td className="py-3 px-4">
                      <div className="font-bold text-ink-900 group-hover:text-terracotta-700 transition-colors">
                        {user.fullName}
                      </div>
                      <div className="text-[11px] text-ink-500">{user.designation}</div>
                      <div className="font-mono text-[10px] text-ink-400">{user.email}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[11px] font-semibold text-ink-700">
                        {user.accountType === 'GOVERNMENT_OFFICER' ? 'Government Officer' : 'PIA User'}
                      </span>
                    </td>
                    <td className="py-3 px-4">{renderRoleBadge(user.role)}</td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-ink-900 truncate max-w-[200px]">
                        {user.organization?.name || 'Organization N/A'}
                      </div>
                      <div className="font-mono text-[10px] text-ink-400">
                        {user.organization?.code || ''}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {user.isActive ? (
                        <span className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-semibold bg-signal-100 text-signal-800 border border-signal-200">
                          <CheckCircle2 className="h-3 w-3 text-signal-600" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-semibold bg-rust-100 text-rust-800 border border-rust-200">
                          <XCircle className="h-3 w-3 text-rust-600" /> Inactive
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <Link
                        to={ROUTES.userDetail(user.id)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-ink-700 hover:text-ink-950 underline"
                      >
                        Profile <ChevronRight className="h-3 w-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Provision User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-paper border border-ink-200 rounded-md shadow-xl max-w-lg w-full overflow-hidden">
            <div className="bg-ink-900 text-paper p-4 px-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-terracotta-400" />
                <h3 className="text-sm font-bold">Provision Officer / User Account</h3>
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
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-ink-800">Account Type *</label>
                  <select
                    value={formData.accountType}
                    onChange={(e) => {
                      const type = e.target.value as AccountType;
                      setFormData({
                        ...formData,
                        accountType: type,
                        role: type === 'PIA_USER' ? 'PROJECT_IMPLEMENTING_AGENCY' : 'LAND_ACQUISITION_OFFICER',
                      });
                    }}
                    className="w-full h-9 rounded-sm border border-ink-300 px-2 text-xs bg-paper focus:outline-none focus:ring-1 focus:ring-ink-900"
                  >
                    <option value="GOVERNMENT_OFFICER">Government Officer</option>
                    <option value="PIA_USER">PIA / Implementing Agency</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-ink-800">Canonical User Role *</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                    className="w-full h-9 rounded-sm border border-ink-300 px-2 text-xs bg-paper focus:outline-none focus:ring-1 focus:ring-ink-900"
                  >
                    {CANONICAL_ROLES.filter((r) =>
                      formData.accountType === 'PIA_USER'
                        ? r.group === 'PIA' || r.group === 'ALL'
                        : r.group === 'GOV' || r.group === 'ALL',
                    ).map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-ink-800">Assigned Organization *</label>
                <select
                  value={formData.organizationId}
                  onChange={(e) => setFormData({ ...formData, organizationId: e.target.value })}
                  className="w-full h-9 rounded-sm border border-ink-300 px-2 text-xs bg-paper focus:outline-none focus:ring-1 focus:ring-ink-900"
                >
                  {organizations
                    .filter((o) =>
                      formData.accountType === 'PIA_USER'
                        ? o.type === 'PROJECT_IMPLEMENTING_AGENCY'
                        : o.type !== 'PROJECT_IMPLEMENTING_AGENCY',
                    )
                    .map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.name} ({o.code || o.type})
                      </option>
                    ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-ink-800">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="e.g. Dr. Rajesh Sharma"
                    className="w-full h-9 rounded-sm border border-ink-300 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-ink-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-ink-800">Official Designation *</label>
                  <input
                    type="text"
                    required
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    placeholder="e.g. Sub-Divisional Magistrate"
                    className="w-full h-9 rounded-sm border border-ink-300 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-ink-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-ink-800">Official Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="officer@nlams.gov.in"
                    className="w-full h-9 rounded-sm border border-ink-300 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-ink-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-ink-800">Contact Phone</label>
                  <input
                    type="text"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91-9876543210"
                    className="w-full h-9 rounded-sm border border-ink-300 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-ink-900"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-ink-800">Initial Access Password *</label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Min 8 characters"
                  className="w-full h-9 rounded-sm border border-ink-300 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-ink-900"
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
                  {isSubmitting ? 'Creating...' : 'Create Account'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
