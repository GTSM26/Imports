import React from 'react';
import { Truck, Moon, Sun, RefreshCw, Activity } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { motion } from 'motion/react';

interface HeaderProps {
  lastSync: Date | null;
  onRefresh: () => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  isRefreshing: boolean;
  currentView: 'operations' | 'analytics';
  onViewChange: (view: 'operations' | 'analytics') => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  lastSync, 
  onRefresh, 
  isDarkMode, 
  toggleDarkMode,
  isRefreshing,
  currentView,
  onViewChange
}) => {
  return (
    <header className="header-theme sticky top-0 z-40 w-full flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <motion.div 
          whileHover={{ scale: 1.05, rotate: 5 }}
          className="bg-gradient-to-br from-brand-yellow to-amber-500 p-2.5 rounded-xl shadow-lg"
        >
          <Truck size={22} className="text-slate-900" />
        </motion.div>
        <div className="flex items-center gap-5">
           <h1 className="text-xl font-extrabold tracking-tight text-white leading-none">
             GTSM <span className="bg-gradient-to-r from-brand-yellow to-amber-400 bg-clip-text text-transparent">Imports</span>
           </h1>
           {lastSync && (
             <div className="flex items-center gap-2 border-l border-slate-600/50 pl-5">
               <div className="relative">
                 <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                 <div className="absolute inset-0 w-2 h-2 bg-emerald-500/50 rounded-full animate-ping" />
               </div>
               <span className="text-[11px] font-medium text-slate-400">
                 Synchro: {lastSync.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
               </span>
             </div>
           )}
        </div>
      </div>

      <div className="flex-1 flex justify-center">
        <div className="bg-slate-900/50 dark:bg-slate-800/80 p-1 rounded-xl flex items-center gap-1 border border-slate-700/50">
          <button
            onClick={() => onViewChange('operations')}
            className={cn(
              "px-4 py-1.5 rounded-lg text-xs font-bold transition-all",
              currentView === 'operations' 
                ? "bg-slate-800 dark:bg-slate-700 text-white shadow-md" 
                : "text-slate-400 hover:text-white hover:bg-slate-800/50"
            )}
          >
            <Activity size={14} className="inline-block mr-2" />
            Opérations
          </button>
          <button
            onClick={() => onViewChange('analytics')}
            className={cn(
              "px-4 py-1.5 rounded-lg text-xs font-bold transition-all",
              currentView === 'analytics' 
                ? "bg-slate-800 dark:bg-slate-700 text-white shadow-md" 
                : "text-slate-400 hover:text-white hover:bg-slate-800/50"
            )}
          >
            <Activity size={14} className="inline-block mr-2" />
            Performance
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onRefresh}
          disabled={isRefreshing}
          className="btn-primary px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2"
        >
          <RefreshCw size={14} className={isRefreshing ? "animate-spin" : ""} />
          Rafraîchir
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleDarkMode}
          className={cn(
            "relative w-14 h-8 rounded-xl p-1 transition-all duration-300 shadow-inner",
            isDarkMode 
              ? "bg-gradient-to-r from-slate-800 to-slate-900 border border-slate-600" 
              : "bg-gradient-to-r from-amber-100 to-amber-200 border border-amber-300"
          )}
          title="Mode Sombre/Clair"
        >
          <motion.div 
            animate={{ x: isDarkMode ? 28 : 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className={cn(
              "w-6 h-6 rounded-lg flex items-center justify-center shadow-md",
              isDarkMode 
                ? "bg-gradient-to-br from-slate-700 to-slate-800" 
                : "bg-gradient-to-br from-brand-yellow to-amber-500"
            )}
          >
            {isDarkMode ? <Moon size={12} className="text-slate-300" /> : <Sun size={12} className="text-amber-700" />}
          </motion.div>
        </motion.button>
      </div>
    </header>
  );
};