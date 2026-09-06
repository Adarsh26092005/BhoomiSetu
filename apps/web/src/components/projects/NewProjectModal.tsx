import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AlertCircle, Building2, CheckCircle2, Landmark, Loader2, X } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { useCreateProject } from '@/hooks/use-projects';
import { Button } from '@/components/ui/button';
import type { ProjectCategory } from '@/types';

const projectSchema = z.object({
  code: z
    .string()
    .min(3, 'Project code must be at least 3 characters')
    .max(50, 'Project code cannot exceed 50 characters')
    .regex(/^[A-Za-z0-9-_/]+$/, 'Project code may only contain alphanumeric characters, hyphens, underscores, and slashes'),
  title: z
    .string()
    .min(5, 'Project title must be at least 5 characters')
    .max(200, 'Project title cannot exceed 200 characters'),
  description: z.string().optional(),
  category: z.enum([
    'HIGHWAY',
    'RAILWAY',
    'IRRIGATION',
    'INDUSTRIAL_CORRIDOR',
    'URBAN_INFRASTRUCTURE',
    'ENERGY',
    'DEFENCE',
  ] as const),
  implementingAgencyName: z.string().optional(),
  state: z.string().min(2, 'State is required'),
  districtsInput: z.string().min(2, 'At least one district is required'),
  totalAreaHectares: z
    .number({ invalid_type_error: 'Must be a valid number' })
    .min(0.01, 'Land area must be greater than 0'),
  estimatedCompensationInr: z
    .number({ invalid_type_error: 'Must be a valid number' })
    .min(0, 'Compensation budget cannot be negative'),
  notifiedOn: z.string().optional(),
  targetCompletionOn: z.string().optional(),
});

