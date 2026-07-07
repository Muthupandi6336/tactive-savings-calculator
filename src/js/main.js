/**
 * Tactive Savings Calculator — Main Application Controller
 * Orchestrates the multi-step flow: Input → Results → Solution → Sandbox
 */

import { calculateLosses } from './calculator.js';
import { renderLossSection, renderSolutionSection } from './report.js';
import { initSandbox } from './sandbox.js';
import { submitCalculation, submitLead, downloadPDFReport } from './api.js';
import { generateClientPDF } from './pdf_client.js';
import {
  validateInputs,
  formatBudgetDisplay,
  showToast,
  delay,
  debounce,
} from './utils.js';

// ── State ──
let currentStep = 0;
let calculationResult = null;

// ── DOM References ──
const sections = document.querySelectorAll('.section');
const stepIndicators = document.querySelectorAll('.step-indicator');
const loadingOverlay = document.getElementById('loading-overlay');

// ── Initialize App ──
document.addEventListener('DOMContentLoaded', () => {
  setupForm();
  setupNavigation();
  setupBudgetPreview();
  console.log('🚀 Tactive Savings Calculator initialized');
});

/**
 * Setup the calculator form
 */
function setupForm() {
  const form = document.getElementById('calculator-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const budget = parseFloat(document.getElementById('budget').value);
    const duration = parseInt(document.getElementById('duration').value);
    const laborers = parseInt(document.getElementById('laborers').value);

    const input = {
      budget,
      duration_months: duration,
      num_laborers: laborers,
    };

    // Validate
    const validation = validateInputs(input);
    if (!validation.valid) {
      showToast(validation.errors[0], 'error');
      return;
    }

    // Show loading
    showLoading(true);

    // Try backend first, fall back to client-side
    try {
      const apiResult = await submitCalculation(input);
      // Always use client-side for instant response
      calculationResult = calculateLosses(input);

      await delay(1500); // Brief pause for effect
      showLoading(false);

      // Render results and navigate
      renderLossSection(calculationResult);
      navigateToStep(1);
    } catch (error) {
      calculationResult = calculateLosses(input);
      showLoading(false);
      renderLossSection(calculationResult);
      navigateToStep(1);
    }
  });
}

/**
 * Setup navigation buttons
 */
function setupNavigation() {
  // "See Solution" button
  const solutionBtn = document.getElementById('see-solution-btn');
  if (solutionBtn) {
    solutionBtn.addEventListener('click', () => {
      if (calculationResult) {
        renderSolutionSection(calculationResult);
        navigateToStep(2);
      }
    });
  }

  // "Skip to Sandbox" button
  const skipBtn = document.getElementById('skip-to-sandbox-btn');
  if (skipBtn) {
    skipBtn.addEventListener('click', () => {
      if (calculationResult) {
        initSandbox(calculationResult);
        navigateToStep(3);
      }
    });
  }

  // Lead form submission
  const leadForm = document.getElementById('lead-form');
  if (leadForm) {
    leadForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const leadData = {
        name: document.getElementById('lead-name').value,
        email: document.getElementById('lead-email').value,
        phone: document.getElementById('lead-phone').value,
        company: document.getElementById('lead-company').value,
        budget: calculationResult?.input.budget,
        duration_months: calculationResult?.input.duration_months,
        num_laborers: calculationResult?.input.num_laborers,
      };

      // Save lead
      submitLead(leadData);

      // Download PDF
      showToast('Generating your report...', 'info');
      let pdfBlob = await downloadPDFReport({
        budget: leadData.budget,
        duration_months: leadData.duration_months,
        num_laborers: leadData.num_laborers,
        name: leadData.name,
        email: leadData.email,
      });

      if (!pdfBlob) {
        // Fallback to client-side PDF generation
        try {
          pdfBlob = generateClientPDF(calculationResult, leadData);
        } catch (err) {
          console.error('Client-side PDF generation failed:', err);
        }
      }

      if (pdfBlob) {
        // Create download link
        const url = URL.createObjectURL(pdfBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Tactive-Savings-Report.pdf';
        a.click();
        URL.revokeObjectURL(url);
        showToast('Report downloaded successfully!', 'success');
      } else {
        showToast('PDF generation failed. Proceeding to sandbox.', 'warning');
      }

      // Navigate to sandbox
      if (calculationResult) {
        initSandbox(calculationResult);
        navigateToStep(3);
      }
    });
  }

  // "Restart" button
  const restartBtn = document.getElementById('restart-btn');
  if (restartBtn) {
    restartBtn.addEventListener('click', () => {
      calculationResult = null;
      document.getElementById('calculator-form')?.reset();
      document.getElementById('budget-display').textContent = '0 Crores';
      navigateToStep(0);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // "Schedule Demo" button
  const demoBtn = document.getElementById('schedule-demo-btn');
  if (demoBtn) {
    demoBtn.addEventListener('click', (e) => {
      e.preventDefault();
      showToast('Demo scheduling coming soon! Contact us at hello@tactive.in', 'info');
    });
  }
}

/**
 * Setup live budget display preview
 */
function setupBudgetPreview() {
  const budgetInput = document.getElementById('budget');
  const budgetDisplay = document.getElementById('budget-display');

  if (budgetInput && budgetDisplay) {
    const updateDisplay = debounce(() => {
      const value = parseFloat(budgetInput.value) || 0;
      budgetDisplay.textContent = formatBudgetDisplay(value);
    }, 100);

    budgetInput.addEventListener('input', updateDisplay);
  }
}

/**
 * Navigate to a specific step
 * @param {number} step - Step index (0-3)
 */
function navigateToStep(step) {
  currentStep = step;

  // Update sections visibility
  sections.forEach(section => {
    const sectionStep = parseInt(section.dataset.step);
    if (sectionStep === step) {
      section.classList.add('active');
      // Scroll to section
      setTimeout(() => {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } else {
      section.classList.remove('active');
    }
  });

  // Update step indicators
  stepIndicators.forEach(indicator => {
    const indicatorStep = parseInt(indicator.dataset.step);
    indicator.classList.remove('active', 'completed');

    if (indicatorStep === step) {
      indicator.classList.add('active');
    } else if (indicatorStep < step) {
      indicator.classList.add('completed');
    }
  });
}

/**
 * Show/hide loading overlay
 * @param {boolean} show
 */
function showLoading(show) {
  if (loadingOverlay) {
    if (show) {
      loadingOverlay.classList.add('active');
    } else {
      loadingOverlay.classList.remove('active');
    }
  }
}
