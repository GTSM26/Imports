import React, { useState } from 'react';
import { FileDown, Search, FileText, ChevronUp, ChevronDown } from 'lucide-react';
import { TransportOp } from '@/src/types';
import { STATUS_COLORS } from '@/src/constants';
import { cn, formatCurrency } from '@/src/lib/utils';
import { generateBCD } from '../lib/pdfGenerator';
import { motion } from 'motion/react';

interface DataTableProps {
  data: TransportOp[];
  search: string;
  setSearch: (val: string) => void;
  onRowClick: (op: TransportOp) => void;
  onExport: () => void;
  onReset: () => void;
  eurMadRate?: string;
}

export const DataTable: React.FC<DataTableProps> = ({ data, search, setSearch, onRowClick, onExport, onReset, eurMadRate }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<keyof TransportOp | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const itemsPerPage = 20;

  const handleSort = (field: keyof TransportOp) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const SortIcon = ({ field }: { field: keyof TransportOp }) => {
    if (sortField !== field) return <ChevronUp size={12} className="opacity-30" />;
    return sortOrder === 'asc' ? <ChevronUp size={12} className="text-accent" /> : <ChevronDown size={12} className="text-accent" />;
  };

  const sortedData = [...data].sort((a, b) => {
    if (!sortField) return 0;
    const valA = a[sortField];
    const valB = b[sortField];
    
    if (typeof valA === 'number' && typeof valB === 'number') {
      return sortOrder === 'asc' ? valA - valB : valB - valA;
    }
    
    const strA = String(valA).toLowerCase();
    const strB = String(valB).toLowerCase();
    
    if (strA < strB) return sortOrder === 'asc' ? -1 : 1;
    if (strA > strB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const paginatedData = sortedData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const StatusBadge = ({ status }: { status: string }) => {
    const colorClass = STATUS_COLORS[status] || STATUS_COLORS['DEFAULT'];
    return (
      <span className={cn("px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm", colorClass)}>
        {status || 'Inconnu'}
      </span>
    );
  };

  return (
    <div className="flex-1 min-w-0">
      <div className="card-base h-full flex flex-col">
        <div className="px-5 py-4 border-b border-slate-200/50 dark:border-slate-700/30 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <h2 className="text-sm font-bold text-ink uppercase tracking-widest flex items-center gap-3">
              Opérations de Transport
              <span className="bg-gradient-to-r from-accent to-blue-700 text-white px-3 py-1 rounded-full text-[11px] tabular-nums shadow-md">
                {data.length}
              </span>
            </h2>

            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input
                type="text"
                placeholder="Rechercher..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-modern w-full pl-9 pr-4 py-1.5 text-xs"
              />
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onExport}
            className="btn-primary px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2"
          >
            <FileDown size={14} />
            Exporter CSV
          </motion.button>
        </div>

        <div className="flex-1 overflow-auto">
            <table className="w-full text-left border-collapse min-w-[1300px]">
            <thead className="sticky top-0 z-10">
              <tr className="bg-gradient-to-r from-slate-50 to-slate-100/50 dark:from-slate-800/60 dark:to-slate-800/40 backdrop-blur-sm text-[10px] uppercase tracking-widest font-bold text-slate-500 dark:text-slate-400 border-b border-slate-200/50 dark:border-slate-700/30">
                <th className="px-4 py-4 cursor-pointer hover:text-accent transition-colors w-[100px]" onClick={() => handleSort('dateChargement')}>
                  <div className="flex items-center gap-1.5">Date <SortIcon field="dateChargement" /></div>
                </th>
                <th className="px-4 py-4 cursor-pointer hover:text-accent transition-colors w-[120px]" onClick={() => handleSort('pays')}>
                  <div className="flex items-center gap-1.5">Pays <SortIcon field="pays" /></div>
                </th>
                <th className="px-4 py-4 cursor-pointer hover:text-accent transition-colors w-[110px]" onClick={() => handleSort('type')}>
                  <div className="flex items-center gap-1.5">Type <SortIcon field="type" /></div>
                </th>
                <th className="px-4 py-4 min-w-[200px]">Lieu de Chargement</th>
                <th className="px-4 py-4 w-[110px]">Réf Dossier</th>
                <th className="px-4 py-4 w-[110px] cursor-pointer hover:text-accent transition-colors" onClick={() => handleSort('numRemorque')}>
                  <div className="flex items-center gap-1.5">N° Remorque <SortIcon field="numRemorque" /></div>
                </th>
                <th className="px-4 py-4 w-[110px] cursor-pointer hover:text-accent transition-colors" onClick={() => handleSort('numTracteur')}>
                  <div className="flex items-center gap-1.5">N° Tracteur <SortIcon field="numTracteur" /></div>
                </th>
                <th className="px-4 py-4 cursor-pointer hover:text-accent transition-colors text-right w-[110px]" onClick={() => handleSort('prixAchat')}>
                  <div className="flex items-center gap-1.5 justify-end">Prix Achat <SortIcon field="prixAchat" /></div>
                </th>
                <th className="px-4 py-4 cursor-pointer hover:text-accent transition-colors w-[120px]" onClick={() => handleSort('status')}>
                  <div className="flex items-center gap-1.5">Status <SortIcon field="status" /></div>
                </th>
                <th className="px-4 py-4 text-center cursor-pointer hover:text-accent transition-colors w-[100px]" onClick={() => handleSort('agenceMA')}>
                  <div className="flex items-center gap-1.5 justify-center">Agence <SortIcon field="agenceMA" /></div>
                </th>
                <th className="px-4 py-4 text-center w-[80px]">BCD</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/50 dark:divide-slate-800/30">
              {paginatedData.length > 0 ? (
                paginatedData.map((row, idx) => (
                  <motion.tr 
                    key={idx} 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.02 }}
                    onClick={() => onRowClick(row)}
                    className="table-row cursor-pointer"
                  >
                    <td className="px-4 py-4 text-xs font-medium tabular-nums whitespace-nowrap">{row.dateChargement}</td>
                    <td className="px-4 py-4 text-xs font-bold text-ink whitespace-nowrap">{row.pays}</td>
                    <td className="px-4 py-4">
                      <span className={cn(
                        "px-2 py-0.5 rounded text-[10px] font-bold uppercase border",
                        row.type === 'Complet' ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800" :
                        row.type === 'Groupage' ? "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800" :
                        row.type === 'Express' ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800" :
                        "bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700"
                      )}>
                        {row.type || '-'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-xs truncate max-w-[250px] text-text-muted" title={row.lieuChargement}>{row.lieuChargement}</td>
                    <td className="px-4 py-4 text-[11px] font-mono font-bold text-accent whitespace-nowrap">
                      {row.refDossier}
                    </td>
                    <td className="px-4 py-4 text-[11px] font-mono text-slate-600 dark:text-slate-400 whitespace-nowrap uppercase">
                      {row.numRemorque || '-'}
                    </td>
                    <td className="px-4 py-4 text-[11px] font-mono text-slate-600 dark:text-slate-400 whitespace-nowrap uppercase">
                      {row.numTracteur || '-'}
                    </td>
                    <td className="px-4 py-4 text-xs font-bold text-right tabular-nums whitespace-nowrap">
                      {formatCurrency(row.prixAchat)}
                    </td>
                    <td className="px-4 py-4"><StatusBadge status={row.status} /></td>
                    <td className="px-4 py-4 text-center text-[10px] font-bold text-accent whitespace-nowrap">
                      {row.agenceMA || '-'}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={async (e) => {
                          e.stopPropagation();
                          if (row.refDossier) await generateBCD(row, eurMadRate);
                        }}
                        disabled={!row.refDossier}
                        className={cn(
                          "p-2 rounded-xl transition-all text-[10px] font-bold flex items-center gap-1.5 mx-auto shadow-sm",
                          row.refDossier 
                            ? "bg-accent/10 text-accent hover:bg-accent hover:text-white hover:shadow-lg" 
                            : "bg-slate-100 text-slate-400 cursor-not-allowed opacity-50"
                        )}
                        title={row.refDossier ? "Générer Bon de Commande" : "Référence dossier manquante"}
                      >
                        <FileText size={12} />
                        PDF
                      </motion.button>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan={11} className="px-5 py-20 text-center">

                    <div className="flex flex-col items-center gap-3">
                      <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-full">
                        <Search size={28} className="text-slate-400" />
                      </div>
                      <p className="text-sm font-semibold text-text-muted">Aucune donnée correspondante.</p>
                      <button onClick={onReset} className="text-accent hover:text-accent/80 text-xs font-bold uppercase tracking-wider underline-offset-4 hover:underline">Réinitialiser les filtres</button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="px-5 py-3 bg-slate-50/50 dark:bg-slate-800/30 border-t border-slate-200/50 dark:border-slate-700/30 flex items-center justify-between">
            <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">
              Affichage {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, data.length)} sur {data.length}
            </p>
            <div className="flex items-center gap-1.5">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
                className="btn-secondary px-3 py-1.5 rounded-lg text-[10px] font-bold disabled:opacity-30"
              >
                Préc
              </motion.button>
              <span className="px-4 py-1.5 text-[10px] font-bold bg-gradient-to-r from-accent to-blue-700 text-white rounded-lg shadow-md">{currentPage}</span>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => p + 1)}
                className="btn-secondary px-3 py-1.5 rounded-lg text-[10px] font-bold disabled:opacity-30"
              >
                Suiv
              </motion.button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};