import { InputHTMLAttributes, forwardRef } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion } from 'framer-motion';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-apple-gray-700 dark:text-apple-gray-300 mb-2 ml-1">
            {label}
          </label>
        )}
        <motion.div
          className="relative"
          whileFocus={{ scale: 1.01 }}
          transition={{ duration: 0.2 }}
        >
          {icon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-apple-gray-400">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              'w-full px-5 py-4 rounded-apple',
              'bg-apple-gray-50 dark:bg-apple-gray-800/50',
              'border border-apple-gray-200 dark:border-apple-gray-700',
              'text-apple-gray-900 dark:text-white',
              'placeholder:text-apple-gray-400',
              'transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-apple-blue/50 focus:border-apple-blue',
              'hover:border-apple-gray-300 dark:hover:border-apple-gray-600',
              icon && 'pl-12',
              error && 'border-apple-red focus:ring-apple-red/50 focus:border-apple-red',
              className
            )}
            {...props}
          />
        </motion.div>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 text-sm text-apple-red ml-1"
          >
            {error}
          </motion.p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
