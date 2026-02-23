import { ReactNode } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion } from 'framer-motion';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
  glass?: boolean;
  animate?: boolean;
}

function Card({ children, className, onClick, hover = false, glass = true, animate = false }: CardProps) {
  const Component = animate ? motion.div : 'div';
  
  const baseStyles = cn(
    'rounded-apple-lg overflow-hidden transition-all duration-300',
    glass && 'glass',
    !glass && 'bg-white dark:bg-apple-gray-900 shadow-apple',
    hover && 'cursor-pointer hover:shadow-apple-hover hover:-translate-y-1',
    className
  );

  if (animate) {
    return (
      <Component
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        whileHover={hover ? { y: -4, transition: { duration: 0.2 } } : undefined}
        className={baseStyles}
        onClick={onClick}
      >
        {children}
      </Component>
    );
  }

  return (
    <Component className={baseStyles} onClick={onClick}>
      {children}
    </Component>
  );
}

interface CardHeaderProps {
  children: ReactNode;
  className?: string;
}

function CardHeader({ children, className }: CardHeaderProps) {
  return (
    <div className={cn('px-6 py-5 border-b border-apple-gray-200/50 dark:border-apple-gray-800/50', className)}>
      {children}
    </div>
  );
}

interface CardBodyProps {
  children: ReactNode;
  className?: string;
}

function CardBody({ children, className }: CardBodyProps) {
  return (
    <div className={cn('px-6 py-5', className)}>
      {children}
    </div>
  );
}

interface CardFooterProps {
  children: ReactNode;
  className?: string;
}

function CardFooter({ children, className }: CardFooterProps) {
  return (
    <div className={cn('px-6 py-4 border-t border-apple-gray-200/50 dark:border-apple-gray-800/50 bg-apple-gray-50/50 dark:bg-apple-gray-900/50', className)}>
      {children}
    </div>
  );
}

Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;

export { Card };
