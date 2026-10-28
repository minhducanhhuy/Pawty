import { useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { cn } from '../lib/cn';

interface FieldFrameProps {
  label: string;
  fieldId: string;
  hint?: string;
  errorMessage?: string;
  children: ReactNode;
}

function FieldFrame({ label, fieldId, hint, errorMessage, children }: FieldFrameProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={fieldId} className="block text-sm font-bold text-slate-700">
        {label}
      </label>
      {children}
      {hint && !errorMessage && <p className="text-xs text-slate-500">{hint}</p>}
      {errorMessage && (
        <p role="alert" className="text-xs font-semibold text-red-600">
          {errorMessage}
        </p>
      )}
    </div>
  );
}

const CONTROL_CLASSES =
  'w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-coral disabled:bg-slate-100';

function controlClassName(hasError: boolean, extra?: string): string {
  return cn(CONTROL_CLASSES, hasError ? 'border-red-500' : 'border-slate-300', extra);
}

interface BaseFieldProps {
  label: string;
  hint?: string;
  errorMessage?: string;
}

export function TextField({ label, hint, errorMessage, className, ...inputProps }: BaseFieldProps & InputHTMLAttributes<HTMLInputElement>) {
  const fieldId = useId();
  return (
    <FieldFrame label={label} fieldId={fieldId} hint={hint} errorMessage={errorMessage}>
      <input id={fieldId} aria-invalid={Boolean(errorMessage)} className={controlClassName(Boolean(errorMessage), className)} {...inputProps} />
    </FieldFrame>
  );
}

export function TextAreaField({ label, hint, errorMessage, className, ...textareaProps }: BaseFieldProps & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const fieldId = useId();
  return (
    <FieldFrame label={label} fieldId={fieldId} hint={hint} errorMessage={errorMessage}>
      <textarea id={fieldId} aria-invalid={Boolean(errorMessage)} className={controlClassName(Boolean(errorMessage), cn('min-h-24', className))} {...textareaProps} />
    </FieldFrame>
  );
}

interface SelectFieldProps extends BaseFieldProps, SelectHTMLAttributes<HTMLSelectElement> {
  options: Array<{ value: string; label: string }>;
}

export function SelectField({ label, hint, errorMessage, className, options, ...selectProps }: SelectFieldProps) {
  const fieldId = useId();
  return (
    <FieldFrame label={label} fieldId={fieldId} hint={hint} errorMessage={errorMessage}>
      <select id={fieldId} aria-invalid={Boolean(errorMessage)} className={controlClassName(Boolean(errorMessage), className)} {...selectProps}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FieldFrame>
  );
}
