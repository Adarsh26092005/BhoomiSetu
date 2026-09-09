import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Shield,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  User,
  Building,
  Info,
  Loader2,
  Lock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { organizationsService } from '@/services/organizations.service';
import { ROUTES } from '@/constants/routes';
import { StateDistrictSelector } from '@/components/common/StateDistrictSelector';
import { isValidDistrictForState } from '@/data/indiaAdministrativeData';

const officerRegistrationSchema = z
  .object({
    fullName: z
      .string()
      .min(3, 'Full name must be at least 3 characters')
      .max(150),
    email: z
      .string()
      .email('Please enter a valid official government email address'),
    phone: z
      .string()
      .min(10, 'Please enter a valid official phone number')
      .max(20),
    employeeId: z
      .string()
      .min(2, 'Official Employee / Officer ID is required')
      .max(50),
    designation: z
      .string()
      .min(2, 'Official government designation is required')
      .max(100),
    departmentName: z
      .string()
      .min(3, 'Department or Ministry name is required')
      .max(200),
    organizationType: z.enum(
      ['CENTRAL_MINISTRY', 'STATE_AUTHORITY', 'DISTRICT_AUTHORITY'],
      {
        required_error: 'Please select an organization tier',
      },
    ),
    state: z.string().min(2, 'State / Union Territory is required'),
    district: z.string().min(2, 'District is required'),
    officeAddress: z.string().min(5, 'Official office address is required'),
    requestedRole: z.enum(
      [
        'LAND_ACQUISITION_OFFICER',
        'SURVEY_OFFICER',
        'REVENUE_OFFICER',
        'VERIFICATION_OFFICER',
        'FINANCE_OFFICER',
        'R_AND_R_OFFICER',
        'DISTRICT_OFFICER',
        'STATE_OFFICER',
        'CENTRAL_OFFICER',
        'VIEWER',
      ],
      {
        required_error: 'Please select your requested statutory government role',
      },
    ),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters long')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character'),
    confirmPassword: z.string().min(8, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
  .refine((data) => !data.state || !data.district || isValidDistrictForState(data.state, data.district), {
    message: 'Selected District does not belong to the selected State / Union Territory',
    path: ['district'],
  });

type OfficerRegistrationFormValues = z.infer<typeof officerRegistrationSchema>;

const CANONICAL_GOV_ROLES = [
  { value: 'LAND_ACQUISITION_OFFICER', label: 'Land Acquisition Officer (LAO / SLAO)' },
  { value: 'SURVEY_OFFICER', label: 'Survey Officer (Cadastral & Ground Truthing)' },
  { value: 'REVENUE_OFFICER', label: 'Revenue Officer (Tehsildar / Village Records)' },
  { value: 'VERIFICATION_OFFICER', label: 'Verification Officer (Title & Scrutiny)' },
  { value: 'FINANCE_OFFICER', label: 'Finance Officer (Disbursement & DBT Accounts)' },
  { value: 'R_AND_R_OFFICER', label: 'R&R Officer (Rehabilitation & Resettlement)' },
  { value: 'DISTRICT_OFFICER', label: 'District Officer (Collectorate / DM Nodal)' },
  { value: 'STATE_OFFICER', label: 'State Officer (State Authority Directorate)' },
  { value: 'CENTRAL_OFFICER', label: 'Central Officer (Ministry Nodal Desk)' },
  { value: 'VIEWER', label: 'Statutory Auditor / Viewer (Read-Only Observer)' },
];

export function OfficerRegisterPage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submittedUser, setSubmittedUser] = useState<{
    name: string;
    email: string;
    role: string;
    department: string;
  } | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<OfficerRegistrationFormValues>({
    resolver: zodResolver(officerRegistrationSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      employeeId: '',
      designation: '',
      departmentName: '',
      organizationType: 'DISTRICT_AUTHORITY',
      state: '',
      district: '',
      officeAddress: '',
      requestedRole: 'LAND_ACQUISITION_OFFICER',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (values: OfficerRegistrationFormValues) => {
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      await organizationsService.registerOfficer({
        fullName: values.fullName,
        email: values.email,
        phone: values.phone,
        employeeId: values.employeeId,
        designation: values.designation,
        departmentName: values.departmentName,
        organizationType: values.organizationType,
        state: values.state,
        district: values.district,
        officeAddress: values.officeAddress,
        requestedRole: values.requestedRole,
        password: values.password,
      });

      setSubmittedUser({
        name: values.fullName,
        email: values.email,
        role: values.requestedRole,
        department: values.departmentName,
      });
      setIsSuccess(true);
    } catch (err: any) {
      setErrorMsg(
        err.message || 'Access request could not be processed. Please verify your details.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-ink-50 text-ink-900">
      {/* Sovereign Top Bar */}
      <div className="bg-ink-900 text-paper px-4 py-2 text-xs flex items-center justify-between border-b border-ink-800">
        <div className="flex items-center gap-2">
          <span className="font-bold tracking-wider text-[11px] text-terracotta-400">
            भारत सरकार | GOVERNMENT OF INDIA
          </span>
          <span className="hidden sm:inline text-ink-400">•</span>
          <span className="hidden sm:inline text-ink-300">
            Department of Land Resources & Ministry of Rural Development
          </span>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-ink-300">
          <span>Official Officer Onboarding</span>
        </div>
      </div>

      <div className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <div className="mb-6 flex items-center justify-between">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => navigate(ROUTES.loginOfficer)}
            className="flex items-center gap-1.5 text-xs text-ink-600 hover:text-ink-900"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Officer Sign In</span>
          </Button>

          <span className="text-xs font-semibold px-2.5 py-1 rounded bg-terracotta-100 text-terracotta-800 border border-terracotta-200">
            Government Officer Portal
          </span>
        </div>

        {isSuccess ? (
          /* Success Screen */
          <div className="bg-paper border border-ink-200 rounded-xl shadow-lg p-6 sm:p-10 space-y-6 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-forest-50 border border-forest-200 text-forest-600">
              <CheckCircle2 className="h-10 w-10" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tight text-ink-900">
                Officer Access Request Submitted
              </h2>
              <p className="text-sm text-ink-600 max-w-lg mx-auto">
                Your statutory access request for <strong className="text-ink-900">{submittedUser?.name}</strong> has been registered in the pending approval queue.
              </p>
            </div>

            <div className="max-w-md mx-auto rounded-lg border border-ink-200 bg-ink-50/50 p-4 text-left text-xs space-y-2 text-ink-700">
              <div className="flex justify-between">
                <span className="font-semibold text-ink-500">Official Email:</span>
                <span className="font-mono text-ink-900">{submittedUser?.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-ink-500">Department:</span>
                <span className="text-ink-900">{submittedUser?.department}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-ink-500">Requested Role:</span>
                <span className="text-ink-900 font-medium">{submittedUser?.role}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-ink-500">Account Status:</span>
                <span className="inline-flex items-center gap-1 font-semibold text-amber-700">
                  <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                  Pending Administrative Approval
                </span>
              </div>
            </div>

            <div className="rounded-lg border border-blue-200 bg-blue-50/60 p-4 text-left text-xs text-blue-800 space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <Info className="h-4 w-4 text-blue-600 shrink-0" />
                <span>Verification Workflow Notice</span>
              </div>
              <p>
                In accordance with sovereign IT security guidelines, newly requested government accounts remain inactive until verified by your District Collectorate Nodal Officer, State Authority, or Central Administrator. You will receive an official notification once approved.
              </p>
            </div>

            <div className="pt-2">
              <Button
                variant="primary"
                size="md"
                onClick={() => navigate(ROUTES.loginOfficer)}
                className="w-full sm:w-auto px-8"
              >
                Return to Officer Login
              </Button>
            </div>
          </div>
        ) : (
          /* Registration Form */
          <div className="bg-paper border border-ink-200 rounded-xl shadow-lg p-6 sm:p-8 space-y-8">
            <div className="space-y-2 border-b border-ink-200 pb-5">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-ink-900 text-paper font-bold text-sm">
                  GOI
                </div>
                <div>
                  <h1 className="text-xl font-bold tracking-tight text-ink-900">
                    Request Government Officer Access
                  </h1>
                  <p className="text-xs text-ink-500">
                    National Land Acquisition & Management System (NLAMS)
                  </p>
                </div>
              </div>
              <p className="text-xs text-ink-600 pt-2">
                This registration is strictly for authorized Central, State, and District government officials conducting statutory land acquisition proceedings under the RFCTLARR Act 2013.
              </p>
            </div>

            {errorMsg && (
              <div className="flex items-start gap-2.5 rounded-lg border border-rust-200 bg-rust-50 p-3.5 text-xs text-rust-800">
                <AlertCircle className="h-4 w-4 shrink-0 text-rust-600 mt-0.5" />
                <div>
                  <span className="font-semibold block">Submission Error</span>
                  <span>{errorMsg}</span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {/* SECTION 1: Officer Personal & Contact Details */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-bold text-ink-900 border-b border-ink-100 pb-2">
                  <User className="h-4 w-4 text-terracotta-600" />
                  <span>1. Officer Profile & Official Credentials</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-ink-700">
                      Full Legal Name <span className="text-rust-600">*</span>
                    </label>
                    <input
                      type="text"
                      {...register('fullName')}
                      placeholder="e.g. Shri Anand Kumar Verma"
                      className="h-9 w-full rounded-md border border-ink-300 bg-paper px-3 text-xs text-ink-900 placeholder:text-ink-400 focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
                    />
                    {errors.fullName && (
                      <p className="text-[11px] text-rust-600">{errors.fullName.message}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-ink-700">
                      Official Government Email <span className="text-rust-600">*</span>
                    </label>
                    <input
                      type="email"
                      {...register('email')}
                      placeholder="officer.name@revenue.state.gov.in"
                      className="h-9 w-full rounded-md border border-ink-300 bg-paper px-3 text-xs text-ink-900 placeholder:text-ink-400 focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
                    />
                    {errors.email && (
                      <p className="text-[11px] text-rust-600">{errors.email.message}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-ink-700">
                      Official Contact / Mobile Number <span className="text-rust-600">*</span>
                    </label>
                    <input
                      type="tel"
                      {...register('phone')}
                      placeholder="+91-9876543210"
                      className="h-9 w-full rounded-md border border-ink-300 bg-paper px-3 text-xs text-ink-900 placeholder:text-ink-400 focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
                    />
                    {errors.phone && (
                      <p className="text-[11px] text-rust-600">{errors.phone.message}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-ink-700">
                      Officer ID / Employee Code <span className="text-rust-600">*</span>
                    </label>
                    <input
                      type="text"
                      {...register('employeeId')}
                      placeholder="e.g. GOV-REV-2026-8941"
                      className="h-9 w-full rounded-md border border-ink-300 bg-paper px-3 text-xs text-ink-900 placeholder:text-ink-400 focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
                    />
                    {errors.employeeId && (
                      <p className="text-[11px] text-rust-600">{errors.employeeId.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* SECTION 2: Government Department & Jurisdiction */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-bold text-ink-900 border-b border-ink-100 pb-2">
                  <Building className="h-4 w-4 text-terracotta-600" />
                  <span>2. Department, Jurisdiction & Tier</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-semibold text-ink-700">
                      Official Designation <span className="text-rust-600">*</span>
                    </label>
                    <input
                      type="text"
                      {...register('designation')}
                      placeholder="e.g. Special Land Acquisition Officer (SLAO) / Deputy Collector"
                      className="h-9 w-full rounded-md border border-ink-300 bg-paper px-3 text-xs text-ink-900 placeholder:text-ink-400 focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
                    />
                    {errors.designation && (
                      <p className="text-[11px] text-rust-600">{errors.designation.message}</p>
                    )}
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-semibold text-ink-700">
                      Department / Ministry Name <span className="text-rust-600">*</span>
                    </label>
                    <input
                      type="text"
                      {...register('departmentName')}
                      placeholder="e.g. Department of Revenue & Land Records, Govt of Maharashtra"
                      className="h-9 w-full rounded-md border border-ink-300 bg-paper px-3 text-xs text-ink-900 placeholder:text-ink-400 focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
                    />
                    {errors.departmentName && (
                      <p className="text-[11px] text-rust-600">{errors.departmentName.message}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-ink-700">
                      Government Tier / Level <span className="text-rust-600">*</span>
                    </label>
                    <select
                      {...register('organizationType')}
                      className="h-9 w-full rounded-md border border-ink-300 bg-paper px-3 text-xs text-ink-900 focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
                    >
                      <option value="DISTRICT_AUTHORITY">District Authority (Collectorate / SLAO Office)</option>
                      <option value="STATE_AUTHORITY">State Authority (Directorate / Revenue Secretariat)</option>
                      <option value="CENTRAL_MINISTRY">Central Ministry (MoRD / DoLR / Central Nodal)</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <StateDistrictSelector
                      stateValue={watch('state') || ''}
                      onStateChange={(val) => {
                        setValue('state', val, { shouldValidate: true });
                        setValue('district', '', { shouldValidate: true });
                      }}
                      districtValue={watch('district') || ''}
                      onDistrictChange={(val) => setValue('district', val, { shouldValidate: true })}
                      stateLabel="State / Union Territory"
                      districtLabel="District Jurisdiction"
                      stateError={errors.state?.message}
                      districtError={errors.district?.message}
                    />
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-semibold text-ink-700">
                      Official Office / Postal Address <span className="text-rust-600">*</span>
                    </label>
                    <input
                      type="text"
                      {...register('officeAddress')}
                      placeholder="e.g. Collectorate Compound, Civil Lines, Nagpur - 440001"
                      className="h-9 w-full rounded-md border border-ink-300 bg-paper px-3 text-xs text-ink-900 placeholder:text-ink-400 focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
                    />
                    {errors.officeAddress && (
                      <p className="text-[11px] text-rust-600">{errors.officeAddress.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* SECTION 3: Requested Statutory Role */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-bold text-ink-900 border-b border-ink-100 pb-2">
                  <Shield className="h-4 w-4 text-terracotta-600" />
                  <span>3. Statutory Role Request</span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-ink-700">
                    Select Requested Government Role <span className="text-rust-600">*</span>
                  </label>
                  <select
                    {...register('requestedRole')}
                    className="h-9 w-full rounded-md border border-ink-300 bg-paper px-3 text-xs text-ink-900 focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
                  >
                    {CANONICAL_GOV_ROLES.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-ink-500">
                    Note: Super Admin is an internally provisioned platform role and cannot be self-requested.
                  </p>
                </div>
              </div>

              {/* SECTION 4: Security Credentials */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-bold text-ink-900 border-b border-ink-100 pb-2">
                  <Lock className="h-4 w-4 text-terracotta-600" />
                  <span>4. Account Access Security</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-ink-700">
                      Create Password <span className="text-rust-600">*</span>
                    </label>
                    <input
                      type="password"
                      {...register('password')}
                      placeholder="••••••••••••"
                      className="h-9 w-full rounded-md border border-ink-300 bg-paper px-3 text-xs text-ink-900 placeholder:text-ink-400 focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
                    />
                    {errors.password && (
                      <p className="text-[11px] text-rust-600">{errors.password.message}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-ink-700">
                      Confirm Password <span className="text-rust-600">*</span>
                    </label>
                    <input
                      type="password"
                      {...register('confirmPassword')}
                      placeholder="••••••••••••"
                      className="h-9 w-full rounded-md border border-ink-300 bg-paper px-3 text-xs text-ink-900 placeholder:text-ink-400 focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
                    />
                    {errors.confirmPassword && (
                      <p className="text-[11px] text-rust-600">
                        {errors.confirmPassword.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Submission CTA */}
              <div className="border-t border-ink-200 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-[11px] text-ink-500 max-w-sm">
                  By submitting this request, you declare that you are a bonafide government official authorized to access statutory land acquisition records.
                </p>

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Submitting Request...</span>
                    </>
                  ) : (
                    <span>Submit Officer Access Request</span>
                  )}
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Sovereign Footer */}
      <footer className="border-t border-ink-200 bg-ink-50 py-4 text-center text-xs text-ink-500">
        <p>© 2026 National Land Acquisition & Management System (NLAMS) • SIH26016</p>
      </footer>
    </div>
  );
}