type ProjectFormData = z.infer<typeof projectSchema>;

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NewProjectModal({ isOpen, onClose }: NewProjectModalProps) {
  const session = useAuthStore((state) => state.session);
  const user = session?.user;
  const isPiaUser = user?.accountType === 'PIA_USER';

  const createMutation = useCreateProject();
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      category: 'HIGHWAY',
      state: isPiaUser ? '' : '',
      totalAreaHectares: 0,
      estimatedCompensationInr: 0,
    },
  });

  React.useEffect(() => {
    if (isOpen) {
      setServerError(null);
      setSuccess(false);
      reset();
    }
  }, [isOpen, reset]);

  if (!isOpen) return null;

  const onSubmit = async (data: ProjectFormData) => {
    setServerError(null);
    try {
      const districts = data.districtsInput
        .split(',')
        .map((d) => d.trim())
        .filter((d) => d.length > 0);

      await createMutation.mutateAsync({
        code: data.code.trim().toUpperCase(),
        title: data.title.trim(),
        description: data.description?.trim(),
        category: data.category as ProjectCategory,
        state: data.state.trim(),
        districts,
        totalAreaHectares: data.totalAreaHectares,
        estimatedCompensationInr: data.estimatedCompensationInr,
        notifiedOn: data.notifiedOn || undefined,
        targetCompletionOn: data.targetCompletionOn || undefined,
      });

      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to register project proposal. Please verify your statutory details.';
      setServerError(Array.isArray(msg) ? msg.join(', ') : msg);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/50 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl bg-paper rounded-xl border border-ink-200 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-ink-200 bg-ink-50/70 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-ink-900 text-paper">
              <Landmark className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-ink-900">Register Land Acquisition Project Proposal</h2>
              <p className="text-[11px] text-ink-500">Initiate Section 4 Social Impact Assessment & Preliminary Scheme Proposal</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-ink-500 hover:bg-ink-100 hover:text-ink-900"
            aria-label="Close dialog"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {success ? (
          <div className="p-8 text-center space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-signal-50 text-signal-700">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-ink-900">Statutory Project Proposal Registered</h3>
            <p className="text-xs text-ink-500 max-w-md mx-auto">
              Project draft initiated and synchronized with the National Projects Registry.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4 overflow-y-auto">
            {serverError && (
              <div className="rounded-lg border border-rust-200 bg-rust-50 p-3 text-xs text-rust-900 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-rust-700 shrink-0 mt-0.5" />
                <span>{serverError}</span>
              </div>
            )}

            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
              <span>
                <strong>Statutory Notice:</strong> Project initiation is subject to jurisdictional authority verification under Section 11 of the RFCTLARR Act 2013.
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5 sm:col-span-2">
                <label className="font-semibold text-ink-800">Project Title / Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Bangalore–Chennai Expressway Alignment Phase 2"
                  {...register('title')}
                  className="h-9 w-full rounded-md border border-ink-300 px-3 text-xs text-ink-900 focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
                />
                {errors.title && <p className="text-[11px] text-rust-600 font-medium">{errors.title.message}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-ink-800">Project Code / Gazette ID *</label>
                <input
                  type="text"
                  placeholder="e.g. NHAI-BCE-PH2"
                  {...register('code')}
                  className="h-9 w-full rounded-md border border-ink-300 px-3 text-xs text-ink-900 font-mono uppercase focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
                />
                {errors.code && <p className="text-[11px] text-rust-600 font-medium">{errors.code.message}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-ink-800">Infrastructure Category *</label>
                <select
                  {...register('category')}
                  className="h-9 w-full rounded-md border border-ink-300 px-3 text-xs text-ink-900 focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
                >
                  <option value="HIGHWAY">Highway / Expressways</option>
                  <option value="RAILWAY">Railway & High-Speed Rail</option>
                  <option value="IRRIGATION">Irrigation & Canal Networks</option>
                  <option value="INDUSTRIAL_CORRIDOR">Industrial Corridor (DMIC/NICDIT)</option>
                  <option value="URBAN_INFRASTRUCTURE">Urban Infrastructure</option>
                  <option value="ENERGY">Energy & Cross-Country Pipelines</option>
                  <option value="DEFENCE">Strategic & Defence Installation</option>
                </select>
                {errors.category && <p className="text-[11px] text-rust-600 font-medium">{errors.category.message}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-ink-800">Primary State *</label>
                <input
                  type="text"
                  placeholder="e.g. Karnataka"
                  {...register('state')}
                  className="h-9 w-full rounded-md border border-ink-300 px-3 text-xs text-ink-900 focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
                />
                {errors.state && <p className="text-[11px] text-rust-600 font-medium">{errors.state.message}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-ink-800">Districts Covered (Comma-separated) *</label>
                <input
                  type="text"
                  placeholder="e.g. Kolar, Bengaluru Rural"
                  {...register('districtsInput')}
                  className="h-9 w-full rounded-md border border-ink-300 px-3 text-xs text-ink-900 focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
                />
                {errors.districtsInput && (
                  <p className="text-[11px] text-rust-600 font-medium">{errors.districtsInput.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-ink-800">Estimated Land Area (Hectares) *</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="e.g. 350.5"
                  {...register('totalAreaHectares', { valueAsNumber: true })}
                  className="h-9 w-full rounded-md border border-ink-300 px-3 text-xs text-ink-900 font-mono focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
                />
                {errors.totalAreaHectares && (
                  <p className="text-[11px] text-rust-600 font-medium">{errors.totalAreaHectares.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-ink-800">Estimated Compensation Budget (INR) *</label>
                <input
                  type="number"
                  placeholder="e.g. 1500000000"
                  {...register('estimatedCompensationInr', { valueAsNumber: true })}
                  className="h-9 w-full rounded-md border border-ink-300 px-3 text-xs text-ink-900 font-mono focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
                />
                {errors.estimatedCompensationInr && (
                  <p className="text-[11px] text-rust-600 font-medium">{errors.estimatedCompensationInr.message}</p>
                )}
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="font-semibold text-ink-800">Scope Description / Corridor Alignment</label>
                <textarea
                  rows={3}
                  placeholder="Provide alignment specifics, key towns intersected, and statutory milestones..."
                  {...register('description')}
                  className="w-full rounded-md border border-ink-300 p-2.5 text-xs text-ink-900 focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
                />
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="pt-4 border-t border-ink-200 flex items-center justify-end gap-2.5">
              <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={createMutation.isPending}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={createMutation.isPending}
                className="flex items-center gap-1.5 shadow-xs"
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Registering Proposal...</span>
                  </>
                ) : (
                  <>
                    <Building2 className="h-4 w-4" />
                    <span>Create Draft Proposal</span>
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
