import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion } from 'framer-motion';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'blue';
  size?: 'sm' | 'md';
  className?: string;
  animate?: boolean;
}

export function Badge({ children, variant = 'default', size = 'sm', className, animate = false }: BadgeProps) {
  const variants = {
    default: 'bg-apple-gray-100 dark:bg-apple-gray-800 text-apple-gray-700 dark:text-apple-gray-300',
    success: 'bg-apple-green/10 dark:bg-apple-green/20 text-apple-green',
    warning: 'bg-apple-orange/10 dark:bg-apple-orange/20 text-apple-orange',
    danger: 'bg-apple-red/10 dark:bg-apple-red/20 text-apple-red',
    info: 'bg-apple-blue/10 dark:bg-apple-blue/20 text-apple-blue',
    purple: 'bg-apple-purple/10 dark:bg-apple-purple/20 text-apple-purple',
    blue: 'bg-apple-teal/10 dark:bg-apple-teal/20 text-apple-teal',
  };

  const sizes = {
    sm: 'px-2.5 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
  };

  const Component = animate ? motion.span : 'span';

  return (
    <Component
      {...(animate && {
        initial: { opacity: 0, scale: 0.8 },
        animate: { opacity: 1, scale: 1 },
        transition: { type: 'spring', duration: 0.4 },
      })}
      className={cn(
        'inline-flex items-center font-medium rounded-full backdrop-blur-sm',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </Component>
  );
}

// Specialized badge for confidence score
interface ConfidenceBadgeProps {
  score: number;
  className?: string;
}

export function ConfidenceBadge({ score, className }: ConfidenceBadgeProps) {
  let variant: 'success' | 'warning' | 'danger' = 'danger';
  let label = 'Low';

  if (score >= 80) {
    variant = 'success';
    label = 'High';
  } else if (score >= 60) {
    variant = 'warning';
    label = 'Medium';
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05 }}
      className={cn(
        'inline-flex items-center gap-2 px-3 py-1.5 rounded-full',
        variant === 'success' && 'bg-apple-green/10 dark:bg-apple-green/20 text-apple-green',
        variant === 'warning' && 'bg-apple-orange/10 dark:bg-apple-orange/20 text-apple-orange',
        variant === 'danger' && 'bg-apple-red/10 dark:bg-apple-red/20 text-apple-red',
        className
      )}
    >
      <span className="relative flex h-2 w-2">
        <span className={cn(
          'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75',
          variant === 'success' && 'bg-apple-green',
          variant === 'warning' && 'bg-apple-orange',
          variant === 'danger' && 'bg-apple-red',
        )} />
        <span className={cn(
          'relative inline-flex rounded-full h-2 w-2',
          variant === 'success' && 'bg-apple-green',
          variant === 'warning' && 'bg-apple-orange',
          variant === 'danger' && 'bg-apple-red',
        )} />
      </span>
      <span className="text-sm font-medium">{label} ({Math.round(score)}%)</span>
    </motion.div>
  );
}

// Status dot
interface StatusDotProps {
  status: 'online' | 'offline' | 'busy' | 'away';
  className?: string;
}

export function StatusDot({ status, className }: StatusDotProps) {
  const colors = {
    online: 'bg-apple-green',
    offline: 'bg-apple-gray-400',
    busy: 'bg-apple-red',
    away: 'bg-apple-orange',
  };

  return (
    <span className={cn('relative flex h-3 w-3', className)}>
      <span className={cn('animate-ping absolute inline-flex h-full w-full rounded-full opacity-75', colors[status])} />
      <span className={cn('relative inline-flex rounded-full h-3 w-3', colors[status])} />
    </span>
  );
}
