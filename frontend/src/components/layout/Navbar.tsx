import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  LogOut, 
  User, 
  Moon, 
  Sun, 
  Menu, 
  X,
  Upload,
  FileText,
  Settings,
  FlaskConical
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/stores/auth.store';
import { useThemeStore } from '@/stores/theme.store';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';

export function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { isDark, toggle } = useThemeStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard', onClick: () => navigate('/dashboard') },
    { label: 'History', onClick: () => navigate('/history') },
  ];

  const actionItems = [
    { 
      label: 'Syllabus', 
      icon: Upload,
      onClick: () => navigate('/syllabus') 
    },
    { 
      label: 'Materials', 
      icon: FileText,
      onClick: () => navigate('/study-materials') 
    },
    { 
      label: 'Settings', 
      icon: Settings,
      onClick: () => navigate('/settings') 
    },
    { 
      label: 'Alpha Status', 
      icon: FlaskConical,
      onClick: () => navigate('/alpha-status'),
      hidden: false // Show to all users for transparency
    },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 nav-blur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center cursor-pointer"
            onClick={() => navigate('/dashboard')}
          >
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-apple-blue to-apple-purple p-2.5 rounded-xl shadow-lg relative">
                <BookOpen className="w-5 h-5 text-white" />
                {/* Alpha Badge */}
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center">
                  <span className="text-[8px] font-bold text-white">α</span>
                </div>
              </div>
              <div className="hidden sm:block">
                <span className="font-bold text-lg text-apple-gray-900 dark:text-white">
                  Commerce Engine
                </span>
                <span className="ml-2 px-1.5 py-0.5 bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 text-[10px] font-bold rounded">
                  ALPHA
                </span>
              </div>
            </div>
          </motion.div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Button
                key={item.label}
                variant="ghost"
                size="sm"
                onClick={item.onClick}
                className="text-apple-gray-600 dark:text-apple-gray-400 hover:text-apple-gray-900 dark:hover:text-white"
              >
                {item.label}
              </Button>
            ))}
            
            {/* Action Items Dropdown-style */}
            <div className="h-6 w-px bg-apple-gray-200 dark:bg-apple-gray-700 mx-2" />
            
            {actionItems.filter(item => !item.hidden).map((item) => (
              <Button
                key={item.label}
                variant="ghost"
                size="sm"
                onClick={item.onClick}
                className="text-apple-gray-600 dark:text-apple-gray-400 hover:text-apple-gray-900 dark:hover:text-white"
              >
                <item.icon className="w-4 h-4 mr-1.5" />
                {item.label}
              </Button>
            ))}
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-2">
            {/* Theme toggle */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggle}
              className="p-2.5 rounded-full text-apple-gray-600 dark:text-apple-gray-400 hover:bg-apple-gray-100 dark:hover:bg-apple-gray-800 transition-colors"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={isDark ? 'dark' : 'light'}
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </motion.div>
              </AnimatePresence>
            </motion.button>

            {/* User info - desktop */}
            <div className="hidden md:flex items-center gap-3 pl-3 border-l border-apple-gray-200 dark:border-apple-gray-800">
              <div className="flex items-center gap-2 text-sm text-apple-gray-600 dark:text-apple-gray-400">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-apple-blue to-apple-purple flex items-center justify-center text-white font-medium text-xs">
                  {user?.access_code.charAt(0).toUpperCase()}
                </div>
                <span className="font-medium">{user?.access_code}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-apple-gray-500 hover:text-apple-red"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>

            {/* Mobile menu button */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2.5 rounded-full text-apple-gray-600 dark:text-apple-gray-400 hover:bg-apple-gray-100 dark:hover:bg-apple-gray-800"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass-strong border-t border-apple-gray-200/50 dark:border-apple-gray-800/50"
          >
            <div className="px-4 py-4 space-y-2">
              {/* Alpha Notice */}
              <div className="mb-4 p-3 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200 text-sm">
                  <FlaskConical className="w-4 h-4" />
                  <span className="font-medium">Alpha Version</span>
                </div>
              </div>

              {navItems.map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-apple-gray-700 dark:text-apple-gray-300"
                    onClick={() => {
                      item.onClick();
                      setMobileMenuOpen(false);
                    }}
                  >
                    {item.label}
                  </Button>
                </motion.div>
              ))}
              
              <div className="h-px bg-apple-gray-200 dark:bg-apple-gray-800 my-2" />
              
              {actionItems.filter(item => !item.hidden).map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: (navItems.length + index) * 0.1 }}
                >
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-apple-gray-700 dark:text-apple-gray-300"
                    onClick={() => {
                      item.onClick();
                      setMobileMenuOpen(false);
                    }}
                  >
                    <item.icon className="w-4 h-4 mr-2" />
                    {item.label}
                  </Button>
                </motion.div>
              ))}

              <div className="pt-2 border-t border-apple-gray-200 dark:border-apple-gray-800">
                <div className="flex items-center justify-between px-3 py-2">
                  <div className="flex items-center gap-2 text-sm text-apple-gray-600 dark:text-apple-gray-400">
                    <User className="w-4 h-4" />
                    <span>{user?.access_code}</span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={handleLogout} className="text-apple-red">
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
