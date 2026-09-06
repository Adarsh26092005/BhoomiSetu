import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Shield,
  Building2,
  Mail,
  Phone,
  Landmark,
  Plus,
  Trash2,
  AlertCircle,
  Loader2,
  ShieldAlert,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usersService } from '@/services/users.service';
import type { UserRecord } from '@/types/user-admin';
import type { UserRole } from '@/types/auth';
import { ROUTES } from '@/constants/routes';

export function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserRecord | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assignProjectId, setAssignProjectId] = useState('proj-001');
  const [assignRole, setAssignRole] = useState<UserRole>('LAND_ACQUISITION_OFFICER');

  const loadUser = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await usersService.getById(id);
      setUser(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'User not found');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, [id]);

  const handleToggleStatus = async () => {
    if (!user) return;
    setActionLoading(true);
    try {
      if (user.isActive) {
        await usersService.deactivate(user.id);
      } else {
        await usersService.activate(user.id);
      }
      await loadUser();
    } catch (err: any) {
      alert(err.message || 'Status change failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAssignProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !assignProjectId) return;
    setActionLoading(true);
    try {
      await usersService.assignProject(user.id, {
        projectId: assignProjectId,
        role: assignRole,
      });
      setIsAssignModalOpen(false);
      await loadUser();
    } catch (err: any) {
      alert(err.message || 'Project assignment failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRevokeAssignment = async (assignmentId: string) => {
    if (!user) return;
    if (!confirm('Are you sure you want to revoke this project assignment?')) return;
    try {
      await usersService.deactivateProjectAssignment(user.id, assignmentId);
      await loadUser();
    } catch (err: any) {
      alert(err.message || 'Failed to revoke assignment');
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center space-y-3">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-ink-500" />
        <p className="text-xs text-ink-500 font-medium">Loading user profile...</p>
      </div>
    );
  }

  if (!user || errorMsg) {
    return (
      <div className="py-16 text-center space-y-4 max-w-md mx-auto">
        <AlertCircle className="h-10 w-10 text-rust-600 mx-auto" />
        <h2 className="text-base font-bold text-ink-900">User Account Not Found</h2>
        <p className="text-xs text-ink-500">{errorMsg || 'The requested user does not exist.'}</p>
        <Button variant="outline" size="sm" onClick={() => navigate(ROUTES.users)}>
          <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Return to Directory
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Top Navigation & Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-ink-200 pb-4">
        <div className="flex items-center gap-2 text-xs text-ink-500">
          <Link
            to={ROUTES.users}
            className="font-semibold text-ink-700 hover:text-ink-900 flex items-center gap-1"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> User Directory
          </Link>
          <span>/</span>
          <span className="font-mono text-ink-900 font-semibold">{user.email}</span>
        </div>

        <div className="flex items-center gap-2">
          {user.isActive ? (
            <Button
              variant="outline"
              size="sm"
              onClick={handleToggleStatus}
              disabled={actionLoading}
              className="text-xs font-semibold text-rust-700 border-rust-200 hover:bg-rust-50"
            >
              <XCircle className="h-3.5 w-3.5 mr-1" /> Deactivate Account & Revoke Sessions
            </Button>
          ) : (
            <Button
              variant="primary"
              size="sm"
              onClick={handleToggleStatus}
              disabled={actionLoading}
              className="text-xs font-semibold"
            >
              <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Activate User Account
            </Button>
          )}
        </div>
      </div>

      {/* Officer Identity Card */}
      <div className="bg-paper border border-ink-200 rounded-md p-6 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-ink-900 text-paper">
                {user.accountType === 'GOVERNMENT_OFFICER' ? 'GOVERNMENT OFFICER' : 'PIA USER'}
              </span>
              <span className="font-mono text-xs font-bold text-terracotta-700 bg-terracotta-50 px-2 py-0.5 rounded border border-terracotta-200">
                {user.role}
              </span>
              {user.isActive ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-signal-800 bg-signal-100 px-2 py-0.5 rounded">
                  <CheckCircle2 className="h-3 w-3" /> ACTIVE
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rust-800 bg-rust-100 px-2 py-0.5 rounded">
                  <XCircle className="h-3 w-3" /> INACTIVE
                </span>
              )}
            </div>
            <h1 className="text-xl font-bold tracking-tight text-ink-900">{user.fullName}</h1>
            <p className="text-xs font-medium text-ink-600">{user.designation}</p>
          </div>

          <div className="text-right text-xs font-medium text-ink-600 space-y-1">
            <div className="text-ink-400 text-[11px]">System Account ID</div>
            <div className="font-mono text-ink-800 text-[11px]">{user.id}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-ink-100 text-xs">
          <div className="space-y-1">
            <span className="text-ink-400 font-semibold uppercase text-[10px]">Official Contact Email</span>
            <div className="font-medium text-ink-800 flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 text-terracotta-600" />
              <span className="font-mono">{user.email}</span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-ink-400 font-semibold uppercase text-[10px]">Official Contact Phone</span>
            <div className="font-medium text-ink-800 flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5 text-ink-500" />
              <span>{user.phone || 'Not recorded'}</span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-ink-400 font-semibold uppercase text-[10px]">Assigned Organization</span>
            <div className="font-medium text-ink-800 flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5 text-ink-500" />
              <span>{user.organization?.name || 'Organization N/A'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Project Assignments & Scope */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Project Assignments */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-paper border border-ink-200 rounded-md p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-ink-100 pb-3">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-ink-900 flex items-center gap-2">
                  <Landmark className="h-3.5 w-3.5 text-terracotta-600" /> Active Project Assignments
                </h3>
                <p className="text-[11px] text-ink-500 mt-0.5">
                  Infrastructure projects where this officer holds active administrative or operational authority.
                </p>
              </div>

              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsAssignModalOpen(true)}
                className="text-xs font-semibold"
              >
                <Plus className="h-3.5 w-3.5 mr-1" /> Assign Project
              </Button>
            </div>

            {!user.projectAssignments || user.projectAssignments.length === 0 ? (
              <div className="py-8 text-center space-y-2 bg-paper-subtle rounded border border-dashed border-ink-200">
                <Landmark className="h-8 w-8 text-ink-300 mx-auto" />
                <p className="text-xs font-semibold text-ink-700">No project assignments active</p>
                <p className="text-[11px] text-ink-500 max-w-xs mx-auto">
                  Click "Assign Project" to grant access to an infrastructure project.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-ink-100 border border-ink-100 rounded overflow-hidden">
                {user.projectAssignments.map((assignment) => (
                  <div
                    key={assignment.id}
                    className="p-3.5 flex items-center justify-between gap-4 bg-paper hover:bg-ink-50/50 transition-colors"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] font-bold text-ink-900">
                          {assignment.project?.code || assignment.projectId}
                        </span>
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-terracotta-50 text-terracotta-800 border border-terracotta-200">
                          Role: {assignment.role}
                        </span>
                      </div>
                      <div className="text-xs font-medium text-ink-800">
                        {assignment.project?.title || 'Assigned Project'}
                      </div>
                      <div className="text-[10px] text-ink-400">
                        Assigned on {new Date(assignment.assignedAt).toLocaleDateString('en-IN')}
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRevokeAssignment(assignment.id)}
                      className="text-rust-600 hover:text-rust-800 hover:bg-rust-50 h-8 px-2"
                      title="Revoke Assignment"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Security & Role Boundaries */}
        <div className="space-y-6">
          <div className="bg-paper border border-ink-200 rounded-md p-5 shadow-xs space-y-3 text-xs">
            <h3 className="font-bold uppercase tracking-wider text-ink-900 border-b border-ink-100 pb-2 flex items-center gap-2">
              <Shield className="h-3.5 w-3.5 text-signal-600" /> Security & Access Credentials
            </h3>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-ink-500">Authentication Scheme:</span>
                <span className="font-semibold text-ink-900">Bcrypt Cost 12 / JWT</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-ink-500">Password Stored:</span>
                <span className="font-mono text-signal-700 font-semibold">Salted Hash (Never Cleartext)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-ink-500">Session Revocation:</span>
                <span className="text-ink-900 font-semibold">Automatic on Deactivation</span>
              </div>
            </div>
          </div>

          <div className="bg-paper-subtle border border-ink-200 rounded-md p-4 text-[11px] text-ink-600 space-y-1.5 leading-relaxed">
            <div className="font-bold text-ink-900 flex items-center gap-1.5">
              <ShieldAlert className="h-3.5 w-3.5 text-terracotta-600" /> RBAC Policy Invariant
            </div>
            <p>
              Users cannot alter their own canonical role or account type. Project assignments provide scoped operational visibility without altering top-level administrative authority.
            </p>
          </div>
        </div>
      </div>

      {/* Assign Project Modal */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-paper border border-ink-200 rounded-md shadow-xl max-w-md w-full p-6 space-y-4 text-xs">
            <h3 className="text-sm font-bold text-ink-900">Assign Officer to Project</h3>
            <p className="text-ink-600">
              Grant this officer working access to execute land acquisition workflows on a specific project.
            </p>

            <form onSubmit={handleAssignProject} className="space-y-4">
              <div className="space-y-1">
                <label className="font-semibold text-ink-800">Select Project *</label>
                <select
                  value={assignProjectId}
                  onChange={(e) => setAssignProjectId(e.target.value)}
                  className="w-full h-9 rounded-sm border border-ink-300 px-2 text-xs bg-paper focus:outline-none focus:ring-1 focus:ring-ink-900"
                >
                  <option value="proj-001">NH-48-EXP — Delhi-Mumbai Expressway Package 4</option>
                  <option value="proj-002">PMRDA-RING-P1 — Pune Ring Road Eastern Bypass</option>
                  <option value="proj-003">WDFC-PKG-2 — Western Dedicated Freight Corridor</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-ink-800">Working Role on Project *</label>
                <select
                  value={assignRole}
                  onChange={(e) => setAssignRole(e.target.value as UserRole)}
                  className="w-full h-9 rounded-sm border border-ink-300 px-2 text-xs bg-paper focus:outline-none focus:ring-1 focus:ring-ink-900"
                >
                  <option value="LAND_ACQUISITION_OFFICER">LAND_ACQUISITION_OFFICER</option>
                  <option value="SURVEY_OFFICER">SURVEY_OFFICER</option>
                  <option value="REVENUE_OFFICER">REVENUE_OFFICER</option>
                  <option value="VERIFICATION_OFFICER">VERIFICATION_OFFICER</option>
                  <option value="FINANCE_OFFICER">FINANCE_OFFICER</option>
                  <option value="R_AND_R_OFFICER">R_AND_R_OFFICER</option>
                  <option value="PROJECT_IMPLEMENTING_AGENCY">PROJECT_IMPLEMENTING_AGENCY</option>
                  <option value="VIEWER">VIEWER</option>
                </select>
              </div>

              <div className="pt-2 border-t border-ink-200 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAssignModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Assigning...' : 'Confirm Assignment'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
