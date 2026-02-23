import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Navbar } from './Navbar';
import { useThemeStore } from '@/stores/theme.store';

interface LayoutProps {
  children: ReactNode;
  showGradients?: boolean;
}

export function Layout({ children, showGradients = true }: LayoutProps) {
  const { isDark } = useThemeStore();

  return (
    <div className="min-h-screen bg-apple-gray-50 dark:bg-apple-gray-950 transition-colors duration-300">
      {/* Floating Gradient Background */}
      {showGradients && (
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          {/* Gradient Orb 1 - Top Left */}
          <motion.div
            className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(0,122,255,0.15) 0%, rgba(88,86,214,0.1) 50%, transparent 70%)',
            }}
            animate={{
              x: [0, 30, 0],
              y: [0, -30, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          
          {/* Gradient Orb 2 - Bottom Right */}
          <motion.div
            className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(175,82,222,0.15) 0%, rgba(255,45,85,0.1) 50%, transparent 70%)',
            }}
            animate={{
              x: [0, -20, 0],
              y: [0, 20, 0],
              scale: [1, 1.15, 1],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 2,
            }}
          />
          
          {/* Gradient Orb 3 - Center (subtle) */}
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(90,200,250,0.08) 0%, transparent 60%)',
            }}
            animate={{
              rotate: [0, 360],
            }}
            transition={{
              duration: 60,
              repeat: Infinity,
              ease: 'linear',
            }}
          />

          {/* Dark mode overlay */}
          {isDark && (
            <div className="absolute inset-0 bg-apple-gray-950/30" />
          )}
        </div>
      )}

      <Navbar />
      
      <main className="relative z-10 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="max-w-7xl mx-auto"
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
