import { HTMLAttributes } from 'react';

export function Card({
  className = '',
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-2xl border border-line bg-white p-6 shadow-sm transition-shadow duration-200 hover:shadow-md ${className}`}
      {...props}
    />
  );
}

export function CardTitle({
  className = '',
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      className={`text-lg font-semibold text-ink mb-4 ${className}`}
      {...props}
    />
  );
}
