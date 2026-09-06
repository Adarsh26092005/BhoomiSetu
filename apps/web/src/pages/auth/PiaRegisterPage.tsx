import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Building2,
  ShieldCheck,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  User,
  Info,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { organizationsService } from '@/services/organizations.service';
import { ROUTES } from '@/constants/routes';

const piaRegistrationSchema = z.object({
  organizationName: z
    .string()
    .min(3, 'Organization legal name must be at least 3 characters')
    .max(255),
  registrationCode: z
    .string()
    .min(2, 'Registration code / reference is required')
    .max(100),
  state: z.string().min(2, 'State is required'),
  district: z.string().min(2, 'District is required'),
  officeAddress: z.string().min(5, 'Office address is required').max(500),
  adminFullName: z
    .string()
    .min(3, 'Authorized liaison officer name is required')
    .max(150),
  adminEmail: z.string().email('Please enter a valid official email address'),
  adminPhone: z
    .string()
    .min(10, 'Please enter a valid phone number')
    .max(20),
  adminDesignation: z
    .string()
    .min(2, 'Designation / Title is required')
    .max(100),
  adminPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character'),
});

type PiaRegistrationFormValues = z.infer<typeof piaRegistrationSchema>;

export function PiaRegisterPage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submittedOrg, setSubmittedOrg] = useState<{ name: string; code?: string | null } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PiaRegistrationFormValues>({
    resolver: zodResolver(piaRegistrationSchema),
    defaultValues: {
      organizationName: '',
      registrationCode: '',
      state: 'Maharashtra',
      district: 'Mumbai City',
      officeAddress: '',
      adminFullName: '',
      adminEmail: '',
      adminPhone: '',
      adminDesignation: 'Chief Project Manager / Nodal Liaison',
      adminPassword: '',
    },
  });

  const onSubmit = async (values: PiaRegistrationFormValues) => {
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      await organizationsService.registerPia(values);
      setSubmittedOrg({
        name: values.organizationName,
        code: values.registrationCode,
      });
      setIsSuccess(true);
    } catch (err: any) {
      setErrorMsg(
        err.message || 'Registration request could not be processed. Please check your inputs.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper-subtle flex flex-col justify-between">
      {/* Top Sovereign Bar */}
      <header className="border-b border-ink-200 bg-paper py-3 px-6 sm:px-12 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-terracotta-600 text-paper font-bold text-lg">
            NL
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-ink-900 leading-tight">
              NATIONAL LAND ACQUISITION & MANAGEMENT SYSTEM
            </h1>
            <p className="text-[11px] font-medium text-ink-500">
              Government of India • Project Implementing Agency Onboarding
            </p>
          </div>
        </div>

        <Link
          to={ROUTES.login}
          className="flex items-center gap-1.5 text-xs font-semibold text-ink-700 hover:text-ink-900 hover:underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Official Login
        </Link>
      </header>

      {/* Main Container */}
      <main className="flex-1 py-10 px-4 sm:px-8 max-w-4xl mx-auto w-full">
        {isSuccess ? (
          <div className="bg-paper border border-ink-200 rounded-md p-8 shadow-sm space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center gap-4 text-signal-700 bg-signal-50 p-4 rounded-md border border-signal-200">
              <CheckCircle2 className="h-8 w-8 shrink-0 text-signal-600" />
              <div>
                <h2 className="text-base font-bold text-signal-900">
                  Application Submitted for Administrative Review
                </h2>
                <p className="text-xs text-signal-700 mt-0.5">
                  Your organization registration request has been recorded with status{' '}
                  <span className="font-mono font-bold bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded text-[11px]">
                    PENDING_APPROVAL
                  </span>
                  .
                </p>
              </div>
            </div>

            <div className="space-y-3 bg-paper-subtle p-5 rounded-md border border-ink-100 text-xs">
              <h3 className="font-bold text-ink-900 uppercase tracking-wider text-[11px]">
                Registration Summary
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <span className="text-ink-500">Organization Name:</span>
                  <p className="font-semibold text-ink-900">{submittedOrg?.name}</p>
                </div>
                <div>
                  <span className="text-ink-500">Agency Code Reference:</span>
                  <p className="font-mono font-semibold text-ink-900">{submittedOrg?.code}</p>
                </div>
              </div>
            </div>

            <div className="space-y-2 text-xs text-ink-600 leading-relaxed">
              <p className="font-semibold text-ink-800">What happens next?</p>
              <ul className="list-disc list-inside space-y-1 text-ink-600 pl-1">
                <li>
                  A Central or State Administrator will review your incorporation details and statutory project allocation.
                </li>
                <li>
                  Your primary liaison credentials will remain inactive until the administrative review is approved.
                </li>
                <li>
                  Once approved, your account will be activated and you may sign in at the standard portal login.
                </li>
              </ul>
            </div>

            <div className="pt-4 flex gap-3">
              <Button
                variant="primary"
                onClick={() => navigate(ROUTES.login)}
                className="w-full sm:w-auto text-xs"
              >
                Return to Login Portal
              </Button>
            </div>
          </div>
        ) : (
          <div className="bg-paper border border-ink-200 rounded-md shadow-sm overflow-hidden">
            {/* Header banner */}
            <div className="bg-ink-900 text-paper p-6 space-y-2">
              <div className="flex items-center gap-2 text-terracotta-400 text-xs font-semibold uppercase tracking-wider">
                <Building2 className="h-4 w-4" /> Implementing Agency Application
              </div>
              <h2 className="text-lg font-bold">
                Project Implementing Agency (PIA) Registration
              </h2>
              <p className="text-xs text-ink-300 max-w-2xl leading-relaxed">
                Corporations, concessionaires, and public sector undertakings (e.g. NHAI, DFCCIL, Metro Rail Corp, or private EPC contractors) executing approved national projects may submit registration details.
              </p>
            </div>

            {/* Application Disclaimer */}
            <div className="bg-amber-50/80 border-b border-amber-200 p-4 flex items-start gap-3 text-xs text-amber-900">
              <Info className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Application Notice:</span> Submission creates a{' '}
                <span className="font-semibold">PENDING_APPROVAL</span> entity. External statutory registries (MCA, GST, DIN) are verified administratively by designated Central/State authorities.
              </div>
            </div>

            {errorMsg && (
              <div className="m-6 p-4 bg-rust-50 border border-rust-200 rounded text-xs text-rust-800 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-rust-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="p-6 sm:p-8 space-y-8">
              {/* Section 1: Organization Details */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-ink-100">
                  <Building2 className="h-4 w-4 text-terracotta-600" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-ink-800">
                    1. Corporate & Agency Details
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-xs font-semibold text-ink-700">
                      Legal Organization Name *
                    </label>
                    <input
                      type="text"
                      {...register('organizationName')}
                      placeholder="e.g. Larsen & Toubro Infrastructure Projects Ltd"
                      className="w-full h-9 rounded-sm border border-ink-300 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-ink-900"
                    />
                    {errors.organizationName && (
                      <p className="text-[11px] text-rust-600 font-medium">
                        {errors.organizationName.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-ink-700">
                      Agency Code / Bid Identifier *
                    </label>
                    <input
                      type="text"
                      {...register('registrationCode')}
                      placeholder="e.g. PIA-NHAI-PKG4-2026"
                      className="w-full h-9 rounded-sm border border-ink-300 px-3 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-ink-900"
                    />
                    {errors.registrationCode && (
                      <p className="text-[11px] text-rust-600 font-medium">
                        {errors.registrationCode.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-ink-700">
                      Headquarters State *
                    </label>
                    <input
                      type="text"
                      {...register('state')}
                      placeholder="e.g. Maharashtra"
                      className="w-full h-9 rounded-sm border border-ink-300 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-ink-900"
                    />
                    {errors.state && (
                      <p className="text-[11px] text-rust-600 font-medium">
                        {errors.state.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-ink-700">
                      District / City *
                    </label>
                    <input
                      type="text"
                      {...register('district')}
                      placeholder="e.g. Mumbai City"
                      className="w-full h-9 rounded-sm border border-ink-300 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-ink-900"
                    />
                    {errors.district && (
                      <p className="text-[11px] text-rust-600 font-medium">
                        {errors.district.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-xs font-semibold text-ink-700">
                      Registered Office Address *
                    </label>
                    <textarea
                      rows={2}
                      {...register('officeAddress')}
                      placeholder="Complete physical registered address"
                      className="w-full rounded-sm border border-ink-300 p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-ink-900"
                    />
                    {errors.officeAddress && (
                      <p className="text-[11px] text-rust-600 font-medium">
                        {errors.officeAddress.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Section 2: Authorized Liaison Officer */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-ink-100">
                  <User className="h-4 w-4 text-terracotta-600" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-ink-800">
                    2. Primary Authorized Liaison Officer
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-ink-700">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      {...register('adminFullName')}
                      placeholder="e.g. Shri Vikramaditya Patil"
                      className="w-full h-9 rounded-sm border border-ink-300 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-ink-900"
                    />
                    {errors.adminFullName && (
                      <p className="text-[11px] text-rust-600 font-medium">
                        {errors.adminFullName.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-ink-700">
                      Designation *
                    </label>
                    <input
                      type="text"
                      {...register('adminDesignation')}
                      placeholder="e.g. Chief Project Manager / Vice President"
                      className="w-full h-9 rounded-sm border border-ink-300 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-ink-900"
                    />
                    {errors.adminDesignation && (
                      <p className="text-[11px] text-rust-600 font-medium">
                        {errors.adminDesignation.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-ink-700">
                      Official Email Address *
                    </label>
                    <input
                      type="email"
                      {...register('adminEmail')}
                      placeholder="liaison@company.com"
                      className="w-full h-9 rounded-sm border border-ink-300 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-ink-900"
                    />
                    {errors.adminEmail && (
                      <p className="text-[11px] text-rust-600 font-medium">
                        {errors.adminEmail.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-ink-700">
                      Official Contact Phone *
                    </label>
                    <input
                      type="text"
                      {...register('adminPhone')}
                      placeholder="+91-9876543210"
                      className="w-full h-9 rounded-sm border border-ink-300 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-ink-900"
                    />
                    {errors.adminPhone && (
                      <p className="text-[11px] text-rust-600 font-medium">
                        {errors.adminPhone.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-xs font-semibold text-ink-700">
                      Initial Account Password *
                    </label>
                    <input
                      type="password"
                      {...register('adminPassword')}
                      placeholder="At least 8 chars, 1 uppercase, 1 number, 1 symbol"
                      className="w-full h-9 rounded-sm border border-ink-300 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-ink-900"
                    />
                    {errors.adminPassword && (
                      <p className="text-[11px] text-rust-600 font-medium">
                        {errors.adminPassword.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Submit Actions */}
              <div className="pt-4 border-t border-ink-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-[11px] text-ink-500 flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-terracotta-600" />
                  Protected by 256-bit statutory encryption & audit logging.
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate(ROUTES.login)}
                    className="w-full sm:w-auto text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="accent"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto text-xs"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                        Submitting Application...
                      </>
                    ) : (
                      'Submit Registration'
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-ink-200 bg-paper py-4 text-center text-xs text-ink-500">
        © 2026 National Land Acquisition & Management System (NLAMS) • Ministry of Road Transport & Highways
      </footer>
    </div>
  );
}
