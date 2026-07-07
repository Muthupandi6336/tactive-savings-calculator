/**
 * Tactive Savings Calculator — Report Module
 * Dynamically renders the loss/recovery report UI
 */

import { formatINR, animateCountUp, getDisplayAmount } from './utils.js';
import { getLossArray, getRecoveryArray } from './calculator.js';
import {
  renderLossBarChart,
  renderLossDoughnutChart,
  renderComparisonChart,
} from './charts.js';

/**
 * Render the loss breakdown section
 * @param {object} result - Full calculation result
 */
export function renderLossSection(result) {
  const lossArray = getLossArray(result);

  // Animate total loss display
  const totalDisplay = getDisplayAmount(result.summary.totalLoss);
  const amountEl = document.getElementById('total-loss-amount');
  const unitEl = document.getElementById('total-loss-unit');

  if (amountEl && unitEl) {
    unitEl.textContent = totalDisplay.unit;
    animateCountUp(amountEl, parseFloat(totalDisplay.value), 2000, (val) => val.toFixed(2));
  }

  // Generate loss cards
  const container = document.getElementById('loss-cards');
  if (container) {
    container.innerHTML = lossArray.map((loss, index) => {
      const pctOfBudget = loss.percentage.toFixed(1);
      const barWidth = Math.min((loss.amount / result.summary.totalLoss) * 100, 100);

      return `
        <div class="loss-card" style="animation-delay: ${index * 0.12}s">
          <div class="loss-card-icon">${loss.icon}</div>
          <div class="loss-card-title">${loss.label}</div>
          <div class="loss-card-amount">${formatINR(loss.amount)}</div>
          <div class="loss-card-percent">${pctOfBudget}% of your project budget</div>
          <div class="loss-card-bar">
            <div class="loss-card-bar-fill" style="width: ${barWidth}%; animation-delay: ${0.5 + index * 0.15}s"></div>
          </div>
        </div>
      `;
    }).join('');
  }

  // Render charts
  renderLossBarChart('loss-bar-chart', lossArray);
  renderLossDoughnutChart('loss-doughnut-chart', lossArray, result.input.budget);
}

/**
 * Render the solution/recovery section
 * @param {object} result - Full calculation result
 */
export function renderSolutionSection(result) {
  const recoveryArray = getRecoveryArray(result);

  // Animate recovery display
  const recoveryDisplay = getDisplayAmount(result.summary.totalRecovery);
  const amountEl = document.getElementById('total-recovery-amount');
  const unitEl = document.getElementById('total-recovery-unit');

  if (amountEl && unitEl) {
    unitEl.textContent = recoveryDisplay.unit;
    animateCountUp(amountEl, parseFloat(recoveryDisplay.value), 2000, (val) => val.toFixed(2));
  }

  // Generate module cards
  const container = document.getElementById('module-cards');
  if (container) {
    container.innerHTML = recoveryArray.map((mod, index) => `
      <div class="module-card" style="animation-delay: ${index * 0.12}s">
        <div class="module-card-icon">${mod.icon}</div>
        <div class="module-card-title">${mod.module}</div>
        <div class="module-card-description">${mod.description}</div>
        <div class="module-card-savings">
          <div>
            <div class="module-card-savings-label">Recoverable Amount</div>
            <div class="module-card-savings-amount">${formatINR(mod.amount)}</div>
          </div>
        </div>
        <div class="module-card-recovery">${mod.rate}% recovery rate</div>
      </div>
    `).join('');
  }

  // Render comparison chart
  renderComparisonChart('comparison-chart', result);

  // ROI Summary
  const roiEl = document.getElementById('roi-percentage');
  const paybackEl = document.getElementById('payback-months');
  const netEl = document.getElementById('net-savings');

  if (roiEl) {
    animateCountUp(roiEl, result.summary.roiPercentage, 1500, (val) => `${val.toFixed(0)}%`);
  }
  if (paybackEl) {
    animateCountUp(paybackEl, result.summary.paybackMonths, 1500, (val) => {
      const months = Math.ceil(val);
      return months <= 1 ? '< 1 month' : `${months} months`;
    });
  }
  if (netEl) {
    animateCountUp(netEl, result.summary.netSavings, 1500, (val) => formatINR(val));
  }
}
