import React, { useMemo } from 'react';
import { TransportOp } from '@/src/types';
import { enrichData } from '@/src/lib/analytics/analyticsEngine';
import { Leaf, ShieldCheck, AlertTriangle, Truck, Euro, Download } from 'lucide-react';
import Papa from 'papaparse';
import { motion } from 'motion/react';
import { formatCurrency, cn } from '@/src/lib/utils';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface CarrierAnalyticsDashboardProps {
  data: TransportOp[];
  isDarkMode: boolean;
}

export const CarrierAnalyticsDashboard: React.FC<CarrierAnalyticsDashboardProps> = ({ data, isDarkMode }) => {
  const enrichedData = useMemo(() => enrichData(data), [data]);

  const textColor = isDarkMode ? '#f1f5f9' : '#0f172a';
  const gridColor = isDarkMode ? 'rgba(31, 41, 55, 0.5)' : 'rgba(226, 232, 240, 0.5)';

  // 1. MACRO KPIs
  const totalOps = enrichedData.length || 1;
  const totalCO2 = enrichedData.reduce((acc, curr) => acc + curr.co2Emissions, 0);
  const conformantOps = enrichedData.filter(op => op.isConformant).length;
  const incidentOps = enrichedData.filter(op => op.hasIncident).length;
  
  const conformityRate = ((conformantOps / totalOps) * 100).toFixed(1);
  const incidentRate = ((incidentOps / totalOps) * 100).toFixed(1);
  const avgCost = enrichedData.reduce((acc, curr) => acc + curr.prixAchat, 0) / totalOps;

  // 2. Leaderboard calculation
  const carrierStats = useMemo(() => {
    const stats: Record<string, { ops: number, cost: number, co2: number, conformant: number, incidents: number }> = {};
    enrichedData.forEach(op => {
      const t = op.transporteur || 'Inconnu';
      if (!stats[t]) stats[t] = { ops: 0, cost: 0, co2: 0, conformant: 0, incidents: 0 };
      stats[t].ops += 1;
      stats[t].cost += op.prixAchat;
      stats[t].co2 += op.co2Emissions;
      if (op.isConformant) stats[t].conformant += 1;
      if (op.hasIncident) stats[t].incidents += 1;
    });

    return Object.entries(stats).map(([name, data]) => ({
      name,
      ...data,
      conformityRate: (data.conformant / data.ops) * 100,
      avgCost: data.cost / data.ops
    })).sort((a, b) => b.conformityRate - a.conformityRate); // Sort by conformity by default
  }, [enrichedData]);

  // 4. Cost Breakdown by Type
  const costByType = useMemo(() => {
    const costs: Record<string, number> = {};
    enrichedData.forEach(op => {
      const t = op.type || 'Inconnu';
      costs[t] = (costs[t] || 0) + op.prixAchat;
    });
    return costs;
  }, [enrichedData]);

  const costData = {
    labels: Object.keys(costByType),
    datasets: [{
      label: 'Coût total (€)',
      data: Object.values(costByType),
      backgroundColor: [
        'rgba(27, 47, 134, 0.8)',
        'rgba(16, 185, 129, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(139, 92, 246, 0.8)'
      ],
      borderRadius: 6
    }]
  };
  const weeks = (Array.from(new Set(enrichedData.map(d => d.sem).filter(Boolean))) as string[]).sort((a, b) => parseInt(a) - parseInt(b));
  const trendData = {
    labels: weeks.map(w => `S${w}`),
    datasets: [
      {
        label: 'Taux de Conformité (%)',
        data: weeks.map(w => {
          const opsInWeek = enrichedData.filter(d => d.sem === w);
          if (!opsInWeek.length) return 0;
          return (opsInWeek.filter(o => o.isConformant).length / opsInWeek.length) * 100;
        }),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: isDarkMode ? '#1e293b' : '#0f172a',
        titleFont: { size: 12, weight: 'bold' as const },
        bodyFont: { size: 11 },
        padding: 12,
        cornerRadius: 8,
      }
    },
    scales: {
      y: { grid: { color: gridColor }, ticks: { color: textColor } },
      x: { grid: { display: false }, ticks: { color: textColor } }
    }
  };

  const handleExport = () => {
    const csv = Papa.unparse(carrierStats);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `analytics_transporteurs_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col gap-6 px-6 pb-8">
      {/* Header & Export */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-extrabold text-ink tracking-tight">Performance Globale & Optimisation</h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleExport}
          className="btn-primary px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2"
        >
          <Download size={14} />
          Exporter Rapport
        </motion.button>
      </div>

      {/* Alert Banner */}
      {parseFloat(incidentRate) > 5 && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-xl p-4 flex items-center gap-3 text-red-700 dark:text-red-400 shadow-sm"
        >
          <AlertTriangle size={18} />
          <p className="text-sm font-semibold">Alerte : Le taux d'incidents global ({incidentRate}%) est supérieur au seuil critique de 5%.</p>
        </motion.div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard title="Conformité Globale" value={`${conformityRate}%`} icon={<ShieldCheck className="text-emerald-500" />} trend="Objectif: 95%" />
        <KPICard title="Empreinte Carbone" value={`${(totalCO2 / 1000).toFixed(1)} t`} icon={<Leaf className="text-emerald-600" />} trend="CO2 estimé" />
        <KPICard title="Taux d'Incidents" value={`${incidentRate}%`} icon={<AlertTriangle className="text-amber-500" />} trend="À surveiller" />
        <KPICard title="Coût Moyen / Op" value={formatCurrency(avgCost)} icon={<Euro className="text-blue-500" />} trend="Par expédition" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 flex flex-col gap-6">
          {/* Trends Chart */}
          <div className="card-base p-6 h-[350px] flex flex-col">
            <h3 className="text-sm font-bold text-ink mb-6 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              Évolution de la Conformité par Semaine
            </h3>
            <div className="flex-1 min-h-0">
              <Line data={trendData} options={chartOptions} />
            </div>
          </div>

          {/* Cost Breakdown */}
          <div className="card-base p-6 h-[350px] flex flex-col">
            <h3 className="text-sm font-bold text-ink mb-6 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              Répartition des Coûts par Type
            </h3>
            <div className="flex-1 min-h-0">
              <Bar data={costData} options={{...chartOptions, plugins: { ...chartOptions.plugins, legend: { display: false }}}} />
            </div>
          </div>
        </div>

        {/* Carrier Leaderboard */}
        <div className="card-base p-0 flex flex-col h-[724px]">
          <div className="p-6 border-b border-slate-200/50 dark:border-slate-700/50">
            <h3 className="text-sm font-bold text-ink flex items-center gap-2">
              <Truck size={16} className="text-accent" />
              Classement Transporteurs
            </h3>
          </div>
          <div className="flex-1 overflow-auto p-2">
            {carrierStats.map((carrier, idx) => (
              <div key={carrier.name} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl transition-colors flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-500">
                    {idx + 1}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-ink group-hover:text-accent transition-colors">{carrier.name}</p>
                    <p className="text-[10px] text-text-muted">{carrier.ops} opérations</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={cn(
                    "text-xs font-bold px-2 py-1 rounded-md inline-block",
                    carrier.conformityRate >= 90 ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400" :
                    carrier.conformityRate >= 75 ? "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400" :
                    "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                  )}>
                    {carrier.conformityRate.toFixed(1)}%
                  </div>
                  <p className="text-[10px] text-text-muted mt-1">{formatCurrency(carrier.avgCost)} moy.</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const KPICard = ({ title, value, icon, trend }: { title: string, value: string | number, icon: React.ReactNode, trend: string }) => (
  <div className="card-base p-6 relative overflow-hidden group hover:-translate-y-1 transition-transform">
    <div className="flex items-center justify-between mb-4">
      <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider">{title}</p>
      <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded-lg">{icon}</div>
    </div>
    <h3 className="text-3xl font-extrabold text-ink tabular-nums">{value}</h3>
    <p className="text-[10px] text-slate-400 mt-2 font-medium">{trend}</p>
  </div>
);
