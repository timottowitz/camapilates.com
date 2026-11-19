import React, { useId } from 'react';
import { Check } from 'lucide-react';

const inputClass =
  'w-full rounded-xl border bg-white px-4 text-base text-[#2A2624] placeholder:text-[#8C827A] transition-colors focus:border-[#2A2624] focus:outline-none';

type FieldShellProps = {
  id: string;
  label: string;
  optional?: boolean;
  error?: string;
  hint?: React.ReactNode;
  children: React.ReactNode;
};

function FieldShell({ id, label, optional, error, hint, children }: FieldShellProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 flex items-baseline justify-between gap-3 text-sm font-semibold text-[#2A2624]">
        {label}
        {optional && <span className="text-xs font-normal text-[#8C827A]">Opcional</span>}
      </label>
      {children}
      {error ? (
        <div id={`${id}-error`} role="alert" className="mt-1.5 text-sm text-red-700">
          {error}
        </div>
      ) : (
        hint && <div id={`${id}-hint`} className="mt-1.5 text-sm text-[#5D5550]">{hint}</div>
      )}
    </div>
  );
}

type TextFieldProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'id'> & {
  label: string;
  optional?: boolean;
  error?: string;
  hint?: React.ReactNode;
};

export function TextField({ label, optional, error, hint, className = '', ...input }: TextFieldProps) {
  const id = useId();
  return (
    <FieldShell id={id} label={label} optional={optional} error={error} hint={hint}>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        className={`${inputClass} h-12 ${error ? 'border-red-600' : 'border-[#2A2624]/15'} ${className}`}
        {...input}
      />
    </FieldShell>
  );
}

type TextAreaFieldProps = Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'id'> & {
  label: string;
  optional?: boolean;
  hint?: React.ReactNode;
};

export function TextAreaField({ label, optional, hint, className = '', ...textarea }: TextAreaFieldProps) {
  const id = useId();
  return (
    <FieldShell id={id} label={label} optional={optional} hint={hint}>
      <textarea
        id={id}
        rows={2}
        aria-describedby={hint ? `${id}-hint` : undefined}
        className={`${inputClass} border-[#2A2624]/15 py-3 ${className}`}
        {...textarea}
      />
    </FieldShell>
  );
}

export type Choice<T extends string | number> = {
  value: T;
  label: string;
  detail?: React.ReactNode;
  aside?: React.ReactNode;
};

type ChoiceGroupProps<T extends string | number> = {
  legend: string;
  name: string;
  options: readonly Choice<T>[];
  value: T;
  onChange: (value: T) => void;
  columns?: 'one' | 'two' | 'three' | 'auto';
  hint?: React.ReactNode;
};

const COLUMNS = {
  one: 'grid-cols-1',
  two: 'grid-cols-2',
  three: 'grid-cols-1 sm:grid-cols-3',
  auto: 'grid-cols-2 sm:grid-cols-4',
};

// Radio buttons drawn as cards. The inputs stay in the DOM, so arrow keys and screen readers work.
export function ChoiceGroup<T extends string | number>({
  legend,
  name,
  options,
  value,
  onChange,
  columns = 'two',
  hint,
}: ChoiceGroupProps<T>) {
  return (
    <fieldset className="m-0 min-w-0 border-0 p-0">
      <legend className="mb-2 p-0 text-sm font-semibold text-[#2A2624]">{legend}</legend>
      <div className={`grid gap-2.5 ${COLUMNS[columns]}`}>
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <label
              key={option.value}
              className={`relative flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[#EB4C42]/60 ${
                selected ? 'border-[#2A2624] bg-white shadow-sm' : 'border-[#2A2624]/12 bg-white/60 hover:border-[#2A2624]/40'
              }`}
            >
              <input
                type="radio"
                name={name}
                className="sr-only"
                checked={selected}
                onChange={() => onChange(option.value)}
              />
              <span
                aria-hidden="true"
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                  selected ? 'border-[#2A2624] bg-[#2A2624] text-white' : 'border-[#2A2624]/30 bg-white'
                }`}
              >
                {selected && <Check className="h-3 w-3" strokeWidth={3} />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-[#2A2624]">{option.label}</span>
                {option.detail && <span className="mt-0.5 block text-sm text-[#5D5550]">{option.detail}</span>}
              </span>
              {option.aside && <span className="shrink-0 text-right text-sm">{option.aside}</span>}
            </label>
          );
        })}
      </div>
      {hint && <div className="mt-2 text-sm text-[#5D5550]">{hint}</div>}
    </fieldset>
  );
}
