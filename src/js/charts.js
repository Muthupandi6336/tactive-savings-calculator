/**
 * Tactix Savings Calculator — Chart.js Configurations
 * Animated financial visualizations
 */

import { Chart, registerables } from 'chart.js';
import { formatINR } from './utils.js';

// Register all Chart.js components
Chart.register(...registerables);

// ── Chart Color Palette ──
const COLORS = {
  danger: '#EF4444',
  dangerLight: '#F87171',
  warning: '#F59E0B',
  warningLight: '#FBBF24',
  success: '#10B981',
  successLight: '#34D399',
  accent: '#06B6D4',
  accentLight: '#22D3EE',
  primary: '#F59E0B',
  primaryLight: '#FBBF24',
  purple: '#8B5CF6',
  pink: '#EC4899',
  textSecondary: '#9CA3AF',
  textMuted: '#6B7280',
  border: 'rgba(255, 255, 255, 0.08)',
  bgCard: 'rgba(17, 24, 39, 0.7)',
};

const LOSS_COLORS = [
  '#EF4444', // Material Waste - Red
  '#F59E0B', // Idle Machinery - Amber
  '#8B5CF6', // Labor Inefficiency - Purple
  '#EC4899', // Schedule Overrun - Pink
  '#F97316', // Rework - Orange
];

const RECOVERY_COLORS = [
  '#10B981', // Material Tracking - Green
  '#06B6D4', // Equipment Alerts - Cyan
  '#22D3EE', // Labor Dashboard - Light Cyan
  '#34D399', // Schedule Optimizer - Light Green
  '#6EE7B7', // Quality Control - Mint
];

// ── Shared Chart Options ──
const baseOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: {
        color: COLORS.textSecondary,
        font: { family: "'Inter', sans-serif", size: 12, weight: '500' },
        padding: 16,
        usePointStyle: true,
        pointStyleWidth: 10,
      },
    },
    tooltip: {
      backgroundColor: 'rgba(10, 14, 26, 0.95)',
      titleColor: '#F9FAFB',
      bodyColor: '#9CA3AF',
      borderColor: 'rgba(255, 255, 255, 0.1)',
      borderWidth: 1,
      cornerRadius: 12,
      padding: 12,
      titleFont: { family: "'Inter', sans-serif", size: 13, weight: '600' },
      bodyFont: { family: "'Inter', sans-serif", size: 12 },
      displayColors: true,
      callbacks: {
        label: function (ctx) {
          return ` ${ctx.label}: ${formatINR(ctx.parsed.y || ctx.parsed || 0)}`;
        },
      },
    },
  },
  animation: {
    duration: 1500,
    easing: 'easeOutQuart',
  },
};

// Store chart instances for cleanup
const chartInstances = {};

/**
 * Destroy existing chart instance if it exists
 */
function destroyChart(id) {
  if (chartInstances[id]) {
    chartInstances[id].destroy();
    delete chartInstances[id];
  }
}

/**
 * Render the Loss Breakdown Bar Chart
 * @param {string} canvasId
 * @param {Array} losses - [{ label, amount, icon }]
 */
export function renderLossBarChart(canvasId, losses) {
  destroyChart(canvasId);
  const ctx = document.getElementById(canvasId)?.getContext('2d');
  if (!ctx) return;

  chartInstances[canvasId] = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: losses.map(l => l.label),
      datasets: [{
        label: 'Estimated Loss',
        data: losses.map(l => l.amount),
        backgroundColor: LOSS_COLORS.map(c => c + '99'), // 60% opacity
        borderColor: LOSS_COLORS,
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
        barPercentage: 0.7,
      }],
    },
    options: {
      ...baseOptions,
      indexAxis: 'y',
      scales: {
        x: {
          grid: { color: COLORS.border, drawBorder: false },
          ticks: {
            color: COLORS.textMuted,
            font: { size: 11 },
            callback: (val) => formatINR(val),
          },
        },
        y: {
          grid: { display: false },
          ticks: {
            color: COLORS.textSecondary,
            font: { size: 12, weight: '500' },
          },
        },
      },
      plugins: {
        ...baseOptions.plugins,
        legend: { display: false },
        tooltip: {
          ...baseOptions.plugins.tooltip,
          callbacks: {
            label: (ctx) => ` Loss: ${formatINR(ctx.parsed.x)}`,
          },
        },
      },
      animation: {
        duration: 2000,
        easing: 'easeOutQuart',
        delay: (context) => context.dataIndex * 200,
      },
    },
  });
}

