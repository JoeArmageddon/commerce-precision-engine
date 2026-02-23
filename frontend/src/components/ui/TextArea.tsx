import { TextareaHTMLAttributes, forwardRef } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-apple-gray-700 dark:text-apple-gray-300 mb-2 ml-1">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={cn(
            'w-full px-5 py-4 rounded-apple',
            'bg-apple-gray-50 dark:bg-apple-gray-800/50',
            'border border-apple-gray-200 dark:border-apple-gray-700',
            'text-apple-gray-900 dark:text-white',
            'placeholder:text-apple-gray-400',
            'resize-none transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-apple-blue/50 focus:border-apple-blue',
            'hover:border-apple-gray-300 dark:hover:border-apple-gray-600',
            error && 'border-apple-red focus:ring-apple-red/50 focus:border-apple-red',
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-2 text-sm text-apple-red ml-1">
            {error}
          </p>
        )}
      </div>
    );
  }
);

TextArea.displayName = 'TextArea';

export { TextArea };
