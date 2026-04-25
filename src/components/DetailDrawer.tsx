import React from 'react';
import { X, Calendar, MapPin, Tag, Truck, User, Info, Hash, FileText, ArrowRight } from 'lucide-react';
import { TransportOp } from '@/src/types';
import { cn, formatCurrency } from '@/src/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { generateBCD } from '../lib/pdfGenerator';

interface DetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  op: TransportOp | null;
  eurMadRate?: string;
}

const DetailItem = ({ icon: Icon, label, value, fullWidth = false }: { icon: any, label: string, value: string | number, fullWidth?: boolean }) => (
  <div className={cn("group py-4 px-5", fullWidth ? "col-span-2" : "col-span-1")}>
    <div className="flex items-center gap-2 mb-2">
      <div className="bg-accent/10 p-1.5 rounded-lg">
        <Icon size={14} className="text-accent" />
      </div>
      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">{label}</span>
    </div>
    <div className="text-sm font-semibold text-ink break-words ml-9">
      {value || <span className="text-slate-400 italic">Non renseigné</span>}
    </div>
  </div>
);

export const DetailDrawer: React.FC<DetailDrawerProps> = ({ isOpen, onClose, op, eurMadRate }) => {
  if (!op) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm"
          />

          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed top-0 right-0 z-50 h-full w-full max-w-md bg-card-bg dark:bg-slate-900 shadow-2xl flex flex-col"
          >
            <div className="px-6 py-5 border-b border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between bg-gradient-to-r from-bg to-card-bg dark:from-slate-950 dark:to-slate-900">
              <div className="flex items-center gap-4">
                <div className="bg-gradient-to-br from-accent to-blue-700 p-2.5 rounded-xl shadow-lg">
                  <Hash size={18} className="text-white" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Référence</p>
                  <p className="text-lg font-extrabold text-accent">{op.refDossier || '-'}</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="grid grid-cols-2 border-b border-slate-100 dark:border-slate-800/50">
                <div className="border-r border-slate-100 dark:border-slate-800/50">
                   <DetailItem icon={Calendar} label="Date Chargement" value={op.dateChargement} />
                </div>
                <div>
                   <DetailItem icon={Hash} label="Semaine / Mois" value={`${op.sem} / ${op.mois}`} />
                </div>
              </div>

              <div className="grid grid-cols-2 border-b border-slate-100 dark:border-slate-800/50">
                <div className="border-r border-slate-100 dark:border-slate-800/50">
                  <DetailItem icon={MapPin} label="Pays" value={op.pays} />
                </div>
                <div>
                  <DetailItem icon={Truck} label="Status" value={op.status} />
                </div>
              </div>

              <div className="border-b border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-800/20">
                <DetailItem icon={MapPin} label="Lieu de Chargement" value={op.lieuChargement} fullWidth />
              </div>

              <div className="grid grid-cols-2 border-b border-slate-100 dark:border-slate-800/50">
                <div className="border-r border-slate-100 dark:border-slate-800/50">
                  <DetailItem icon={Truck} label="Véhicule" value={op.vehicule} />
                </div>
                <div>
                  <DetailItem icon={User} label="Transporteur" value={op.transporteur} />
                </div>
              </div>

              <div className="grid grid-cols-2 border-b border-slate-100 dark:border-slate-800/50">
                 <div className="border-r border-slate-100 dark:border-slate-800/50">
                   <DetailItem icon={Tag} label="Prix Achat" value={formatCurrency(op.prixAchat)} />
                 </div>
                 <div>
                   <DetailItem icon={Calendar} label="Date Départ" value={op.dateDepart} />
                 </div>
              </div>

              <div className="grid grid-cols-2 border-b border-slate-100 dark:border-slate-800/50">
                 <div className="border-r border-slate-100 dark:border-slate-800/50">
                   <DetailItem icon={Hash} label="Remorque / Tracteur" value={`${op.numRemorque} / ${op.numTracteur}`} />
                 </div>
                 <div>
                    <DetailItem icon={Info} label="BCD Status" value={op.bcd} />
                 </div>
              </div>

              <div className="p-5 bg-gradient-to-br from-slate-50 to-white dark:from-slate-800/40 dark:to-slate-800/20 min-h-[160px]">
                <DetailItem icon={Info} label="Observations" value={op.observations} fullWidth />
              </div>
            </div>

            <div className="p-5 border-t border-slate-200/50 dark:border-slate-700/50 bg-card-bg dark:bg-slate-900 flex gap-3">
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={async () => op.refDossier && await generateBCD(op, eurMadRate)}
                disabled={!op.refDossier}
                className={cn(
                  "flex-1 py-3 px-4 text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 rounded-xl shadow-lg",
                  op.refDossier
                    ? "bg-gradient-to-r from-accent to-blue-700 text-white hover:shadow-xl"
                    : "bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed"
                )}
              >
                <FileText size={16} />
                Générer BCD
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                className="flex-1 py-3 px-4 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold uppercase tracking-wider hover:bg-slate-200 dark:hover:bg-slate-700 transition-all rounded-xl border border-slate-200/50 dark:border-slate-700/50"
              >
                Fermer
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};