/**
 * Render the Loss Doughnut Chart
 * @param {string} canvasId
 * @param {Array} losses
 * @param {number} totalBudget
 */
export function renderLossDoughnutChart(canvasId, losses, totalBudget) {
  destroyChart(canvasId);
  const ctx = document.getElementById(canvasId)?.getContext('2d');
  if (!ctx) return;

  const totalLoss = losses.reduce((sum, l) => sum + l.amount, 0);
  const remaining = totalBudget - totalLoss;

  chartInstances[canvasId] = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: [...losses.map(l => l.label), 'Effective Budget'],
      datasets: [{
        data: [...losses.map(l => l.amount), remaining],
        backgroundColor: [
          ...LOSS_COLORS.map(c => c + 'CC'),
          'rgba(107, 114, 128, 0.3)',
        ],
        borderColor: [
          ...LOSS_COLORS,
          'rgba(107, 114, 128, 0.5)',
        ],
        borderWidth: 2,
        hoverOffset: 8,
      }],
    },
    options: {
      ...baseOptions,
      cutout: '65%',
      plugins: {
        ...baseOptions.plugins,
        legend: {
          ...baseOptions.plugins.legend,
          position: 'bottom',
        },
        tooltip: {
          ...baseOptions.plugins.tooltip,
          callbacks: {
            label: (ctx) => {
              const pct = ((ctx.parsed / totalBudget) * 100).toFixed(1);
              return ` ${ctx.label}: ${formatINR(ctx.parsed)} (${pct}%)`;
            },
          },
        },
      },
      animation: {
        animateRotate: true,
        animateScale: true,
        duration: 2000,
        easing: 'easeOutQuart',
      },
    },
  });
}

/**
 * Render Before vs After comparison chart
 * @param {string} canvasId
 * @param {object} result - Full calculation result
 */
export function renderComparisonChart(canvasId, result) {
  destroyChart(canvasId);
  const ctx = document.getElementById(canvasId)?.getContext('2d');
  if (!ctx) return;

  const lossKeys = Object.keys(result.losses);
  const recoveryKeys = Object.keys(result.recovery);
  const labels = lossKeys.map(k => result.losses[k].label);

  const lossAmounts = lossKeys.map(k => result.losses[k].amount);
  const recoveryAmounts = recoveryKeys.map(k => result.recovery[k].amount);
  const afterAmounts = lossAmounts.map((loss, i) => loss - recoveryAmounts[i]);

  chartInstances[canvasId] = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Without Tactix (Loss)',
          data: lossAmounts,
          backgroundColor: 'rgba(239, 68, 68, 0.6)',
          borderColor: '#EF4444',
          borderWidth: 2,
          borderRadius: 6,
        },
        {
          label: 'With Tactix (Remaining Loss)',
          data: afterAmounts,
          backgroundColor: 'rgba(16, 185, 129, 0.6)',
          borderColor: '#10B981',
          borderWidth: 2,
          borderRadius: 6,
        },
      ],
    },
    options: {
      ...baseOptions,
      scales: {
        x: {
          grid: { display: false },
          ticks: {
            color: COLORS.textSecondary,
            font: { size: 11, weight: '500' },
            maxRotation: 20,
          },
        },
        y: {
          grid: { color: COLORS.border, drawBorder: false },
          ticks: {
            color: COLORS.textMuted,
            font: { size: 11 },
            callback: (val) => formatINR(val),
          },
        },
      },
      plugins: {
        ...baseOptions.plugins,
        tooltip: {
          ...baseOptions.plugins.tooltip,
          callbacks: {
            label: (ctx) => ` ${ctx.dataset.label}: ${formatINR(ctx.parsed.y)}`,
          },
        },
      },
      animation: {
        duration: 1800,
        easing: 'easeOutQuart',
        delay: (context) => context.dataIndex * 150,
      },
    },
  });
}

