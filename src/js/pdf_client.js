/**
 * Tactix Savings Calculator — Client-Side PDF Generator
 * Generates identical PDF reports locally using jsPDF when backend is down
 */

/**
 * Format currency values in Indian notation for PDF (using Rs. instead of ₹ for helvetica compatibility)
 * @param {number} amount
 * @returns {string}
 */
function formatINRPDF(amount) {
  const abs = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';
  if (abs >= 10000000) {
    return `${sign}Rs.${(abs / 10000000).toFixed(2)} Crores`;
  }
  if (abs >= 100000) {
    return `${sign}Rs.${(abs / 100000).toFixed(2)} Lakhs`;
  }
  return `${sign}Rs.${abs.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
}

/**
 * Generate PDF report in the browser
 * @param {object} result - Calculation result
 * @param {object} lead - Lead / contact details
 */
export function generateClientPDF(result, lead) {
  const { jsPDF } = window.jspdf;
  if (!jsPDF) {
    console.error('jsPDF library not loaded');
    return null;
  }

  const doc = new jsPDF();
  const pageHeight = doc.internal.pageSize.height;

  // Colors
  const DARK_BLUE = [10, 36, 99];
  const MEDIUM_BLUE = [30, 80, 162];
  const BLACK = [33, 33, 33];
  const RED = [200, 40, 40];
  const GREEN = [34, 139, 34];
  const GREY_BG = [245, 245, 245];

  let y = 38;

  // --- Header ---
  doc.setFillColor(...DARK_BLUE);
  doc.rect(0, 0, 210, 28, 'F');
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text('Tactix Savings Report', 105, 12, { align: 'center' });
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  const dateStr = new Date().toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
  doc.text(`Generated on ${dateStr}`, 105, 19, { align: 'center' });

  // --- Helper to add sections ---
  function addSectionTitle(title) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(...DARK_BLUE);
    doc.text(title, 15, y);
    
    doc.setDrawColor(...MEDIUM_BLUE);
    doc.setLineWidth(0.6);
    doc.line(15, y + 2, 195, y + 2);
    y += 10;
  }

  function addKeyValueRow(key, value, fill = false) {
    if (fill) {
      doc.setFillColor(...GREY_BG);
      doc.rect(15, y - 5, 180, 8, 'F');
    }
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...BLACK);
    doc.text(`  ${key}`, 15, y);
    doc.setFont('helvetica', 'bold');
    doc.text(value, 110, y);
    y += 8;
  }

  // --- 1. Executive Summary ---
  addSectionTitle('Executive Summary');
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...BLACK);
  
  const companyStr = lead.company || 'your company';
  const summaryText = `Based on a project budget of ${formatINRPDF(result.input.budget)} over ${result.input.duration_months} months with ${result.input.num_laborers} laborers, ${companyStr} is estimated to face potential losses of ${formatINRPDF(result.summary.totalLoss)}. With Tactix's smart construction management platform, up to ${formatINRPDF(result.summary.totalRecovery)} can be recovered - an ROI of ${result.summary.roiPercentage.toFixed(1)}%.`;
  
  const splitText = doc.splitTextToSize(summaryText, 180);
  doc.text(splitText, 15, y);
  y += (splitText.length * 6) + 4;

  // Highlights boxes
  const totalLossStr = formatINRPDF(result.summary.totalLoss);
  const totalRecoveryStr = formatINRPDF(result.summary.totalRecovery);
  const paybackStr = result.summary.paybackMonths <= 1 ? '< 1 month' : `${result.summary.paybackMonths.toFixed(1)} months`;

  doc.setFillColor(...RED);
  doc.rect(15, y, 58, 18, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('Total Estimated Loss', 44, y + 5, { align: 'center' });
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(totalLossStr, 44, y + 13, { align: 'center' });

  doc.setFillColor(...GREEN);
  doc.rect(77, y, 58, 18, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('Recoverable with Tactix', 106, y + 5, { align: 'center' });
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(totalRecoveryStr, 106, y + 13, { align: 'center' });

  doc.setFillColor(...MEDIUM_BLUE);
  doc.rect(139, y, 58, 18, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('Payback Period', 168, y + 5, { align: 'center' });
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(paybackStr, 168, y + 13, { align: 'center' });

  y += 18 + 8;

  // --- 2. Loss Breakdown ---
  addSectionTitle('Loss Breakdown (Industry Averages)');
  
  const lossRows = [
    ['Material Wastage (12% of budget)', formatINRPDF(result.losses.materialWaste.amount)],
    ['Idle Machinery (6.5% of budget)', formatINRPDF(result.losses.idleMachinery.amount)],
    ['Labor Inefficiency (per laborer/day)', formatINRPDF(result.losses.laborInefficiency.amount)],
    ['Schedule Overruns (15% of budget)', formatINRPDF(result.losses.scheduleOverrun.amount)],
    ['Rework & Defects (7% of budget)', formatINRPDF(result.losses.reworkDefects.amount)]
  ];

  lossRows.forEach((row, i) => {
    addKeyValueRow(row[0], row[1], i % 2 === 0);
  });

  // Total Estimated Loss line
  doc.setDrawColor(...BLACK);
  doc.setLineWidth(0.3);
  doc.line(15, y - 2, 195, y - 2);
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...RED);
  doc.text('  TOTAL ESTIMATED LOSS', 15, y + 4);
  doc.text(totalLossStr, 110, y + 4);
  
  y += 12;

  // --- 3. Recovery Plan ---
  addSectionTitle('Recovery Plan - Tactix Modules');
  
  const recoveryRows = [
    ['Material Tracking (70% recovery)', formatINRPDF(result.recovery.materialTracking.amount)],
    ['Equipment Alerts (80% recovery)', formatINRPDF(result.recovery.equipmentAlerts.amount)],
    ['Labor Dashboard (60% recovery)', formatINRPDF(result.recovery.laborDashboard.amount)],
    ['Schedule Optimizer (50% recovery)', formatINRPDF(result.recovery.scheduleOptimizer.amount)],
    ['Quality Control (65% recovery)', formatINRPDF(result.recovery.qualityControl.amount)]
  ];

  recoveryRows.forEach((row, i) => {
    addKeyValueRow(row[0], row[1], i % 2 === 0);
  });

  // Total Recovery line
  doc.setDrawColor(...BLACK);
  doc.setLineWidth(0.3);
  doc.line(15, y - 2, 195, y - 2);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...GREEN);
  doc.text('  TOTAL RECOVERABLE SAVINGS', 15, y + 4);
  doc.text(totalRecoveryStr, 110, y + 4);

  // --- Page Break ---
  doc.addPage();
  y = 38;

  // Header banner on Page 2
  doc.setFillColor(...DARK_BLUE);
  doc.rect(0, 0, 210, 28, 'F');
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text('Tactix Savings Report', 105, 12, { align: 'center' });
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Generated on ${dateStr}`, 105, 19, { align: 'center' });

  // --- 4. ROI Summary ---
  addSectionTitle('ROI Summary');
  addKeyValueRow('Net Savings', formatINRPDF(result.summary.netSavings), true);
  addKeyValueRow('ROI', `${result.summary.roiPercentage.toFixed(1)}%`, false);
  addKeyValueRow('Payback Period', paybackStr, true);
  y += 4;

  // --- 5. Project Parameters ---
  addSectionTitle('Project Parameters');
  addKeyValueRow('Budget', formatINRPDF(result.input.budget), true);
  addKeyValueRow('Duration', `${result.input.duration_months} months`, false);
  addKeyValueRow('Laborers', `${result.input.num_laborers} workers`, true);
  if (lead.company) addKeyValueRow('Company', lead.company, false);
  if (lead.name) addKeyValueRow('Contact', lead.name, true);
  if (lead.email) addKeyValueRow('Email', lead.email, false);
  y += 6;

  // --- Disclaimer ---
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  const disclaimerText = 'Disclaimer: These estimates are based on industry-average loss percentages and Tactix\'s observed recovery rates across projects. Actual results may vary depending on project specifics, adoption, and implementation scope.';
  const splitDisclaimer = doc.splitTextToSize(disclaimerText, 180);
  doc.text(splitDisclaimer, 15, y);

  // Add Page Numbers in footer on both pages
  const totalPages = 2;
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setDrawColor(0, 0, 0, 0); // Hide footer boundary
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(`Page ${i}/${totalPages}  |  Confidential - Tactix Technologies`, 105, pageHeight - 10, { align: 'center' });
  }

  // Convert to Blob and return
  return doc.output('blob');
}
