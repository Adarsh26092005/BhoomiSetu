import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Building2,
  Globe,
  MapPin,
  Shield,
  ShieldAlert,
  Sparkles,
  Lock,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { ROUTES } from '@/constants/routes';
import { Button } from '@/components/ui/button';

export function LandingPage() {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <div className="min-h-screen flex flex-col bg-paper text-ink-900">
      {/* Top Sovereign Bar */}
      <div className="bg-ink-900 text-paper px-4 py-2 text-xs flex items-center justify-between border-b border-ink-800">
        <div className="flex items-center gap-2">
          <span className="font-bold tracking-wider text-[11px] text-terracotta-400">
            भारत सरकार | GOVERNMENT OF INDIA
          </span>
          <span className="hidden sm:inline text-ink-400">•</span>
          <span className="hidden sm:inline text-ink-300">
            Ministry of Rural Development & Department of Land Resources
          </span>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-ink-300">
          <span>SIH 2026 (SIH26016)</span>
        </div>
      </div>

      {/* Portal Header */}
      <header className="border-b border-ink-200 bg-paper/95 backdrop-blur-sm sticky top-0 z-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-ink-900 text-paper font-bold text-sm">
              GOI
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-extrabold tracking-tight text-ink-900">NLAMS</span>
                <span className="rounded bg-terracotta-50 px-1.5 py-0.2 text-[10px] font-bold text-terracotta-700 border border-terracotta-200">
                  NATIONAL PORTAL
                </span>
              </div>
              <p className="text-[11px] text-ink-500 font-medium">
                National Land Acquisition & Management System
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate(ROUTES.dashboard)}
                className="flex items-center gap-2"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(ROUTES.loginAgency)}
                  className="hidden sm:flex text-xs"
                >
                  <span>Agency Login</span>
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate(ROUTES.loginOfficer)}
                  className="flex items-center gap-1.5 text-xs"
                >
                  <span>Officer Sign In</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative overflow-hidden border-b border-ink-200 bg-gradient-to-b from-ink-50/60 to-paper py-12 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-terracotta-200 bg-terracotta-50 px-3 py-1 text-xs font-semibold text-terracotta-800">
                <Sparkles className="h-3.5 w-3.5 text-terracotta-600" />
                <span>LARR Act 2013 & Direct Benefit Transfer Compliant</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-ink-900 leading-tight">
                Unified National Land Acquisition & GIS Cadastral Management
              </h1>

              <p className="text-base sm:text-lg text-ink-600 leading-relaxed">
                An end-to-end sovereign government platform orchestrating project proposals, cadastral parcel identification, multi-tier statutory approvals, transparent compensation disbursement, and AI-assisted delay prediction across India.
              </p>
            </div>

            {/* ACCESS NLAMS — 3 SEPARATE LOGIN EXPERIENCES */}
            <div className="mt-12 pt-8 border-t border-ink-200">
              <div className="mb-6 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-terracotta-700">
                    ACCESS NLAMS
                  </span>
                  <span className="h-px flex-1 bg-ink-200" />
                </div>
                <h2 className="text-xl font-bold tracking-tight text-ink-900">
                  Select Your Access Portal
                </h2>
                <p className="text-xs text-ink-500">
                  Dedicated sovereign entry points for government officials, project executing agencies, and platform administrators.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* 1. Government Officer Card */}
                <div className="rounded-xl border border-terracotta-200 bg-gradient-to-br from-paper to-terracotta-50/40 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-terracotta-700 text-paper font-bold shadow-xs">
                        <Shield className="h-6 w-6" />
                      </div>
                      <span className="rounded-full bg-terracotta-100 px-2.5 py-0.5 text-[10px] font-bold text-terracotta-800 border border-terracotta-300">
                        GOVERNMENT
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-ink-900">Government Officer Login</h3>
                      <p className="text-xs text-ink-600 mt-1 leading-relaxed">
                        For Central Ministries, State Revenue Authorities, and District Land Acquisition Officers (LAO / SLAO).
                      </p>
                    </div>

                    <div className="text-[11px] text-ink-500 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-terracotta-600" />
                        <span>Statutory Scrutiny & Approvals</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-terracotta-600" />
                        <span>Cadastral Survey & Title Verification</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-terracotta-600" />
                        <span>Award Declaration & DBT Disbursement</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-ink-200/60">
                    <Button
                      variant="primary"
                      size="md"
                      onClick={() => navigate(ROUTES.loginOfficer)}
                      className="w-full flex items-center justify-center gap-2 text-xs font-semibold bg-terracotta-700 hover:bg-terracotta-800"
                    >
                      <span>Sign In as Government Officer</span>
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                    <div className="text-center">
                      <button
                        type="button"
                        onClick={() => navigate(ROUTES.registerOfficer)}
                        className="text-[11px] font-semibold text-terracotta-700 hover:underline"
                      >
                        Request Officer Access →
                      </button>
                    </div>
                  </div>
                </div>

                {/* 2. Agency / PIA Card */}
                <div className="rounded-xl border border-blue-200 bg-gradient-to-br from-paper to-blue-50/40 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-700 text-paper font-bold shadow-xs">
                        <Building2 className="h-6 w-6" />
                      </div>
                      <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-[10px] font-bold text-blue-800 border border-blue-300">
                        IMPLEMENTING AGENCY
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-ink-900">Agency / PIA Login</h3>
                      <p className="text-xs text-ink-600 mt-1 leading-relaxed">
                        For NHAI, DFCCIL, Metro Rail Corporations, Port Trusts, Concessionaires & Infrastructure Agencies.
                      </p>
                    </div>

                    <div className="text-[11px] text-ink-500 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                        <span>Project Proposal Submission</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                        <span>Cadastral Alignment Tracking</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                        <span>Possession & Handover Status</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-ink-200/60">
                    <Button
                      variant="primary"
                      size="md"
                      onClick={() => navigate(ROUTES.loginAgency)}
                      className="w-full flex items-center justify-center gap-2 text-xs font-semibold bg-blue-700 hover:bg-blue-800"
                    >
                      <span>Sign In as Implementing Agency</span>
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                    <div className="text-center">
                      <button
                        type="button"
                        onClick={() => navigate(ROUTES.registerAgency)}
                        className="text-[11px] font-semibold text-blue-700 hover:underline"
                      >
                        Register Implementing Agency →
                      </button>
                    </div>
                  </div>
                </div>

                {/* 3. Super Admin Card */}
                <div className="rounded-xl border border-ink-300 bg-gradient-to-br from-paper to-ink-100/60 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-ink-900 text-paper font-bold shadow-xs">
                        <ShieldAlert className="h-6 w-6 text-rust-400" />
                      </div>
                      <span className="rounded-full bg-ink-200 px-2.5 py-0.5 text-[10px] font-bold text-ink-800 border border-ink-300">
                        ADMINISTRATIVE
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-ink-900">Super Admin Login</h3>
                      <p className="text-xs text-ink-600 mt-1 leading-relaxed">
                        For Central, State, and District Platform Administrators & System Security Controllers.
                      </p>
                    </div>

                    <div className="text-[11px] text-ink-500 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-ink-800" />
                        <span>Platform User & Organization Governance</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-ink-800" />
                        <span>PIA Application Verification Queue</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-ink-800" />
                        <span>National Sovereign Audit Log Trail</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-ink-200/60">
                    <Button
                      variant="primary"
                      size="md"
                      onClick={() => navigate(ROUTES.loginAdmin)}
                      className="w-full flex items-center justify-center gap-2 text-xs font-semibold bg-ink-900 hover:bg-black text-paper"
                    >
                      <Lock className="h-3.5 w-3.5" />
                      <span>Sign In as Super Admin</span>
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                    <div className="text-center">
                      <span className="text-[10px] text-ink-500 italic">
                        Pre-provisioned Credentials Only
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature Pillar Cards */}
            <div className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg border border-ink-200 bg-paper p-5 shadow-xs">
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-ink-100 text-ink-800 mb-3">
                  <Building2 className="h-5 w-5 text-terracotta-600" />
                </div>
                <h3 className="text-sm font-bold text-ink-900">17-Stage Lifecycle</h3>
                <p className="mt-1 text-xs text-ink-500">
                  From proposal scrutiny to gazette notification, award declaration, and possession handover.
                </p>
              </div>

              <div className="rounded-lg border border-ink-200 bg-paper p-5 shadow-xs">
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-ink-100 text-ink-800 mb-3">
                  <MapPin className="h-5 w-5 text-terracotta-600" />
                </div>
                <h3 className="text-sm font-bold text-ink-900">GIS Cadastral Mapping</h3>
                <p className="mt-1 text-xs text-ink-500">
                  MapLibre GL JS integration with spatial boundary layers, survey numbers, and dispute markers.
                </p>
              </div>

              <div className="rounded-lg border border-ink-200 bg-paper p-5 shadow-xs">
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-ink-100 text-ink-800 mb-3">
                  <Shield className="h-5 w-5 text-terracotta-600" />
                </div>
                <h3 className="text-sm font-bold text-ink-900">12 Role RBAC & Audit</h3>
                <p className="mt-1 text-xs text-ink-500">
                  Strict jurisdictional separation across Central, State, District, and Implementing Authorities.
                </p>
              </div>

              <div className="rounded-lg border border-ink-200 bg-paper p-5 shadow-xs">
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-ink-100 text-ink-800 mb-3">
                  <Sparkles className="h-5 w-5 text-terracotta-600" />
                </div>
                <h3 className="text-sm font-bold text-ink-900">AI Delay Prediction</h3>
                <p className="mt-1 text-xs text-ink-500">
                  FastAPI ML service with XGBoost risk scoring, SHAP explainability, and intelligent workflow assistants.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Portal Footer */}
      <footer className="border-t border-ink-200 bg-ink-50 py-8 text-xs text-ink-500">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 National Land Acquisition & Management System (NLAMS) • SIH26016</p>
          <p className="flex items-center gap-1">
            <Globe className="h-3.5 w-3.5 text-ink-400" />
            <span>Designed for National Infrastructure & Sovereign Development</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
