import React, { useState, useMemo } from 'react';
import { Search, RotateCcw, ChevronDown, ChevronRight, SlidersHorizontal, X } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface FilterSidebarProps {
  search: string;
  setSearch: (val: string) => void;
  annee: string;
  setAnnee: (val: string) => void;
  status: string;
  setStatus: (val: string) => void;
  pays: string;
  setPays: (val: string) => void;
  vehicule: string;
  setVehicule: (val: string) => void;
  semaine: string;
  setSemaine: (val: string) => void;
  mois: string;
  setMois: (val: string) => void;
  transporteur: string;
  setTransporteur: (val: string) => void;
  typeOp: string;
  setTypeOp: (val: string) => void;
  bcd: string;
  setBcd: (val: string) => void;
  mpl: string;
  setMpl: (val: string) => void;
  agenceMA: string;
  setAgenceMA: (val: string) => void;
  eurMadRate: string;
  setEurMadRate: (val: string) => void;
  availablePays: string[];
  availableSemaines: string[];
  availableTransporteurs: string[];
  availableAnnees: string[];
  availableMois: string[];
  availableTypes: string[];
  availableBcd: string[];
  availableMpl: string[];
  availableAgences: string[];
  onReset: () => void;
}

interface FilterSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

const FilterSection: React.FC<FilterSectionProps> = ({ title, children, defaultOpen = true }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <div className="border-b border-slate-200/50 dark:border-slate-700/50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-colors"
      >
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">{title}</span>
        {isOpen ? <ChevronDown size={14} className="text-slate-400" /> : <ChevronRight size={14} className="text-slate-400" />}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  search, setSearch,
  annee, setAnnee,
  status, setStatus,
  pays, setPays,
  vehicule, setVehicule,
  semaine, setSemaine,
  mois, setMois,
  transporteur, setTransporteur,
  typeOp, setTypeOp,
  bcd, setBcd,
  mpl, setMpl,
  agenceMA, setAgenceMA,
  eurMadRate, setEurMadRate,
  availablePays,
  availableSemaines,
  availableTransporteurs,
  availableAnnees,
  availableMois,
  availableTypes,
  availableBcd,
  availableMpl,
  availableAgences,
  onReset
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [fuelPrice, setFuelPrice] = useState('11.50');

  const refPrice = 10.50;
  const weighting = 0.33;
  
  const fuelSurcharge = useMemo(() => {
    const current = parseFloat(fuelPrice) || 0;
    if (current <= 0) return 0;
    // Surcharge (%) = ((Current / Ref) - 1) * Weighting * 100
    const surcharge = ((current / refPrice) - 1) * weighting * 100;
    return surcharge;
  }, [fuelPrice]);

  const activeFiltersCount = [
    annee !== 'Tous',
    mois !== 'Tous',
    semaine !== 'Tous',
    pays !== 'Tous',
    typeOp !== 'Tous',
    agenceMA !== 'Tous',
    transporteur !== 'Tous',
    vehicule !== 'Tous',
    bcd !== 'Tous',
  ].filter(Boolean).length;

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="fixed left-4 top-[80px] z-30 btn-primary px-4 py-3 rounded-xl shadow-lg flex items-center gap-2"
      >
        <SlidersHorizontal size={16} />
        Filtres
        {activeFiltersCount > 0 && (
          <span className="bg-white/20 px-2 py-0.5 rounded-full text-[10px] font-bold">
            {activeFiltersCount}
          </span>
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed left-0 top-0 z-50 h-full w-80 bg-card-bg dark:bg-slate-900 shadow-2xl flex flex-col"
            >
              <div className="px-5 py-4 border-b border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between bg-gradient-to-r from-bg to-card-bg dark:from-slate-950 dark:to-slate-900">
                <div className="flex items-center gap-3">
                  <div className="bg-accent/10 p-2 rounded-lg">
                    <SlidersHorizontal size={18} className="text-accent" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-ink dark:text-white">Filtres</h2>
                    {activeFiltersCount > 0 && (
                      <p className="text-[10px] text-accent font-semibold">{activeFiltersCount} actif(s)</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={onReset}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-500 hover:text-accent"
                    title="Réinitialiser"
                  >
                    <RotateCcw size={16} />
                  </button>
                  <button 
                    onClick={() => setIsOpen(false)}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-500 hover:text-slate-900 dark:hover:text-white"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                <FilterSection title="Année" defaultOpen={true}>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setAnnee('Tous')}
                      className={cn("filter-pill", annee === 'Tous' ? "filter-pill-active" : "filter-pill-inactive")}
                    >
                      Toutes
                    </button>
                    {availableAnnees.map(a => (
                      <button
                        key={a}
                        onClick={() => setAnnee(a)}
                        className={cn("filter-pill", annee === a ? "filter-pill-active" : "filter-pill-inactive")}
                      >
                        {a}
                      </button>
                    ))}
                  </div>
                </FilterSection>

                <FilterSection title="Mois" defaultOpen={true}>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setMois('Tous')}
                      className={cn("filter-pill", mois === 'Tous' ? "filter-pill-active" : "filter-pill-inactive")}
                    >
                      Tous
                    </button>
                    {availableMois.map(m => (
                      <button
                        key={m}
                        onClick={() => setMois(m)}
                        className={cn("filter-pill capitalize", mois === m ? "filter-pill-active" : "filter-pill-inactive")}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </FilterSection>

                <FilterSection title="Semaine" defaultOpen={false}>
                  <div className="flex flex-wrap gap-2 max-h-[150px] overflow-y-auto pr-2">
                    <button
                      onClick={() => setSemaine('Tous')}
                      className={cn("filter-pill", semaine === 'Tous' ? "bg-slate-700 text-white" : "filter-pill-inactive")}
                    >
                      Toutes
                    </button>
                    {availableSemaines.map(s => (
                      <button
                        key={s}
                        onClick={() => setSemaine(s)}
                        className={cn("filter-pill", semaine === s ? "bg-slate-700 text-white" : "filter-pill-inactive")}
                      >
                        S{s}
                      </button>
                    ))}
                  </div>
                </FilterSection>

                <FilterSection title="Pays" defaultOpen={false}>
                  <select
                    value={pays}
                    onChange={(e) => setPays(e.target.value)}
                    className="input-modern w-full py-2 px-3 text-xs"
                  >
                    <option value="Tous">Tous</option>
                    {availablePays.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </FilterSection>

                <FilterSection title="Type" defaultOpen={false}>
                  <select
                    value={typeOp}
                    onChange={(e) => setTypeOp(e.target.value)}
                    className="input-modern w-full py-2 px-3 text-xs"
                  >
                    <option value="Tous">Tous</option>
                    <option value="Complet">Complet</option>
                    <option value="Groupage">Groupage</option>
                    {availableTypes
                      .filter(t => t.toLowerCase() !== 'complet' && t.toLowerCase() !== 'groupage')
                      .map(t => <option key={t} value={t}>{t}</option>)
                    }
                  </select>
                </FilterSection>

                <FilterSection title="Agence" defaultOpen={false}>
                  <select
                    value={agenceMA}
                    onChange={(e) => setAgenceMA(e.target.value)}
                    className="input-modern w-full py-2 px-3 text-xs"
                  >
                    <option value="Tous">Tous</option>
                    <option value="Casa">Casa</option>
                    <option value="Tanger">Tanger</option>
                    <option value="Tanger+Casa">Tanger+Casa</option>
                    {availableAgences
                      .filter(a => !['casa', 'tanger', 'tanger+casa'].includes(a.toLowerCase()))
                      .map(a => <option key={a} value={a}>{a}</option>)
                    }
                  </select>
                </FilterSection>

                <FilterSection title="Transporteur" defaultOpen={false}>
                  <select
                    value={transporteur}
                    onChange={(e) => setTransporteur(e.target.value)}
                    className="input-modern w-full py-2 px-3 text-xs"
                  >
                    <option value="Tous">Tous</option>
                    {availableTransporteurs.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </FilterSection>

                <FilterSection title="Véhicule" defaultOpen={false}>
                  <select
                    value={vehicule}
                    onChange={(e) => setVehicule(e.target.value)}
                    className="input-modern w-full py-2 px-3 text-xs"
                  >
                    <option value="Tous">Tous</option>
                    <option value="Tollé">Tollé</option>
                    <option value="Bâchée">Bâchée</option>
                    <option value="Plateau">Plateau</option>
                    <option value="Frigo">Frigo</option>
                    <option value="Taxi">Taxi</option>
                  </select>
                </FilterSection>

                <FilterSection title="Taux EUR/MAD" defaultOpen={false}>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-xl px-3 py-2">
                      <span className="text-[10px] text-slate-500 font-medium">EUR→MAD</span>
                      <input
                        type="text"
                        value={eurMadRate}
                        onChange={(e) => setEurMadRate(e.target.value)}
                        className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-bold text-accent dark:text-brand-yellow p-0 text-center"
                      />
                    </div>
                    <p className="text-[9px] text-slate-400 italic px-1 leading-tight">
                      * Note : Les BCD utilisent automatiquement le cours historique à la date de l'opération.
                    </p>
                  </div>
                </FilterSection>

                <FilterSection title="Index Gasoil" defaultOpen={false}>
                  <div className="space-y-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] uppercase font-bold text-slate-400 px-1">Prix Actuel TTC (MAD)</label>
                      <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-xl px-3 py-2">
                        <input
                          type="text"
                          value={fuelPrice}
                          onChange={(e) => setFuelPrice(e.target.value)}
                          className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-bold text-ink p-0 text-center"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-slate-50 dark:bg-slate-800/40 p-2 rounded-lg border border-slate-100 dark:border-slate-700/50">
                        <p className="text-[8px] uppercase text-slate-400 font-bold mb-0.5">Réf. TTC</p>
                        <p className="text-[10px] font-bold text-slate-600 dark:text-slate-300">10.50 MAD</p>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-800/40 p-2 rounded-lg border border-slate-100 dark:border-slate-700/50">
                        <p className="text-[8px] uppercase text-slate-400 font-bold mb-0.5">Pondér.</p>
                        <p className="text-[10px] font-bold text-slate-600 dark:text-slate-300">33%</p>
                      </div>
                    </div>

                    <div className="bg-accent/5 dark:bg-accent/10 p-3 rounded-xl border border-accent/10 text-center">
                      <p className="text-[9px] uppercase text-accent font-bold mb-1 tracking-wider">Surcharge Gasoil</p>
                      <p className="text-xl font-black text-accent tabular-nums">
                        {fuelSurcharge > 0 ? '+' : ''}{fuelSurcharge.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                </FilterSection>
              </div>

              <div className="p-4 border-t border-slate-200/50 dark:border-slate-700/50">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsOpen(false)}
                  className="w-full btn-primary py-3 rounded-xl text-xs font-bold uppercase tracking-wider"
                >
                  Appliquer les filtres
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};