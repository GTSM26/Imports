import React from 'react';
import { Search, RotateCcw, ExternalLink } from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface FiltersProps {
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

export const Filters: React.FC<FiltersProps> = ({
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
  return (
    <div className="px-6 mt-4">
      <div className="card-base overflow-hidden p-5">
        {/* Search & Reset Row */}
        <div className="flex flex-wrap gap-4 items-center mb-5">
          <div className="flex-1 min-w-[220px] relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Rechercher une référence, dossier..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-modern w-full pl-11 pr-4"
            />
          </div>
          <button
            onClick={onReset}
            className="btn-secondary px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2"
          >
            <RotateCcw size={14} />
            Réinitialiser
          </button>
        </div>

        {/* Filter Pills Row - Year */}
        <div className="mb-4">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 block">Année</span>
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
        </div>

        {/* Filter Pills Row - Month */}
        <div className="mb-4">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 block">Mois</span>
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
        </div>

        {/* Filter Pills Row - Week */}
        <div className="mb-5">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 block">Semaine</span>
          <div className="flex flex-wrap gap-2 max-h-[120px] overflow-y-auto pr-2 custom-scrollbar">
            <button
              onClick={() => setSemaine('Tous')}
              className={cn("filter-pill", semaine === 'Tous' ? "bg-slate-700 text-white shadow-lg" : "filter-pill-inactive")}
            >
              Toutes
            </button>
            {availableSemaines.map(s => (
              <button
                key={s}
                onClick={() => setSemaine(s)}
                className={cn("filter-pill min-w-[40px]", semaine === s ? "bg-slate-700 text-white shadow-lg" : "filter-pill-inactive")}
              >
                S{s}
              </button>
            ))}
          </div>
        </div>

        {/* Advanced Filters Row */}
        <div className="flex flex-wrap gap-6 pt-4 border-t border-slate-200/50 dark:border-slate-700/30">
          <div className="flex items-center gap-2 group">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Pays:</span>
            <select
              value={pays}
              onChange={(e) => setPays(e.target.value)}
              className="input-modern py-1.5 px-2 cursor-pointer text-xs font-semibold min-w-[100px]"
            >
              <option value="Tous">Tous</option>
              {availablePays.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-2 group">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Type:</span>
            <select
              value={typeOp}
              onChange={(e) => setTypeOp(e.target.value)}
              className="input-modern py-1.5 px-2 cursor-pointer text-xs font-semibold min-w-[100px]"
            >
              <option value="Tous">Tous</option>
              <option value="Complet">Complet</option>
              <option value="Groupage">Groupage</option>
              {availableTypes
                .filter(t => t.toLowerCase() !== 'complet' && t.toLowerCase() !== 'groupage')
                .map(t => <option key={t} value={t}>{t}</option>)
              }
            </select>
          </div>

          <div className="flex items-center gap-2 group">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Agence:</span>
            <select
              value={agenceMA}
              onChange={(e) => setAgenceMA(e.target.value)}
              className="input-modern py-1.5 px-2 cursor-pointer text-xs font-semibold min-w-[110px]"
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
          </div>

          <div className="flex items-center gap-2 group">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Transporteur:</span>
            <select
              value={transporteur}
              onChange={(e) => setTransporteur(e.target.value)}
              className="input-modern py-1.5 px-2 cursor-pointer text-xs font-semibold max-w-[120px]"
            >
              <option value="Tous">Tous</option>
              {availableTransporteurs.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-2 group">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Véhicule:</span>
            <select
              value={vehicule}
              onChange={(e) => setVehicule(e.target.value)}
              className="input-modern py-1.5 px-2 cursor-pointer text-xs font-semibold"
            >
              <option value="Tous">Tous</option>
              <option value="Tollé">Tollé</option>
              <option value="Bâchée">Bâchée</option>
              <option value="Plateau">Plateau</option>
              <option value="Frigo">Frigo</option>
              <option value="Taxi">Taxi</option>
            </select>
          </div>

          <div className="flex items-center gap-2 group opacity-60 hover:opacity-100 transition-opacity">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">BCD:</span>
            <select
              value={bcd}
              onChange={(e) => setBcd(e.target.value)}
              className="input-modern py-1.5 px-2 cursor-pointer text-xs font-semibold"
            >
              <option value="Tous">Tous</option>
              {availableBcd.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>

          {/* Exchange Rate */}
          <div className="ml-auto flex items-center gap-3 border-l border-slate-200/50 dark:border-slate-700/30 pl-6">
            <div className="flex flex-col items-end gap-1">
              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Taux BKAM</span>
              <div className="flex items-center bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-700 rounded-xl px-3 py-1.5 border border-slate-200/50 dark:border-slate-600/50 shadow-inner">
                <span className="text-[10px] text-slate-500 mr-2 font-medium">EUR→MAD</span>
                <input
                  type="text"
                  value={eurMadRate}
                  onChange={(e) => setEurMadRate(e.target.value)}
                  className="w-16 bg-transparent border-none focus:ring-0 text-[12px] font-bold text-accent dark:text-brand-yellow p-0 text-center"
                  placeholder="10.XX"
                />
              </div>
            </div>
            <a 
              href="https://www.bkam.ma/fr/Marches/Principaux-indicateurs/Marche-des-changes/Cours-de-change/Cours-des-billets-de-banque-etrangers" 
              target="_blank" 
              rel="noreferrer"
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-accent hover:bg-accent/10 transition-all"
              title="Consulter BKAM"
            >
              <ExternalLink size={14} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};