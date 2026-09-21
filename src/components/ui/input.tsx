import { InputHTMLAttributes, TextareaHTMLAttributes, forwardRef } from 'react';

const base =
  'w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm text-ink placeholder:text-stone-400 transition-colors focus:outline-none focus:border-ink focus:ring-1 focus:ring-ink';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className = '', ...props }, ref) => (
    <input ref={ref} className={`${base} ${className}`} {...props} />
  )
);
Input.displayName = 'Input';

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className = '', ...props }, ref) => (
    <textarea ref={ref} className={`${base} ${className}`} {...props} />
  )
);
Textarea.displayName = 'Textarea';

export function Label({
  className = '',
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={`block text-sm font-medium text-stone-600 mb-1.5 ${className}`}
      {...props}
    />
  );
}
