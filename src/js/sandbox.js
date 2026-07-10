/**
 * Tactix Savings Calculator — Interactive Sandbox
 * Personalized dashboard simulation
 */

import { formatINR } from './utils.js';
import {
  renderMaterialInventoryChart,
  renderEquipmentUtilizationChart,
  renderLaborTrendChart,
  renderSavingsTimelineChart,
  renderSavingsByModuleChart,
} from './charts.js';

let currentResult = null;

/**
 * Initialize the sandbox with calculation results
 * @param {object} result - Full calculation result from calculator
 */
export function initSandbox(result) {
  currentResult = result;

  setupTabs();
  populateMaterialsPanel(result);
  populateEquipmentPanel(result);
  populateLaborPanel(result);
  populateFinancePanel(result);

  // Set personalized subtitle
  const subtitle = document.getElementById('sandbox-subtitle');
  if (subtitle) {
    subtitle.textContent = `This is how Tactix monitors your ${formatINR(result.input.budget)} project with ${result.input.num_laborers} workers`;
  }

  // Set final CTA text
  const ctaText = document.getElementById('final-cta-text');
  if (ctaText) {
    ctaText.textContent = `Tactix can save your project an estimated ${formatINR(result.summary.totalRecovery)}.`;
  }
}

/**
 * Setup tab switching logic
 */
function setupTabs() {
  const tabs = document.querySelectorAll('.sandbox-tab');
  const panels = document.querySelectorAll('.sandbox-panel');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const module = tab.dataset.module;

      // Update active tab
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      // Show active panel
      panels.forEach(p => p.classList.remove('active'));
      const activePanel = document.getElementById(`panel-${module}`);
      if (activePanel) {
        activePanel.classList.add('active');
        // Re-render charts when panel becomes visible
        renderPanelCharts(module);
      }
    });
  });
}

/**
 * Render charts for a specific panel
 */
function renderPanelCharts(module) {
  if (!currentResult) return;

  switch (module) {
    case 'materials':
      renderMaterialInventoryChart('material-inventory-chart', currentResult.input.budget);
      break;
    case 'equipment':
      renderEquipmentUtilizationChart('equipment-utilization-chart');
      break;
    case 'labor':
      renderLaborTrendChart('labor-trend-chart', currentResult.input.num_laborers);
      break;
    case 'finance':
      renderSavingsTimelineChart('savings-timeline-chart', currentResult.summary);
      renderSavingsByModuleChart('savings-by-module-chart', currentResult);
      break;
  }
}

/**
 * Populate Material Tracking Panel
 */
function populateMaterialsPanel(result) {
  const { materialTracking } = result.recovery;

  // KPIs
  setKPI('kpi-materials-tracked', '24 Items');
  setKPI('kpi-wastage-prevented', formatINR(materialTracking.amount));
  setKPI('kpi-stock-alerts', '3');

  // Generate alerts
  const alertList = document.getElementById('material-alerts');
  if (alertList) {
    const alerts = [
      {
        icon: '🔴',
        title: 'Cement stock below 30% — Reorder now',
        time: '2 minutes ago',
        type: 'critical',
      },
      {
        icon: '🟡',
        title: `Steel reinforcement usage 15% above estimate — ${formatINR(result.losses.materialWaste.amount * 0.05)} at risk`,
        time: '15 minutes ago',
        type: 'warning',
      },
      {
        icon: '🔵',
        title: 'Sand delivery received — 12 tons verified and logged',
        time: '1 hour ago',
        type: 'info',
      },
      {
        icon: '🟡',
        title: 'Brick inventory discrepancy detected — 200 units unaccounted',
        time: '3 hours ago',
        type: 'warning',
      },
    ];

    alertList.innerHTML = alerts.map((alert, i) => `
      <div class="alert-item ${alert.type}" style="animation-delay: ${i * 0.15}s">
        <span class="alert-item-icon">${alert.icon}</span>
        <div class="alert-item-content">
          <div class="alert-item-title">${alert.title}</div>
          <div class="alert-item-time">${alert.time}</div>
        </div>
      </div>
    `).join('');
  }

  // Render chart
  renderMaterialInventoryChart('material-inventory-chart', result.input.budget);
}

/**
 * Populate Equipment Monitor Panel
 */
