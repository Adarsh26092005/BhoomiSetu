import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
    'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 cursor-pointer',
    {
        variants: {
            variant: {
                primary: 'bg-ink-900 text-paper hover:bg-ink-800',
                accent: 'bg-terracotta-600 text-paper hover:bg-terracotta-700',
                outline: 'border border-ink-900/20 text-ink-900 hover:bg-ink-50',
                ghost: 'text-ink-900 hover:bg-ink-50',
                subtle: 'bg-ink-50 text-ink-900 hover:bg-ink-100',
            },
            size: {
                sm: 'h-8 px-3 text-[13px]',
                md: 'h-10 px-4',
                lg: 'h-12 px-6 text-base',
                icon: 'h-10 w-10',
            },
        },
        defaultVariants: {
            variant: 'primary',
            size: 'md',
        },
    },
)

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> { }

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, ...props }, ref) => {
        return <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
    },
)
Button.displayName = 'Button'