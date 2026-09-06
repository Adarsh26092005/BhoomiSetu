import * as React from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ArrowRight, KeyRound, Mail, ShieldAlert, AlertCircle, Loader2, ArrowLeft, Lock } from 'lucide-react';
import { useLogin } from '@/hooks/use-auth';
import { ROUTES } from '@/constants/routes';
import { Button } from '@/components/ui/button';

export function AdminLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const loginMutation = useLogin();

  const [email, setEmail] = React.useState('superadmin@nlams.gov.in');
  const [password, setPassword] = React.useState('demoPassword123');
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const from = (location.state as { from?: { pathname?: string } })?.from?.pathname || ROUTES.dashboard;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email || !password) {
      setErrorMsg('Please enter both administrative email and access password.');
      return;
    }

    try {
      await loginMutation.mutateAsync({ email, password, loginType: 'ADMIN' });
      navigate(from, { replace: true });
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Authentication failed. Please verify credentials or contact national security operations.';
      setErrorMsg(message);
    }
  };

  const handleQuickDemo = async () => {
    setEmail('superadmin@nlams.gov.in');
    setPassword('demoPassword123');
    setErrorMsg(null);
    try {
      await loginMutation.mutateAsync({
        email: 'superadmin@nlams.gov.in',
        password: 'demoPassword123',
        loginType: 'ADMIN',
      });
      navigate(from, { replace: true });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Demo authentication failed.';
      setErrorMsg(message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-ink-950 text-paper">
      {/* Sovereign Top Band */}
      <div className="bg-black/50 text-paper px-4 py-2 text-xs flex items-center justify-between border-b border-ink-800">
        <div className="flex items-center gap-2">
          <span className="font-bold tracking-wider text-[11px] text-rust-400">
            भारत सरकार | GOVERNMENT OF INDIA
          </span>
          <span className="hidden sm:inline text-ink-500">•</span>
          <span className="hidden sm:inline text-ink-400">NLAMS National Operations Center</span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-rust-400 font-semibold">
          <Lock className="h-3 w-3" />
          <span>Restricted Admin Portal</span>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md bg-ink-900 border border-ink-800 rounded-xl shadow-2xl p-6 sm:p-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-rust-950 border border-rust-700 text-rust-400 font-black text-base shadow-sm">
              <ShieldAlert className="h-6 w-6 text-rust-400" />
            </div>
            <div className="inline-block">
              <span className="rounded-full bg-rust-950 px-2.5 py-0.5 text-[11px] font-bold text-rust-400 border border-rust-800">
                SYSTEM SUPER ADMIN ACCESS
              </span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-paper">
              Super Admin Sign In
            </h1>
            <p className="text-xs text-ink-400">
              National, State & District Administrative Platform Governance
            </p>
          </div>

          {errorMsg && (
            <div className="flex items-start gap-2.5 rounded-lg border border-rust-800 bg-rust-950 p-3 text-xs text-rust-300">
              <AlertCircle className="h-4 w-4 shrink-0 text-rust-400 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-ink-300 block">
                Super Admin Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="superadmin@nlams.gov.in"
                  className="h-10 w-full rounded-md border border-ink-700 bg-ink-800 pl-9 pr-3 text-xs text-paper placeholder:text-ink-500 focus:border-rust-500 focus:outline-none focus:ring-1 focus:ring-rust-500"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-ink-300">
                  Password
                </label>
                <span className="text-[10px] text-ink-500">Hardware / MFA Guarded</span>
              </div>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="h-10 w-full rounded-md border border-ink-700 bg-ink-800 pl-9 pr-3 text-xs text-paper placeholder:text-ink-500 focus:border-rust-500 focus:outline-none focus:ring-1 focus:ring-rust-500"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={loginMutation.isPending}
              className="w-full flex items-center justify-center gap-2 mt-2 bg-rust-700 hover:bg-rust-800 text-paper border-0"
            >
              {loginMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Authenticating Super Admin...</span>
                </>
              ) : (
                <>
                  <span>Sign In as Super Admin</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          {/* Policy Notice: NO registration link per locked criteria */}
          <div className="rounded-lg border border-ink-800 bg-ink-950 p-3 text-center space-y-1">
            <p className="text-[11px] text-ink-400">
              Super Admin access is securely pre-provisioned. Self-registration is strictly prohibited under national cyber governance policies.
            </p>
          </div>

          {/* Quick Demo Access */}
          <div className="border-t border-ink-800 pt-4 text-center">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleQuickDemo}
              disabled={loginMutation.isPending}
              className="w-full text-xs text-ink-300 border-ink-700 hover:bg-ink-800"
            >
              Fill Demo Admin (Dr. Rajesh Sharma • Central Super Admin)
            </Button>
          </div>

          <div className="text-center pt-1">
            <Link
              to={ROUTES.home}
              className="inline-flex items-center gap-1 text-[11px] text-ink-400 hover:text-paper"
            >
              <ArrowLeft className="h-3 w-3" />
              <span>Back to Access Portals</span>
            </Link>
          </div>
        </div>
      </div>

      <footer className="border-t border-ink-800 bg-black/50 py-3 text-center text-xs text-ink-500">
        <p>© 2026 National Land Acquisition & Management System (NLAMS) • Central Governance Cell</p>
      </footer>
    </div>
  );
}
