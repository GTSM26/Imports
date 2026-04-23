import React from 'react';
import { Package, MapPin, Euro, ArrowUpRight, TrendingUp } from 'lucide-react';
import { formatCurrency, cn } from '@/src/lib/utils';
import { motion } from 'motion/react';

interface KPICardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  delay?: number;
}

const KPICard: React.FC<KPICardProps> = ({ title, value, icon, trend, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    whileHover={{ y: -4, scale: 1.02 }}
    className="card-base p-6 flex flex-col gap-3 relative overflow-hidden"
  >
    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-accent/5 to-transparent rounded-bl-full" />
    
    <div className="flex items-center justify-between">
      <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider">
        {title}
      </p>
      <div className="bg-accent/10 p-2.5 rounded-xl text-accent">
        {React.cloneElement(icon as React.ReactElement, { size: 18 })}
      </div>
    </div>
    <h3 className="text-3xl font-extrabold text-ink tabular-nums tracking-tight">
      {value}
    </h3>
    {trend && (
      <div className="flex items-center gap-1.5 mt-auto">
        <TrendingUp size={12} className="text-emerald-500" />
        <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">{trend}</span>
      </div>
    )}
  </motion.div>
);

interface KPICardsProps {
  stats: {
    totalEnvois: number;
    enTransitCount: number;
    chiffreAchatTotal: number;
    paysActifsCount: number;
  };
}

export const KPICards: React.FC<KPICardsProps> = ({ stats }) => {
  return (
    <div className="kpi-row-theme">
      <KPICard
        title="Total Envois"
        value={stats.totalEnvois.toLocaleString()}
        icon={<Package />}
        trend="+12% ce mois"
        delay={0.1}
      />
      <KPICard
        title="En Transit"
        value={stats.enTransitCount.toLocaleString()}
        icon={<ArrowUpRight />}
        trend="Actif maintenant"
        delay={0.2}
      />
      <KPICard
        title="C.A. Achat"
        value={formatCurrency(stats.chiffreAchatTotal)}
        icon={<Euro />}
        trend="EUR"
        delay={0.3}
      />
      <KPICard
        title="Pays Actifs"
        value={stats.paysActifsCount}
        icon={<MapPin />}
        trend="International"
        delay={0.4}
      />
    </div>
  );
};