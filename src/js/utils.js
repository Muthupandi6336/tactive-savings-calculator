/**
 * Tactive Savings Calculator — Utility Functions
 * Currency formatting, number animations, validation
 */

/**
 * Format a number in Indian currency notation
 * @param {number} amount - The amount in Rupees
 * @returns {string} Formatted string like "₹5.25 Crores" or "₹75 Lakhs"
 */
export function formatINR(amount) {
  const abs = Math.abs(amount);
  if (abs >= 10000000) {
    const crores = abs / 10000000;
    return `₹${crores.toFixed(2)} Crores`;
  }
  if (abs >= 100000) {
    const lakhs = abs / 100000;
    return `₹${lakhs.toFixed(2)} Lakhs`;
  }
  if (abs >= 1000) {
    return `₹${(abs / 1000).toFixed(1)}K`;
  }
  return `₹${abs.toFixed(0)}`;
}

/**
 * Format a number with Indian grouping (2,2,3 pattern)
 * @param {number} amount
 * @returns {string} Like "₹50,00,00,000"
 */
export function formatINRFull(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Get display amount and unit separately
 * @param {number} amount
 * @returns {{ value: string, unit: string }}
 */
export function getDisplayAmount(amount) {
  const abs = Math.abs(amount);
  if (abs >= 10000000) {
    return {
      value: (abs / 10000000).toFixed(2),
      unit: 'Crores',
    };
  }
  if (abs >= 100000) {
    return {
      value: (abs / 100000).toFixed(2),
      unit: 'Lakhs',
    };
  }
  return {
    value: abs.toFixed(0),
    unit: 'Rupees',
  };
}

/**
 * Format budget display text while typing
 * @param {number} value - Raw input value
 * @returns {string}
 */
export function formatBudgetDisplay(value) {
  if (!value || value <= 0) return '0 Crores';
  if (value >= 10000000) {
    return `${(value / 10000000).toFixed(2)} Crores`;
  }
  if (value >= 100000) {
    return `${(value / 100000).toFixed(2)} Lakhs`;
  }
  return `₹${value.toLocaleString('en-IN')}`;
}

/**
 * Animate a number counting up
 * @param {HTMLElement} element - Target element
 * @param {number} target - Target number
 * @param {number} duration - Duration in ms
 * @param {function} [formatter] - Optional formatting function
 */
export function animateCountUp(element, target, duration = 2000, formatter = null) {
  const start = 0;
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    // Ease out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = start + (target - start) * eased;

    if (formatter) {
      element.textContent = formatter(current);
    } else {
      element.textContent = current.toFixed(2);
    }

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}

/**
 * Validate form inputs
 * @param {object} data - { budget, duration, laborers }
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateInputs(data) {
  const errors = [];
  const duration = data.duration !== undefined ? data.duration : data.duration_months;
  const laborers = data.laborers !== undefined ? data.laborers : data.num_laborers;

  if (!data.budget || data.budget < 1) {
    errors.push('Budget must be at least ₹1');
  }
  if (!duration || duration < 1 || duration > 120) {
    errors.push('Duration must be between 1 and 120 months');
  }
  if (!laborers || laborers < 1 || laborers > 50000) {
    errors.push('Number of laborers must be between 1 and 50,000');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Show a temporary toast notification
 * @param {string} message
 * @param {string} type - 'success' | 'error' | 'info'
 */
export function showToast(message, type = 'info') {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span>
    <span class="toast-message">${message}</span>
  `;

  // Style inline for simplicity
  Object.assign(toast.style, {
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    zIndex: '9999',
    padding: '12px 20px',
    borderRadius: '12px',
    background: type === 'error' ? 'rgba(239, 68, 68, 0.9)' :
                type === 'success' ? 'rgba(16, 185, 129, 0.9)' :
                'rgba(6, 182, 212, 0.9)',
    color: 'white',
    fontWeight: '600',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
    backdropFilter: 'blur(10px)',
    animation: 'fadeInUp 0.4s ease',
  });

  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = 'fadeIn 0.3s ease reverse';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

/**
 * Delay utility
 * @param {number} ms
 * @returns {Promise}
 */
export function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Debounce function
 * @param {function} func
 * @param {number} wait
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
