import * as React from 'react';
import { useNavigate, useLocation, Link, useSearchParams } from 'react-router-dom';
import {
  ArrowRight,
  KeyRound,
  Mail,
  Shield,
  Building2,
  ShieldAlert,
  AlertCircle,
  Loader2,
  UserCheck,
  ArrowLeft,
} from 'lucide-react';
import { useLogin } from '@/hooks/use-auth';
import { ROUTES } from '@/constants/routes';
import { Button } from '@/components/ui/button';

type PortalTab = 'OFFICER' | 'AGENCY' | 'ADMIN';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const loginMutation = useLogin();

  const initialPortal: PortalTab =
    (searchParams.get('portal')?.toUpperCase() as PortalTab) || 'OFFICER';

  const [activePortal, setActivePortal] = React.useState<PortalTab>(initialPortal);
  const [email, setEmail] = React.useState('ananya.rao@nlams.gov.in');
  const [password, setPassword] = React.useState('demoPassword123');
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const from = (location.state as { from?: { pathname?: string } })?.from?.pathname || ROUTES.dashboard;

  // Update default demo credentials when switching portals
  const handlePortalSwitch = (portal: PortalTab) => {
    setActivePortal(portal);
    setErrorMsg(null);
    if (portal === 'OFFICER') {
      setEmail('ananya.rao@nlams.gov.in');
      setPassword('demoPassword123');
    } else if (portal === 'AGENCY') {
      setEmail('liaison@nhai.gov.in');
      setPassword('demoPassword123');
    } else if (portal === 'ADMIN') {
      setEmail('superadmin@nlams.gov.in');
      setPassword('demoPassword123');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email || !password) {
      setErrorMsg('Please enter both official email and access password.');
      return;
    }

    try {
      await loginMutation.mutateAsync({ email, password, loginType: activePortal });
      navigate(from, { replace: true });
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Authentication failed. Please verify your credentials and selected access portal.';
      setErrorMsg(message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-ink-50 text-ink-900">
      {/* Top Sovereign Band */}
      <div className="bg-ink-900 text-paper px-4 py-2 text-xs flex items-center justify-between border-b border-ink-800">
        <div className="flex items-center gap-2">
          <span className="font-bold tracking-wider text-[11px] text-terracotta-400">
            भारत सरकार | GOVERNMENT OF INDIA
          </span>
          <span className="hidden sm:inline text-ink-400">•</span>
          <span className="hidden sm:inline text-ink-300">Department of Land Resources</span>
        </div>
        <span className="text-[11px] text-ink-400">National Access Portal</span>
      </div>

      <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md bg-paper border border-ink-200 rounded-xl shadow-lg p-6 sm:p-8 space-y-6">
          {/* Header Emblem */}
          <div className="text-center space-y-2">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-ink-900 text-paper font-black text-base shadow-sm">
              GOI
            </div>
            <h1 className="text-xl font-bold tracking-tight text-ink-900">
              NLAMS Access Authentication
            </h1>
            <p className="text-xs text-ink-500">
              National Land Acquisition & Management System (SIH26016)
            </p>
          </div>

          {/* Portal Selector Tabs */}
          <div className="grid grid-cols-3 gap-1 rounded-lg bg-ink-100 p-1 text-xs">
            <button
              type="button"
              onClick={() => handlePortalSwitch('OFFICER')}
              className={`flex flex-col items-center justify-center py-2 px-1 rounded-md font-medium transition-all ${
                activePortal === 'OFFICER'
                  ? 'bg-paper text-ink-900 shadow-xs font-bold'
                  : 'text-ink-600 hover:text-ink-900'
              }`}
            >
              <Shield className="h-4 w-4 mb-0.5 text-terracotta-600" />
              <span className="text-[11px]">Officer</span>
            </button>

            <button
              type="button"
              onClick={() => handlePortalSwitch('AGENCY')}
              className={`flex flex-col items-center justify-center py-2 px-1 rounded-md font-medium transition-all ${
                activePortal === 'AGENCY'
                  ? 'bg-paper text-ink-900 shadow-xs font-bold'
                  : 'text-ink-600 hover:text-ink-900'
              }`}
            >
              <Building2 className="h-4 w-4 mb-0.5 text-blue-600" />
              <span className="text-[11px]">Agency (PIA)</span>
            </button>

            <button
              type="button"
              onClick={() => handlePortalSwitch('ADMIN')}
              className={`flex flex-col items-center justify-center py-2 px-1 rounded-md font-medium transition-all ${
                activePortal === 'ADMIN'
                  ? 'bg-paper text-ink-900 shadow-xs font-bold'
                  : 'text-ink-600 hover:text-ink-900'
              }`}
            >
              <ShieldAlert className="h-4 w-4 mb-0.5 text-rust-600" />
              <span className="text-[11px]">Super Admin</span>
            </button>
          </div>

          {errorMsg && (
            <div className="flex items-start gap-2.5 rounded-lg border border-rust-200 bg-rust-50 p-3 text-xs text-rust-800">
              <AlertCircle className="h-4 w-4 shrink-0 text-rust-600 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-ink-700 block">
                {activePortal === 'OFFICER' && 'Official Government Email'}
                {activePortal === 'AGENCY' && 'Official Agency Email'}
                {activePortal === 'ADMIN' && 'Super Admin Email'}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.gov.in"
                  className="h-10 w-full rounded-md border border-ink-300 bg-paper pl-9 pr-3 text-xs text-ink-900 placeholder:text-ink-400 focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-ink-700">
                  Password
                </label>
                <span className="text-[10px] text-ink-400">
                  {activePortal === 'ADMIN' ? 'MFA Guarded' : 'NIC / Security Compliant'}
                </span>
              </div>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="h-10 w-full rounded-md border border-ink-300 bg-paper pl-9 pr-3 text-xs text-ink-900 placeholder:text-ink-400 focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={loginMutation.isPending}
              className="w-full flex items-center justify-center gap-2 mt-2"
            >
              {loginMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>
                    Sign In as {activePortal === 'OFFICER' ? 'Officer' : activePortal === 'AGENCY' ? 'Implementing Agency' : 'Super Admin'}
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          {/* Registration Links based on portal */}
          {activePortal === 'OFFICER' && (
            <div className="rounded-lg border border-ink-200 bg-ink-50/70 p-3 text-center space-y-1.5">
              <p className="text-xs text-ink-600">New government official?</p>
              <Link
                to={ROUTES.registerOfficer}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-terracotta-700 hover:text-terracotta-800 hover:underline"
              >
                <UserCheck className="h-3.5 w-3.5" />
                <span>Request Officer Access</span>
              </Link>
            </div>
          )}

          {activePortal === 'AGENCY' && (
            <div className="rounded-lg border border-ink-200 bg-ink-50/70 p-3 text-center space-y-1.5">
              <p className="text-xs text-ink-600">Need to onboard an implementing agency?</p>
              <Link
                to={ROUTES.registerAgency}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 hover:text-blue-800 hover:underline"
              >
                <Building2 className="h-3.5 w-3.5" />
                <span>Register Implementing Agency</span>
              </Link>
            </div>
          )}

          {activePortal === 'ADMIN' && (
            <div className="rounded-lg border border-ink-200 bg-ink-50/70 p-3 text-center">
              <p className="text-[11px] text-ink-500">
                Super Admin accounts are internally provisioned. Self-registration is disabled.
              </p>
            </div>
          )}

          <div className="text-center pt-1">
            <Link
              to={ROUTES.home}
              className="inline-flex items-center gap-1 text-[11px] text-ink-500 hover:text-ink-800"
            >
              <ArrowLeft className="h-3 w-3" />
              <span>Back to Portal Overview</span>
            </Link>
          </div>
        </div>
      </div>

      <footer className="border-t border-ink-200 bg-ink-50 py-3 text-center text-xs text-ink-500">
        <p>© 2026 National Land Acquisition & Management System (NLAMS) • SIH26016</p>
      </footer>
    </div>
  );
}
