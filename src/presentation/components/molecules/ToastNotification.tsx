import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface ToastNotificationProps {
  isOpen: boolean;
  message: string;
  onClose: () => void;
  duration?: number;
}

export function ToastNotification({ isOpen, message, onClose, duration = 5000 }: ToastNotificationProps) {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isOpen, duration, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
          className={twMerge(
            clsx(
              "fixed bottom-6 right-6 z-50 flex items-center gap-3 p-4",
              "bg-slate-800/90 backdrop-blur-xl border border-slate-700",
              "shadow-2xl shadow-blue-500/10 rounded-2xl",
              "text-white min-w-[300px]"
            )
          )}
        >
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-500/20 text-blue-400">
            <Bell className="w-5 h-5 animate-pulse" />
          </div>
          
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-slate-100">Nueva Notificación</h4>
            <p className="text-xs text-slate-400 mt-0.5">{message}</p>
          </div>
          
          <button 
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