function populateEquipmentPanel(result) {
  const { equipmentAlerts } = result.recovery;
  const scale = Math.max(1, Math.floor(result.input.budget / 100000000)); // Scale by crores

  const equipment = [
    { name: 'Excavator #1', status: 'active', utilization: 87 },
    { name: 'Tower Crane', status: 'active', utilization: 92 },
    { name: 'Concrete Mixer', status: 'active', utilization: 78 },
    { name: 'Excavator #2', status: 'idle', utilization: 12 },
    { name: 'Bulldozer', status: 'maintenance', utilization: 0 },
    { name: 'Loader #1', status: 'active', utilization: 65 },
    { name: 'Roller', status: 'idle', utilization: 8 },
    { name: 'Generator Set', status: 'active', utilization: 95 },
  ].slice(0, Math.min(8, 4 + scale));

  const activeCount = equipment.filter(e => e.status === 'active').length;
  const idleCount = equipment.filter(e => e.status !== 'active').length;

  // KPIs
  setKPI('kpi-active-equipment', String(activeCount));
  setKPI('kpi-idle-equipment', String(idleCount));
  setKPI('kpi-equipment-saved', formatINR(equipmentAlerts.amount));

  // Equipment grid
  const grid = document.getElementById('equipment-grid');
  if (grid) {
    grid.innerHTML = equipment.map(eq => {
      const gaugeClass = eq.utilization > 70 ? 'high' : eq.utilization > 30 ? 'medium' : 'low';
      return `
        <div class="equipment-card">
          <div class="equipment-card-header">
            <span class="equipment-name">${eq.name}</span>
            <span class="equipment-status ${eq.status}">${eq.status.charAt(0).toUpperCase() + eq.status.slice(1)}</span>
          </div>
          <div class="equipment-gauge">
            <div class="equipment-gauge-fill ${gaugeClass}" style="width: ${eq.utilization}%"></div>
          </div>
          <div class="equipment-utilization">${eq.utilization}% utilization</div>
        </div>
      `;
    }).join('');
  }

  // Render chart
  renderEquipmentUtilizationChart('equipment-utilization-chart');
}

/**
 * Populate Labor Productivity Panel
 */
function populateLaborPanel(result) {
  const { laborDashboard } = result.recovery;
  const numLaborers = result.input.num_laborers;

  // KPIs
  setKPI('kpi-total-laborers', String(numLaborers));
  setKPI('kpi-avg-efficiency', '76%');
  setKPI('kpi-labor-savings', formatINR(laborDashboard.amount));

  // Generate heatmap
  const heatmap = document.getElementById('labor-heatmap');
  if (heatmap) {
    const zones = ['Zone A', 'Zone B', 'Zone C', 'Zone D', 'Zone E', 'Zone F',
                   'Zone G', 'Zone H', 'Zone I', 'Zone J', 'Zone K', 'Zone L'];
    const colors = [
      { min: 80, color: 'rgba(16, 185, 129, 0.8)', label: 'High' },
      { min: 60, color: 'rgba(245, 158, 11, 0.8)', label: 'Medium' },
      { min: 40, color: 'rgba(239, 68, 68, 0.7)', label: 'Low' },
      { min: 0, color: 'rgba(239, 68, 68, 0.5)', label: 'Critical' },
    ];

    heatmap.innerHTML = zones.map(zone => {
      const productivity = Math.floor(35 + Math.random() * 60);
      const colorInfo = colors.find(c => productivity >= c.min);
      return `
        <div class="heatmap-cell" style="background: ${colorInfo.color}; animation: heatPulse ${2 + Math.random() * 2}s ease-in-out infinite"
             title="${zone}: ${productivity}% productivity">
          <span>${productivity}%</span>
          <span class="heatmap-cell-label">${zone}</span>
        </div>
      `;
    }).join('');
  }

  // Render chart
  renderLaborTrendChart('labor-trend-chart', numLaborers);
}

/**
 * Populate Financial Overview Panel
 */
function populateFinancePanel(result) {
  const { summary } = result;

  // KPIs
  setKPI('kpi-total-savings', formatINR(summary.totalRecovery));
  setKPI('kpi-monthly-savings', formatINR(summary.monthlySavings));
  setKPI('kpi-roi', `${summary.roiPercentage.toFixed(0)}%`);

  // Charts will be rendered when tab is clicked
}

/**
 * Set KPI card value
 */
function setKPI(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}
