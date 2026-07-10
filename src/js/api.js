/**
 * Tactix Savings Calculator — API Client
 * Communicates with FastAPI backend
 */

const API_BASE = '/api';

/**
 * Submit project data for calculation
 * @param {object} data - { budget, duration_months, num_laborers }
 * @returns {Promise<object>}
 */
export async function submitCalculation(data) {
  try {
    const response = await fetch(`${API_BASE}/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.warn('Backend unavailable, using client-side calculation:', error.message);
    return null; // Fallback to client-side calculation
  }
}

/**
 * Submit lead information
 * @param {object} lead - { name, email, phone, company, budget, duration_months, num_laborers }
 * @returns {Promise<object>}
 */
export async function submitLead(lead) {
  try {
    const response = await fetch(`${API_BASE}/leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(lead),
    });
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.warn('Could not save lead:', error.message);
    return null;
  }
}

/**
 * Request PDF report download
 * @param {object} data - Project input data
 * @returns {Promise<Blob|null>}
 */
export async function downloadPDFReport(data) {
  try {
    const response = await fetch(`${API_BASE}/report/pdf`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    return await response.blob();
  } catch (error) {
    console.warn('PDF generation failed:', error.message);
    return null;
  }
}

/**
 * Request email report
 * @param {object} data - { ...projectData, email, name }
 * @returns {Promise<object|null>}
 */
export async function emailReport(data) {
  try {
    const response = await fetch(`${API_BASE}/report/email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.warn('Email report failed:', error.message);
    return null;
  }
}
