import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { TransportOp } from '@/src/types';
import { CHART_COLORS } from '@/src/constants';
import { motion } from 'motion/react';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title
);

interface ChartsSectionProps {
  data: TransportOp[];
  isDarkMode: boolean;
}

export const ChartsSection: React.FC<ChartsSectionProps> = ({ data, isDarkMode }) => {
  const textColor = isDarkMode ? '#94a3b8' : '#64748b';
  const gridColor = isDarkMode ? 'rgba(30, 41, 59, 0.5)' : 'rgba(203, 213, 225, 0.2)';
  
  const statusCounts = data.reduce((acc, curr) => {
    const s = curr.status || 'Vide';
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const doughnutData = {
    labels: Object.keys(statusCounts),
    datasets: [{
      data: Object.values(statusCounts),
      backgroundColor: Object.keys(statusCounts).map(s => CHART_COLORS[s as keyof typeof CHART_COLORS] || '#94a3b8'),
      borderWidth: 2,
      borderColor: isDarkMode ? '#0f172a' : '#ffffff',
      hoverOffset: 20,
    }],
  };

  const weekCosts = data.reduce((acc, curr) => {
    const sem = curr.sem || '0';
    acc[sem] = (acc[sem] || 0) + curr.prixAchat;
    return acc;
  }, {} as Record<string, number>);

  const sortedWeeks = Object.entries(weekCosts)
    .sort((a, b) => {
      const weekA = parseInt(a[0]) || 0;
      const weekB = parseInt(b[0]) || 0;
      return weekA - weekB;
    });

  const barData = {
    labels: sortedWeeks.map(w => `S${w[0]}`),
    datasets: [{
      label: 'Volume',
      data: sortedWeeks.map(w => w[1]),
      backgroundColor: 'rgba(27, 47, 134, 0.8)',
      borderRadius: 8,
      borderSkipped: false,
    }],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: isDarkMode ? '#1e293b' : '#0f172a',
        titleFont: { size: 11, weight: 'bold' as const },
        bodyFont: { size: 10, weight: 'bold' as const },
        padding: 12,
        cornerRadius: 8,
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: gridColor },
        ticks: { font: { size: 9, weight: 'bold' as const }, color: textColor }
      },
      x: {
        grid: { display: false },
        ticks: { font: { size: 9, weight: 'bold' as const }, color: textColor }
      }
    }
  };

  return (
    <aside className="w-full lg:w-80 flex flex-col gap-5">
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        className="card-base p-5 lg:p-6 flex flex-col h-[340px]"
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 rounded-full bg-gradient-to-r from-accent to-blue-500" />
          <h3 className="text-xs font-bold text-text-muted uppercase tracking-widest">Volume par Status</h3>
        </div>
        <div className="flex-1 relative">
          <Doughnut 
            data={doughnutData} 
            options={{
              ...chartOptions,
              plugins: { 
                legend: { 
                  display: true, 
                  position: 'bottom',
                  labels: { 
                    boxWidth: 12, 
                    font: { size: 9, weight: 'bold' }, 
                    padding: 12, 
                    color: textColor,
                    useBorderRadius: true,
                    borderRadius: 4
                  } 
                } 
              }
            }} 
          />
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
        className="card-base p-5 lg:p-6 flex flex-col h-[340px]"
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 rounded-full bg-gradient-to-r from-accent to-blue-500" />
          <h3 className="text-xs font-bold text-text-muted uppercase tracking-widest">Coûts par Semaine</h3>
        </div>
        <div className="flex-1">
          <Bar 
            data={barData} 
            options={{
              ...chartOptions,
              plugins: {
                tooltip: {
                  backgroundColor: isDarkMode ? '#1e293b' : '#0f172a',
                  callbacks: {
                    label: (context: any) => ` ${context.parsed.y.toLocaleString()} €`
                  }
                }
              }
            }} 
          />
        </div>
      </motion.div>
    </aside>
  );
};