/**
 * Render Material Inventory Chart (Sandbox)
 * @param {string} canvasId
 * @param {number} budget
 */
export function renderMaterialInventoryChart(canvasId, budget) {
  destroyChart(canvasId);
  const ctx = document.getElementById(canvasId)?.getContext('2d');
  if (!ctx) return;

  const scale = budget / 500000000; // Scale relative to ₹50Cr
  const materials = ['Cement', 'Steel', 'Sand', 'Bricks', 'Pipes', 'Electrical'];
  const stock = materials.map(() => Math.floor(60 + Math.random() * 35));
  const threshold = 40;

  chartInstances[canvasId] = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: materials,
      datasets: [
        {
          label: 'Current Stock %',
          data: stock,
          backgroundColor: stock.map(s =>
            s < threshold ? 'rgba(239, 68, 68, 0.6)' :
            s < 60 ? 'rgba(245, 158, 11, 0.6)' :
            'rgba(16, 185, 129, 0.6)'
          ),
          borderColor: stock.map(s =>
            s < threshold ? '#EF4444' :
            s < 60 ? '#F59E0B' :
            '#10B981'
          ),
          borderWidth: 2,
          borderRadius: 6,
        },
        {
          label: 'Reorder Threshold',
          data: materials.map(() => threshold),
          type: 'line',
          borderColor: '#EF4444',
          borderDash: [5, 5],
          borderWidth: 2,
          pointRadius: 0,
          fill: false,
        },
      ],
    },
    options: {
      ...baseOptions,
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: COLORS.textSecondary, font: { size: 11 } },
        },
        y: {
          max: 100,
          grid: { color: COLORS.border },
          ticks: {
            color: COLORS.textMuted,
            font: { size: 11 },
            callback: (val) => val + '%',
          },
        },
      },
      animation: { duration: 1500, easing: 'easeOutQuart' },
    },
  });
}

/**
 * Render Equipment Utilization Chart (Sandbox)
 * @param {string} canvasId
 */
export function renderEquipmentUtilizationChart(canvasId) {
  destroyChart(canvasId);
  const ctx = document.getElementById(canvasId)?.getContext('2d');
  if (!ctx) return;

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const withoutTactix = [45, 52, 38, 61, 42, 55];
  const withTactix = [78, 85, 82, 91, 88, 79];

  chartInstances[canvasId] = new Chart(ctx, {
    type: 'line',
    data: {
      labels: days,
      datasets: [
        {
          label: 'Without Tactix',
          data: withoutTactix,
          borderColor: '#EF4444',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 6,
        },
        {
          label: 'With Tactix',
          data: withTactix,
          borderColor: '#10B981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 6,
        },
      ],
    },
    options: {
      ...baseOptions,
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: COLORS.textSecondary },
        },
        y: {
          min: 0,
          max: 100,
          grid: { color: COLORS.border },
          ticks: {
            color: COLORS.textMuted,
            callback: (val) => val + '%',
          },
        },
      },
    },
  });
}

/**
 * Render Labor Trend Chart (Sandbox)
 * @param {string} canvasId
 * @param {number} numLaborers
 */
export function renderLaborTrendChart(canvasId, numLaborers) {
  destroyChart(canvasId);
  const ctx = document.getElementById(canvasId)?.getContext('2d');
  if (!ctx) return;

  const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'];
  const attendance = weeks.map(() => Math.floor(numLaborers * (0.75 + Math.random() * 0.2)));
  const productivity = [62, 65, 71, 74, 78, 82]; // Improving with Tactix

  chartInstances[canvasId] = new Chart(ctx, {
    type: 'line',
    data: {
      labels: weeks,
      datasets: [
        {
          label: 'Attendance',
          data: attendance,
          borderColor: '#06B6D4',
          backgroundColor: 'rgba(6, 182, 212, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          yAxisID: 'y1',
        },
        {
          label: 'Productivity %',
          data: productivity,
          borderColor: '#F59E0B',
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          yAxisID: 'y2',
        },
      ],
    },
    options: {
      ...baseOptions,
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: COLORS.textSecondary },
        },
        y1: {
          type: 'linear',
          position: 'left',
          grid: { color: COLORS.border },
          ticks: { color: '#06B6D4', font: { size: 11 } },
          title: { display: true, text: 'Workers', color: '#06B6D4' },
        },
        y2: {
          type: 'linear',
          position: 'right',
          grid: { display: false },
          min: 0,
          max: 100,
          ticks: {
            color: '#F59E0B',
            font: { size: 11 },
            callback: (val) => val + '%',
          },
          title: { display: true, text: 'Productivity', color: '#F59E0B' },
        },
      },
    },
  });
}

