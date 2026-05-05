import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Papa from 'papaparse';
import { Header } from './components/Header';
import { KPICards } from './components/KPICards';
import { FilterSidebar } from './components/FilterSidebar';
import { DataTable } from './components/DataTable';
import { ChartsSection } from './components/ChartsSection';
import { DetailDrawer } from './components/DetailDrawer';
import { TransportOp, DashboardStats } from './types';
import { CSV_URL_IMPORTS, CSV_URL_EXPORTS } from './constants';
import { parsePrice } from './lib/utils';
import { AlertCircle, Loader2 } from 'lucide-react';

import { CarrierAnalyticsDashboard } from './components/analytics/CarrierAnalyticsDashboard';

export default function App() {
  const [data, setData] = useState<TransportOp[]>([]);
  const [currentView, setCurrentView] = useState<'operations' | 'analytics'>('operations');
  const [direction, setDirection] = useState<'import' | 'export'>('import');

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Initial check without waiting for mount to avoid flash
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filter States
  const [search, setSearch] = useState('');
  const [annee, setAnnee] = useState('Tous');
  const [status, setStatus] = useState('Tous');
  const [pays, setPays] = useState('Tous');
  const [vehicule, setVehicule] = useState('Tous');
  const [semaine, setSemaine] = useState('Tous');
  const [transporteur, setTransporteur] = useState('Tous');
  const [mois, setMois] = useState('Tous');
  const [typeOp, setTypeOp] = useState('Tous');
  const [bcd, setBcd] = useState('Tous');
  const [mpl, setMpl] = useState('Tous');
  const [agenceMA, setAgenceMA] = useState('Tous');
  const [eurMadRate, setEurMadRate] = useState('10.8500');

  // Selected Detail
  const [selectedOp, setSelectedOp] = useState<TransportOp | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const fetchData = useCallback(async (manual = false) => {
    if (manual) setIsRefreshing(true);
    else setIsLoading(true);
    
    setError(null);

    const activeURL = direction === 'import' ? CSV_URL_IMPORTS : CSV_URL_EXPORTS;

    Papa.parse(`${activeURL}&_t=${new Date().getTime()}`, {
      download: true,
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
      complete: (results) => {
        try {
          const rawData = results.data as any[];
          
          const cleanedData: TransportOp[] = rawData
            .filter(row => row['Date Chargement'] || row['Date'] || row['Date '] || row['DATE'] || row['Lieu de chargement'] || row['Lieu'])
            .map(row => {
              const dateStr = (row['Date Chargement'] || row['Date'] || row['Date '] || row['DATE'] || '').trim();
              let anneeExtracted = '';
              if (dateStr.includes('/')) anneeExtracted = dateStr.split('/').pop() || '';
              else if (dateStr.includes('-')) anneeExtracted = dateStr.split('-')[0] || ''; // YYYY-MM-DD
              
              if (anneeExtracted.length > 4) anneeExtracted = anneeExtracted.substring(0, 4); // Handle potential junk
              
              const priceMAD = parsePrice(row['Prix Achat MAD'] || row['Vente MAD'] || row['MAD'] || '');
              const priceEUR = parsePrice(row['Prix Achat €'] || row['Prix Achat'] || '');
              
              const isMAD = priceMAD > 0 || (row['Devise'] || '').trim().toUpperCase() === 'MAD';

              return {
                dateChargement: dateStr,
                annee: anneeExtracted,
                sem: (row['Sem'] || '').trim(),
                mois: (row['Mois'] || '').trim(),
                pays: (row['Pays'] || '').trim(),
                type: (row['Type'] || '').trim(),
                mpl: (row['MPL'] || '').trim(),
                lieuChargement: (row['Lieu de chargement'] || '').trim(),
                vehicule: (row['Véhicule'] || '').trim(),
                transporteur: (row['Transporteur'] || '').trim(),
                prixAchat: isMAD ? priceMAD : priceEUR,
                devise: isMAD ? 'MAD' : 'EUR',
                dateDepart: (row['Date de départ'] || '').trim(),
                refDossier: (row['Réf Dossier'] || row['Ref Dossier'] || row['Reference'] || row['Ref'] || row['REF'] || '').trim(),
                bcd: (row['BCD'] || '').trim(),
                agenceMA: (row['Agence MA'] || row['BCD'] || '').trim(),
                numRemorque: (row['N°: Remorque'] || row['N° Remorque'] || '').trim(),
                numTracteur: (row['N°: Tracteur'] || row['N° Tracteur'] || '').trim(),
                status: (row['Status'] || '').trim(),
                observations: (row['Observations'] || '').trim(),
                tauxChange: (row['Taux'] || row['Taux Change'] || row['Cours'] || '').trim(),
                incident: (row['Incident'] || row['Incidents'] || '').trim(),
              };
          });

          setData(cleanedData);
          setLastSync(new Date());
          setIsLoading(false);
          setIsRefreshing(false);
        } catch (err) {
          setError("Erreur lors du traitement des données CSV.");
          setIsLoading(false);
          setIsRefreshing(false);
        }
      },
      error: (err) => {
        setError("Impossible de charger les données depuis Google Sheets.");
        setIsLoading(false);
        setIsRefreshing(false);
      }
    });
  }, []);

  useEffect(() => {
    fetchData();
    // Refresh every 5 minutes
    const interval = setInterval(() => fetchData(), 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchData, direction]);

  // Fetch EUR/MAD rate
  useEffect(() => {
    const fetchRate = async () => {
      try {
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/EUR');
        const data = await response.json();
        if (data.rates && data.rates.MAD) {
          const adjustedRate = data.rates.MAD - 0.0145;
          setEurMadRate(adjustedRate.toFixed(4));
        }
      } catch (err) {
        console.error('Failed to fetch EUR/MAD rate:', err);
      }
    };
    fetchRate();
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(prev => !prev);

  // Derived Values
  const availablePays = useMemo(() => 
    Array.from(new Set(data.map(d => d.pays).filter(Boolean))).sort()
  , [data]);

  const availableSemaines = useMemo(() => 
    Array.from(new Set(data.map(d => d.sem).filter(Boolean))).sort((a, b) => parseInt(String(a)) - parseInt(String(b)))
  , [data]);

  const availableAnnees = useMemo(() => 
    Array.from(new Set(data.map(d => d.annee).filter(Boolean))).sort((a, b) => (b as string).localeCompare(a as string)) // Recent first
  , [data]);

  const availableTransporteurs = useMemo(() => 
    Array.from(new Set(data.map(d => d.transporteur).filter(Boolean))).sort()
  , [data]);

  const availableMois = useMemo(() => {
    const monthsOrder = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
    // Filter months based on selected year if any to keep UI clean
    const relevantData = annee === 'Tous' ? data : data.filter(d => d.annee === annee);
    return Array.from(new Set(relevantData.map(d => d.mois).filter(Boolean)))
      .sort((a, b) => monthsOrder.indexOf((a as string).toLowerCase()) - monthsOrder.indexOf((b as string).toLowerCase()));
  }, [data, annee]);

  // Update available weeks based on selected year/month to keep UI clean
  const dynamicAvailableSemaines = useMemo(() => {
    let relevantData = data;
    if (annee !== 'Tous') relevantData = relevantData.filter(d => d.annee === annee);
    if (mois !== 'Tous') relevantData = relevantData.filter(d => d.mois === mois);
    return Array.from(new Set(relevantData.map(d => d.sem).filter(Boolean)))
      .sort((a, b) => parseInt(String(a)) - parseInt(String(b)));
  }, [data, annee, mois]);

  const availableTypes = useMemo(() => 
    Array.from(new Set(data.map(d => d.type).filter(Boolean))).sort()
  , [data]);

  const availableBcd = useMemo(() => 
    Array.from(new Set(data.map(d => d.bcd).filter(Boolean))).sort()
  , [data]);

  const availableMpl = useMemo(() => 
    Array.from(new Set(data.map(d => d.mpl).filter(Boolean))).sort()
  , [data]);

  const availableAgences = useMemo(() => 
    Array.from(new Set(data.map(d => d.agenceMA).filter(Boolean))).sort()
  , [data]);

  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchesSearch = !search || 
        item.refDossier.toLowerCase().includes(search.toLowerCase()) ||
        item.lieuChargement.toLowerCase().includes(search.toLowerCase()) ||
        item.numRemorque.toLowerCase().includes(search.toLowerCase()) ||
        item.transporteur.toLowerCase().includes(search.toLowerCase());
      
      const matchesAnnee = annee === 'Tous' || item.annee === annee;
      const matchesStatus = status === 'Tous' || item.status === status;
      const matchesPays = pays === 'Tous' || item.pays === pays;
      const matchesVehicule = vehicule === 'Tous' || item.vehicule === vehicule;
      const matchesSemaine = semaine === 'Tous' || item.sem === semaine;
      const matchesTransporteur = transporteur === 'Tous' || item.transporteur === transporteur;
      const matchesMois = mois === 'Tous' || item.mois === mois;
      const matchesType = typeOp === 'Tous' || item.type === typeOp;
      const matchesBcd = bcd === 'Tous' || item.bcd === bcd;
      const matchesMpl = mpl === 'Tous' || item.mpl === mpl;
      const matchesAgence = agenceMA === 'Tous' || item.agenceMA === agenceMA;

      return matchesSearch && matchesAnnee && matchesStatus && matchesPays && matchesVehicule && matchesSemaine && matchesTransporteur && matchesMois && matchesType && matchesBcd && matchesMpl && matchesAgence;
    }).sort((a, b) => {
      // Helper to parse DD/MM/YYYY to Date
      const parseDate = (dStr: string) => {
        if (!dStr || !dStr.includes('/')) return new Date(0);
        const [day, month, year] = dStr.split('/').map(Number);
        return new Date(year, month - 1, day);
      };
      return parseDate(b.dateChargement).getTime() - parseDate(a.dateChargement).getTime();
    });
  }, [data, search, annee, status, pays, vehicule, semaine, transporteur, mois, typeOp, bcd, mpl, agenceMA]);

  const stats: DashboardStats = useMemo(() => {
    const rate = parseFloat(eurMadRate) || 10.85;
    return {
      totalEnvois: data.length,
      enTransitCount: data.filter(item => item.status === 'En Transit').length,
      chiffreAchatTotal: data.reduce((acc, curr) => {
        const val = curr.devise === 'MAD' ? curr.prixAchat / rate : curr.prixAchat;
        return acc + val;
      }, 0),
      paysActifsCount: availablePays.length,
    };
  }, [data, availablePays, eurMadRate]);

  const handleRowClick = (op: TransportOp) => {
    setSelectedOp(op);
    setIsDrawerOpen(true);
  };

  const handleResetFilters = () => {
    setSearch('');
    setAnnee('Tous');
    setStatus('Tous');
    setPays('Tous');
    setVehicule('Tous');
    setSemaine('Tous');
    setTransporteur('Tous');
    setMois('Tous');
    setTypeOp('Tous');
    setBcd('Tous');
    setMpl('Tous');
    setAgenceMA('Tous');
  };

  const handleExport = () => {
    const csv = Papa.unparse(filteredData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `tms_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-[#0a0f14] gap-4">
        <div className="relative">
          <Loader2 className="w-12 h-12 text-petrol animate-spin" />
          <div className="absolute inset-0 bg-petrol/20 blur-xl animate-pulse rounded-full" />
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-slate-800 dark:text-slate-200">TMS Dashboard</p>
          <p className="text-sm text-slate-500 animate-pulse">Chargement des données...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-[#0a0f14] p-6">
        <div className="card-base p-8 max-w-md text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Erreur de chargement</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-6">{error}</p>
          <button 
            onClick={() => fetchData()}
            className="px-6 py-2 bg-petrol text-white rounded-lg font-bold hover:bg-petrol-hover transition-all"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-12">
      <Header 
        lastSync={lastSync} 
        onRefresh={() => fetchData(true)}
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
        isRefreshing={isRefreshing}
        currentView={currentView}
        onViewChange={setCurrentView}
        direction={direction}
        onDirectionChange={(dir) => {
          setDirection(dir);
          handleResetFilters();
        }}
      />
      
      <main className="flex flex-col gap-4">
        {currentView === 'operations' && <KPICards stats={stats} />}
        
        <FilterSidebar 
          search={search} setSearch={setSearch}
          annee={annee} setAnnee={setAnnee}
          status={status} setStatus={setStatus}
          pays={pays} setPays={setPays}
          vehicule={vehicule} setVehicule={setVehicule}
          semaine={semaine} setSemaine={setSemaine}
          mois={mois} setMois={setMois}
          transporteur={transporteur} setTransporteur={setTransporteur}
          typeOp={typeOp} setTypeOp={setTypeOp}
          bcd={bcd} setBcd={setBcd}
          mpl={mpl} setMpl={setMpl}
          agenceMA={agenceMA} setAgenceMA={setAgenceMA}
          eurMadRate={eurMadRate} setEurMadRate={setEurMadRate}
          availablePays={availablePays}
          availableSemaines={dynamicAvailableSemaines}
          availableAnnees={availableAnnees}
          availableTransporteurs={availableTransporteurs}
          availableMois={availableMois}
          availableTypes={availableTypes}
          availableBcd={availableBcd}
          availableMpl={availableMpl}
          availableAgences={availableAgences}
          onReset={handleResetFilters}
        />

        {currentView === 'operations' ? (
          <div className="flex flex-col lg:flex-row gap-6 px-6 pb-6 min-h-[400px]">
            <DataTable 
              data={filteredData} 
              search={search}
              setSearch={setSearch}
              onRowClick={handleRowClick}
              onExport={handleExport}
              onReset={handleResetFilters}
              eurMadRate={eurMadRate}
            />
            <ChartsSection data={filteredData} isDarkMode={isDarkMode} />
          </div>
        ) : (
          <CarrierAnalyticsDashboard data={filteredData} isDarkMode={isDarkMode} eurMadRate={eurMadRate} />
        )}
      </main>

      <DetailDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
        op={selectedOp} 
        eurMadRate={eurMadRate}
      />
    </div>
  );
}

