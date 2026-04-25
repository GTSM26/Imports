import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { TransportOp } from '../types';
import { formatCurrency } from './utils';

export const generateBCD = async (op: TransportOp, defaultRate?: string) => {
  // Check if Reference Dossier exists
  if (!op.refDossier || op.refDossier.trim() === '') {
    return;
  }

  let finalRate = op.tauxChange || defaultRate;

  // If no rate is provided in the operation but we have a date, try to fetch historical rate
  if (!op.tauxChange && op.dateChargement && op.dateChargement.includes('/')) {
    try {
      const [d, m, y] = op.dateChargement.split('/');
      // Ensure we have a valid date part
      if (y && m && d && y.length === 4) {
        const dateFormatted = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
        
        // Frankfurter API is great for historical EUR/MAD
        const response = await fetch(`https://api.frankfurter.app/${dateFormatted}?to=MAD`);
        const data = await response.json();
        
        if (data.rates && data.rates.MAD) {
          finalRate = data.rates.MAD.toFixed(4);
        }
      }
    } catch (err) {
      console.error('Failed to fetch historical rate:', err);
      // Fallback to defaultRate (already set in finalRate)
    }
  }

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  // Colors
  const primaryColor = [27, 47, 134]; // Blue #1b2f86
  const brandYellow = [255, 197, 0]; // Yellow #ffc500
  const accentColor = [220, 38, 38]; // Red
  const secondaryColor = [51, 65, 85]; // Slate 700
  const lightGray = [248, 250, 252]; // Slate 50
  
  // Format BCD number: BCD - [ANNÉE] - [RÉFÉRENCE DOSSIER]
  const bcdNumber = `BCD - ${op.annee || new Date().getFullYear()} - ${op.refDossier}`;
  const operationDate = op.dateChargement || new Date().toLocaleDateString('fr-FR');

  // --- HEADER SECTION ---
  // Top bar
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, pageWidth, 5, 'F');
  
  // Logo / Company Name
  doc.setFontSize(24);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFont('helvetica', 'bold');
  doc.text('GTSM', 20, 25);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor( secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.text('Groupe GONDRAND', 20, 31);

  // Title: BON DE COMMANDE
  doc.setFontSize(18);
  doc.setTextColor( secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.setFont('helvetica', 'bold');
  doc.text('BON DE COMMANDE', pageWidth - 20, 25, { align: 'right' });

  // BCD Reference Box
  const boxWidth = 90;
  const boxHeight = 22;
  const boxX = pageWidth - boxWidth - 20;
  const boxY = 32;

  doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
  doc.rect(boxX, boxY, boxWidth, boxHeight, 'F');
  doc.setDrawColor(226, 232, 240); // border color
  doc.rect(boxX, boxY, boxWidth, boxHeight, 'S');
  
  // Labels
  doc.setFontSize(8);
  doc.setTextColor( secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.setFont('helvetica', 'normal');
  doc.text('N° DE COMMANDE:', boxX + 5, boxY + 7);
  doc.text('DATE D\'ÉMISSION:', boxX + 55, boxY + 7);

  // Values
  doc.setFontSize(11);
  doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.setFont('helvetica', 'bold');
  doc.text(bcdNumber, boxX + 5, boxY + 15);
  
  doc.setFontSize(10);
  doc.setTextColor(0);
  doc.setFont('helvetica', 'bold');
  doc.text(operationDate, boxX + 55, boxY + 15);

  // Exchange Rate (BKAM)
  if (finalRate) {
    doc.setFontSize(7);
    doc.setTextColor(120);
    doc.setFont('helvetica', 'italic');
    doc.text(`Taux de change (BKAM): 1 EUR = ${finalRate} MAD`, boxX + 5, boxY + boxHeight + 4);
  }

  // --- MAIN CONTENT ---
  let currentY = 65;

  // Horizontal line
  doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setLineWidth(0.5);
  doc.line(20, currentY, pageWidth - 20, currentY);
  currentY += 10;

  // Transporteur & Client Info Grid
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('TRANSPORTEUR', 20, currentY);
  doc.text('DESTINATION / CLIENT', pageWidth / 2 + 10, currentY);
  
  currentY += 6;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0);
  doc.text(op.transporteur || 'Non spécifié', 20, currentY);
  doc.text(op.agenceMA || op.pays || 'Maroc', pageWidth / 2 + 10, currentY);
  
  currentY += 15;

  // DETAILS TABLE
  autoTable(doc, {
    startY: currentY,
    head: [['DÉSIGNATION', 'DÉTAILS']],
    body: [
      ['Référence dossier', op.refDossier],
      ['Lieu de chargement', op.lieuChargement],
      ['Lieu de déchargement', op.agenceMA || op.pays],
      ['Véhicule / Immatriculation', `${op.numTracteur} / ${op.numRemorque}`],
      ['Type de transport', op.type],
      ['Type de douane', 'Transit Régime Normal'],
    ],
    theme: 'grid',
    headStyles: { 
      fillColor: [1, 105, 111], 
      textColor: 255, 
      fontSize: 9, 
      fontStyle: 'bold',
      halign: 'left',
      cellPadding: 4
    },
    bodyStyles: { 
      fontSize: 9,
      cellPadding: 4,
      textColor: 40
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 60, fillColor: [249, 250, 251] },
      1: { cellWidth: 'auto' }
    },
    styles: { overflow: 'linebreak', lineColor: [226, 232, 240] },
    margin: { left: 20, right: 20 }
  });

  currentY = (doc as any).lastAutoTable.finalY + 20;

  // TOTALS BOX (Align right)
  const totalsWidth = 70;
  const totalsX = pageWidth - 20 - totalsWidth;
  
  doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
  doc.rect(totalsX, currentY, totalsWidth, 25, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.rect(totalsX, currentY, totalsWidth, 25, 'S');
  
  doc.setFontSize(10);
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.setFont('helvetica', 'bold');
  doc.text('MONTANT TOTAL HT', totalsX + 5, currentY + 10);
  
  doc.setFontSize(11);
  doc.setTextColor(0);
  // Clean price display to avoid "3 /314 €"
  const cleanPrice = String(formatCurrency(op.prixAchat)).replace(/\s/g, ' ');
  doc.text(cleanPrice, pageWidth - 25, currentY + 17, { align: 'right' });

  // --- FOOTER SECTION ---
  const footerStartY = pageHeight - 55;
  
  // Separation line
  doc.setDrawColor(226, 232, 240);
  doc.line(20, footerStartY, pageWidth - 20, footerStartY);

  doc.setFontSize(8);
  doc.setTextColor(100);
  doc.setFont('helvetica', 'italic');
  
  const legalText1 = "Prestations exonérées de TVA - Art. 92 (I-35°) du Code Général des Impôts.";
  const legalText2 = "GTSM s'engage à verser la TVA exigible en cas de non-justification de la destination exonérée.";
  const legalText3 = "Merci d'établir votre facture en rappelant obligatoirement notre n° de Bon de Commande.";
  
  doc.text(legalText1, 20, footerStartY + 10);
  doc.text(legalText2, 20, footerStartY + 14);
  doc.text(legalText3, 20, footerStartY + 18);

  // Address Box
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  
  const companyInfo = [
    "21 Angle Bd Hadj Mekouar et Passage La Plage Bureau N° 12 3éme ETG Ain Sebaâ, Casablanca",
    "Tél.: +(212) 05 22 67 22 12/13  |  Fax: +(212) 05 22 67 22 14  |  GSM: +(212) 06 61 70 06 49",
    "R.C N°: 212369 - Patente N°: 31501688 - I.F N°: 40144275 - CNSS N°: 8302375 - ICE N°: 001511159000011"
  ];

  let footerY = pageHeight - 15;
  companyInfo.reverse().forEach((line, i) => {
    doc.text(line, pageWidth / 2, footerY - (i * 4), { align: 'center' });
  });

  // Save PDF
  doc.save(`${bcdNumber}.pdf`);
};
