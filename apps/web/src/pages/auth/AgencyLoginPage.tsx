import * as React from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ArrowRight, KeyRound, Mail, Building2, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';
import { useLogin } from '@/hooks/use-auth';
import { ROUTES } from '@/constants/routes';
import { Button } from '@/components/ui/button';

export function AgencyLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const loginMutation = useLogin();

  const [email, setEmail] = React.useState('liaison@nhai.gov.in');
  const [password, setPassword] = React.useState('demoPassword123');
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const from = (location.state as { from?: { pathname?: string } })?.from?.pathname || ROUTES.dashboard;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email || !password) {
      setErrorMsg('Please enter both official agency email and password.');
      return;
    }

    try {
      await loginMutation.mutateAsync({ email, password, loginType: 'AGENCY' });
      navigate(from, { replace: true });
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Authentication failed. Please check credentials or ensure your agency registration has been approved.';
      setErrorMsg(message);
    }
  };

  const handleQuickDemo = async () => {
    setEmail('liaison@nhai.gov.in');
    setPassword('demoPassword123');
    setErrorMsg(null);
    try {
      await loginMutation.mutateAsync({
        email: 'liaison@nhai.gov.in',
        password: 'demoPassword123',
        loginType: 'AGENCY',
      });
      navigate(from, { replace: true });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Demo authentication failed.';
      setErrorMsg(message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-ink-50 text-ink-900">
      {/* Sovereign Top Band */}
      <div className="bg-ink-900 text-paper px-4 py-2 text-xs flex items-center justify-between border-b border-ink-800">
        <div className="flex items-center gap-2">
          <span className="font-bold tracking-wider text-[11px] text-terracotta-400">
            भारत सरकार | GOVERNMENT OF INDIA
          </span>
          <span className="hidden sm:inline text-ink-400">•</span>
          <span className="hidden sm:inline text-ink-300">National Land Acquisition & Management System</span>
        </div>
        <span className="text-[11px] text-ink-400">PIA / Corporate Access</span>
      </div>

      <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md bg-paper border border-ink-200 rounded-xl shadow-lg p-6 sm:p-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-900 text-paper font-black text-base shadow-sm">
              <Building2 className="h-6 w-6 text-blue-300" />
            </div>
            <div className="inline-block">
              <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-bold text-blue-700 border border-blue-200">
                IMPLEMENTING AGENCY (PIA) PORTAL
              </span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-ink-900">
              Agency / PIA Sign In
            </h1>
            <p className="text-xs text-ink-500">
              NHAI, DFCCIL, Metro Rail, Port Trusts, Concessionaires & EPC Contractors
            </p>
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
                Official Agency Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="liaison.officer@agency.org.in"
                  className="h-10 w-full rounded-md border border-ink-300 bg-paper pl-9 pr-3 text-xs text-ink-900 placeholder:text-ink-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-ink-700">
                  Password
                </label>
                <span className="text-[10px] text-ink-400">Enterprise Encrypted</span>
              </div>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="h-10 w-full rounded-md border border-ink-300 bg-paper pl-9 pr-3 text-xs text-ink-900 placeholder:text-ink-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={loginMutation.isPending}
              className="w-full flex items-center justify-center gap-2 mt-2 bg-blue-700 hover:bg-blue-800"
            >
              {loginMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Verifying Agency Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In as Implementing Agency</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          {/* Registration / Register Agency Action */}
          <div className="rounded-lg border border-ink-200 bg-ink-50/70 p-3.5 text-center space-y-2">
            <p className="text-xs text-ink-600">
              Need to onboard a new project implementing agency?
            </p>
            <Link
              to={ROUTES.registerAgency}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 hover:text-blue-800 hover:underline"
            >
              <Building2 className="h-3.5 w-3.5" />
              <span>Register Implementing Agency</span>
            </Link>
          </div>

          {/* Quick Demo Access */}
          <div className="border-t border-ink-200 pt-4 text-center">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleQuickDemo}
              disabled={loginMutation.isPending}
              className="w-full text-xs text-ink-600 border-ink-300 hover:bg-ink-100"
            >
              Fill Demo PIA (Vikramaditya Patil • NHAI)
            </Button>
          </div>

          <div className="text-center pt-1">
            <Link
              to={ROUTES.home}
              className="inline-flex items-center gap-1 text-[11px] text-ink-500 hover:text-ink-800"
            >
              <ArrowLeft className="h-3 w-3" />
              <span>Back to Access Portals</span>
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
