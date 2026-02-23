import { ButtonHTMLAttributes, forwardRef } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'glass';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  shimmer?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, shimmer, children, disabled, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 ease-apple-bounce focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
    
    const variants = {
      primary: 'bg-apple-blue text-white shadow-apple hover:shadow-apple-hover hover:scale-[1.02] active:scale-[0.98] focus:ring-apple-blue/50',
      secondary: 'bg-apple-gray-100 dark:bg-apple-gray-800 text-apple-gray-900 dark:text-white hover:bg-apple-gray-200 dark:hover:bg-apple-gray-700 focus:ring-apple-gray-400',
      ghost: 'bg-transparent text-apple-gray-700 dark:text-apple-gray-300 hover:bg-apple-gray-100 dark:hover:bg-apple-gray-800 focus:ring-apple-gray-400',
      danger: 'bg-apple-red text-white shadow-apple hover:shadow-apple-hover hover:scale-[1.02] active:scale-[0.98] focus:ring-apple-red/50',
      glass: 'glass text-apple-gray-900 dark:text-white hover:shadow-apple-hover hover:-translate-y-0.5 focus:ring-apple-blue/50',
    };

    const sizes = {
      sm: 'px-4 py-2 text-sm rounded-full',
      md: 'px-6 py-3 text-sm rounded-full',
      lg: 'px-8 py-4 text-base rounded-full',
    };

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: disabled || isLoading ? 1 : 1.02 }}
        whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          shimmer && 'relative overflow-hidden',
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {shimmer && !isLoading && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-1000" />
        )}
        {isLoading && (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        )}
        {children}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
