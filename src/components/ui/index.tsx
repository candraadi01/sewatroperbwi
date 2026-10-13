import React from 'react';

/**
 * cn — utility untuk menggabungkan class names.
 * Menghilangkan falsy values.
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

/* ============================================================
   BUTTON
   ============================================================ */

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  fullWidth?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  const baseClasses =
    'inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 disabled:opacity-50 disabled:cursor-not-allowed select-none';

  const variantClasses = {
    primary:
      'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 shadow-sm hover:shadow-md',
    secondary:
      'bg-accent-500 text-white hover:bg-accent-600 active:bg-accent-700 shadow-sm hover:shadow-md',
    outline:
      'border-2 border-primary-600 text-primary-700 hover:bg-primary-50 active:bg-primary-100',
    ghost:
      'text-neutral-700 hover:bg-neutral-100 active:bg-neutral-200',
    danger:
      'bg-error text-white hover:bg-red-700 active:bg-red-800 shadow-sm',
  };

  const sizeClasses = {
    sm: 'text-sm px-3 py-1.5 min-h-[36px]',
    md: 'text-base px-5 py-2.5 min-h-[44px]',
    lg: 'text-lg px-7 py-3 min-h-[52px]',
  };

  return (
    <button
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && 'w-full',
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span className="spinner" aria-hidden="true" />
      )}
      {children}
    </button>
  );
}

/* ============================================================
   INPUT
   ============================================================ */

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helpText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helpText, className, id, ...props }, ref) => {
    const inputId = id || `input-${label?.toLowerCase().replace(/\s+/g, '-')}`;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="label text-neutral-700">
            {label}
            {props.required && <span className="text-error ml-0.5">*</span>}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'w-full rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-base text-neutral-900',
            'placeholder:text-neutral-400',
            'focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none',
            'disabled:bg-neutral-100 disabled:text-neutral-500 disabled:cursor-not-allowed',
            'transition-colors duration-200',
            'min-h-[44px]',
            error && 'border-error focus:border-error focus:ring-error/20',
            className
          )}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? `${inputId}-error` : helpText ? `${inputId}-help` : undefined}
          {...props}
        />
        {error && (
          <p id={`${inputId}-error`} className="text-sm text-error" role="alert">
            {error}
          </p>
        )}
        {helpText && !error && (
          <p id={`${inputId}-help`} className="text-sm text-neutral-500">
            {helpText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

/* ============================================================
   CARD
   ============================================================ */

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'bordered';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export function Card({
  variant = 'default',
  padding = 'md',
  className,
  children,
  ...props
}: CardProps) {
  const variantClasses = {
    default: 'bg-white shadow-card',
    elevated: 'bg-white shadow-elevated',
    bordered: 'bg-white border border-neutral-200',
  };

  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div
      className={cn(
        'rounded-xl overflow-hidden',
        variantClasses[variant],
        paddingClasses[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/* ============================================================
   BADGE
   ============================================================ */

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'sample';
}

export function Badge({
  variant = 'neutral',
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(`badge badge-${variant}`, className)}
      {...props}
    >
      {children}
    </span>
  );
}

/* ============================================================
   SKELETON
   ============================================================ */

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('skeleton h-4 w-full', className)}
      aria-hidden="true"
      {...props}
    />
  );
}

/* ============================================================
   EMPTY STATE
   ============================================================ */

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {icon && <div className="text-neutral-400 mb-4">{icon}</div>}
      <h3 className="heading-3 text-neutral-700 mb-2">{title}</h3>
      {description && (
        <p className="body-small text-neutral-500 max-w-md mb-6">{description}</p>
      )}
      {action}
    </div>
  );
}

/* ============================================================
   SECTION HEADING
   ============================================================ */

export interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  centered?: boolean;
  className?: string;
}

export function SectionHeading({ title, subtitle, centered = false, className }: SectionHeadingProps) {
  return (
    <div className={cn(centered && 'text-center', 'mb-8', className)}>
      <h2 className="heading-2 text-neutral-900">{title}</h2>
      {subtitle && (
        <p className="body-large text-neutral-600 mt-2 max-w-2xl mx-auto">
          {subtitle}
        </p>
      )}
    </div>
  );
}