/**
 * Render Monthly Savings Timeline (Sandbox Finance)
 * @param {string} canvasId
 * @param {object} summary
 */
export function renderSavingsTimelineChart(canvasId, summary) {
  destroyChart(canvasId);
  const ctx = document.getElementById(canvasId)?.getContext('2d');
  if (!ctx) return;

  const months = [];
  const cumulativeSavings = [];
  const cumulativeCost = [];
  const monthlySavings = summary.monthlySavings;
  const monthlyCost = summary.tactixCost / summary.totalRecovery * monthlySavings;

  for (let i = 1; i <= Math.min(summary.totalRecovery > 0 ? Math.max(summary.paybackMonths * 2, 12) : 12, 36); i++) {
    months.push(`Month ${i}`);
    cumulativeSavings.push(monthlySavings * i);
    cumulativeCost.push(summary.tactixCost);
  }

  chartInstances[canvasId] = new Chart(ctx, {
    type: 'line',
    data: {
      labels: months,
      datasets: [
        {
          label: 'Cumulative Savings',
          data: cumulativeSavings,
          borderColor: '#10B981',
          backgroundColor: 'rgba(16, 185, 129, 0.15)',
          borderWidth: 3,
          fill: true,
          tension: 0.3,
          pointRadius: 3,
          pointHoverRadius: 6,
        },
        {
          label: 'Tactix Investment',
          data: cumulativeCost,
          borderColor: '#F59E0B',
          borderDash: [8, 4],
          borderWidth: 2,
          pointRadius: 0,
          fill: false,
        },
      ],
    },
    options: {
      ...baseOptions,
      scales: {
        x: {
          grid: { display: false },
          ticks: {
            color: COLORS.textSecondary,
            maxTicksLimit: 12,
          },
        },
        y: {
          grid: { color: COLORS.border },
          ticks: {
            color: COLORS.textMuted,
            callback: (val) => formatINR(val),
          },
        },
      },
      plugins: {
        ...baseOptions.plugins,
        tooltip: {
          ...baseOptions.plugins.tooltip,
          callbacks: {
            label: (ctx) => ` ${ctx.dataset.label}: ${formatINR(ctx.parsed.y)}`,
          },
        },
      },
    },
  });
}

/**
 * Render Savings by Module Pie Chart (Sandbox Finance)
 * @param {string} canvasId
 * @param {object} result
 */
export function renderSavingsByModuleChart(canvasId, result) {
  destroyChart(canvasId);
  const ctx = document.getElementById(canvasId)?.getContext('2d');
  if (!ctx) return;

  const modules = Object.values(result.recovery);

  chartInstances[canvasId] = new Chart(ctx, {
    type: 'polarArea',
    data: {
      labels: modules.map(m => m.module),
      datasets: [{
        data: modules.map(m => m.amount),
        backgroundColor: RECOVERY_COLORS.map(c => c + '80'),
        borderColor: RECOVERY_COLORS,
        borderWidth: 2,
      }],
    },
    options: {
      ...baseOptions,
      scales: {
        r: {
          grid: { color: COLORS.border },
          ticks: {
            display: false,
          },
        },
      },
      plugins: {
        ...baseOptions.plugins,
        legend: {
          ...baseOptions.plugins.legend,
          position: 'bottom',
        },
        tooltip: {
          ...baseOptions.plugins.tooltip,
          callbacks: {
            label: (ctx) => ` ${ctx.label}: ${formatINR(ctx.parsed.r)}`,
          },
        },
      },
    },
  });
}

/**
 * Destroy all chart instances
 */
export function destroyAllCharts() {
  Object.keys(chartInstances).forEach(destroyChart);
}
