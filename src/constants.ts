export const CSV_URL_IMPORTS = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vR_rdvTpzG_R3Un1eDXvu0n9JwnB7NG3vqcs3_ShXZn9yCrSrJabcy9FwRdU1qtdLwPjamPd0vNOtG_/pub?output=csv&single=true&gid=1382163058';
export const CSV_URL_EXPORTS = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vR_rdvTpzG_R3Un1eDXvu0n9JwnB7NG3vqcs3_ShXZn9yCrSrJabcy9FwRdU1qtdLwPjamPd0vNOtG_/pub?output=csv&single=true&gid=1428313444';

export const STATUS_COLORS: Record<string, string> = {
  'En Transit': 'bg-[#dbeafe] text-[#1e40af] border-blue-200 dark:bg-blue-900/30 dark:text-blue-200',
  'Chargé': 'bg-[#ffedd5] text-[#9a3412] border-orange-200 dark:bg-orange-900/30 dark:text-orange-200',
  'Embarqué': 'bg-[#ede9fe] text-[#5b21b6] border-purple-200 dark:bg-purple-900/30 dark:text-purple-200',
  'Arrivée': 'bg-[#dcfce7] text-[#166534] border-green-200 dark:bg-green-900/30 dark:text-green-200',
  'DEFAULT': 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700'
};

export const CHART_COLORS = {
  'En Transit': '#3b82f6',
  'Chargé': '#f97316',
  'Embarqué': '#8b5cf6',
  'Arrivée': '#10b981',
  accent: '#01696f',
};
