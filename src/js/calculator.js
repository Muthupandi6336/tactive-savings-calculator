/**
 * Tactive Savings Calculator — Calculation Engine
 * Industry-average loss formulas and Tactive recovery rates
 */

// ── Industry Loss Rates ──
const LOSS_RATES = {
  materialWaste: 0.12,        // 12% of budget
  idleMachinery: 0.065,       // 6.5% of budget
  laborInefficiency: 0.20,    // 20% of labor cost
  scheduleOverrun: 0.15,      // 15% of budget
  reworkDefects: 0.07,        // 7% of budget
};

// ── Tactive Recovery Rates ──
const RECOVERY_RATES = {
  materialTracking: 0.70,     // Recovers 70% of material waste
  equipmentAlerts: 0.80,      // Recovers 80% of idle machinery cost
  laborDashboard: 0.60,       // Recovers 60% of labor inefficiency
  scheduleOptimizer: 0.50,    // Recovers 50% of schedule overrun
  qualityControl: 0.65,       // Recovers 65% of rework cost
};

// ── Constants ──
const AVG_DAILY_WAGE = 800;   // ₹800 per laborer per day (Indian avg)
const WORKING_DAYS_PER_MONTH = 26;
const TACTIVE_MONTHLY_COST_PER_CRORE = 15000; // ₹15,000 per crore of budget per month

/**
 * Calculate all losses based on project inputs
 * @param {object} input - { budget, duration_months, num_laborers }
 * @returns {object} Full calculation result
 */
export function calculateLosses(input) {
  const { budget, duration_months, num_laborers } = input;

  // ── Calculate Individual Losses ──
  const materialWaste = budget * LOSS_RATES.materialWaste;
  const idleMachinery = budget * LOSS_RATES.idleMachinery;

  // Labor inefficiency = laborers × daily wage × working days × duration × inefficiency rate
  const totalLaborCost = num_laborers * AVG_DAILY_WAGE * WORKING_DAYS_PER_MONTH * duration_months;
  const laborInefficiency = totalLaborCost * LOSS_RATES.laborInefficiency;

  const scheduleOverrun = budget * LOSS_RATES.scheduleOverrun;
  const reworkDefects = budget * LOSS_RATES.reworkDefects;

  const totalLoss = materialWaste + idleMachinery + laborInefficiency + scheduleOverrun + reworkDefects;

  // ── Calculate Tactive Recovery ──
  const materialRecovery = materialWaste * RECOVERY_RATES.materialTracking;
  const machineryRecovery = idleMachinery * RECOVERY_RATES.equipmentAlerts;
  const laborRecovery = laborInefficiency * RECOVERY_RATES.laborDashboard;
  const scheduleRecovery = scheduleOverrun * RECOVERY_RATES.scheduleOptimizer;
  const reworkRecovery = reworkDefects * RECOVERY_RATES.qualityControl;

  const totalRecovery = materialRecovery + machineryRecovery + laborRecovery + scheduleRecovery + reworkRecovery;

  // ── ROI Calculation ──
  const tactiveCost = (budget / 10000000) * TACTIVE_MONTHLY_COST_PER_CRORE * duration_months;
  const netSavings = totalRecovery - tactiveCost;
  const roiPercentage = tactiveCost > 0 ? ((netSavings / tactiveCost) * 100) : 0;
  const monthlySavings = totalRecovery / duration_months;
  const paybackMonths = monthlySavings > 0 ? Math.ceil(tactiveCost / monthlySavings) : 0;

  return {
    input: { budget, duration_months, num_laborers },

    losses: {
      materialWaste: {
        amount: materialWaste,
        percentage: LOSS_RATES.materialWaste * 100,
        label: 'Material Wastage',
        icon: '📦',
        description: 'Excess ordering, theft, damage, and poor inventory management',
      },
      idleMachinery: {
        amount: idleMachinery,
        percentage: LOSS_RATES.idleMachinery * 100,
        label: 'Idle Machinery',
        icon: '🏗️',
        description: 'Equipment sitting unused due to poor scheduling and maintenance',
      },
      laborInefficiency: {
        amount: laborInefficiency,
        percentage: ((laborInefficiency / budget) * 100),
        label: 'Labor Inefficiency',
        icon: '👷',
        description: 'Idle time, over-staffing, lack of productivity tracking',
      },
      scheduleOverrun: {
        amount: scheduleOverrun,
        percentage: LOSS_RATES.scheduleOverrun * 100,
        label: 'Schedule Overruns',
        icon: '⏰',
        description: 'Delays cascading across project phases and milestones',
      },
      reworkDefects: {
        amount: reworkDefects,
        percentage: LOSS_RATES.reworkDefects * 100,
        label: 'Rework & Defects',
        icon: '🔧',
        description: 'Quality issues requiring demolition and reconstruction',
      },
    },

    recovery: {
      materialTracking: {
        amount: materialRecovery,
        rate: RECOVERY_RATES.materialTracking * 100,
        module: 'Material Tracking',
        icon: '📦',
        description: 'Real-time inventory monitoring, automated reorder alerts, and wastage detection',
      },
      equipmentAlerts: {
        amount: machineryRecovery,
        rate: RECOVERY_RATES.equipmentAlerts * 100,
        module: 'Equipment Alert System',
        icon: '🏗️',
        description: 'Utilization tracking, predictive maintenance, and idle equipment reassignment',
      },
      laborDashboard: {
        amount: laborRecovery,
        rate: RECOVERY_RATES.laborDashboard * 100,
        module: 'Labor Productivity Dashboard',
        icon: '👷',
        description: 'Attendance tracking, zone-wise productivity scoring, and workforce optimization',
      },
      scheduleOptimizer: {
        amount: scheduleRecovery,
        rate: RECOVERY_RATES.scheduleOptimizer * 100,
        module: 'Schedule Optimizer',
        icon: '📅',
        description: 'AI-powered scheduling, critical path analysis, and delay prediction',
      },
      qualityControl: {
        amount: reworkRecovery,
        rate: RECOVERY_RATES.qualityControl * 100,
        module: 'Quality Control Monitor',
        icon: '✅',
        description: 'Inspection checklists, defect tracking, and compliance reporting',
      },
    },

    summary: {
      totalLoss,
      totalRecovery,
      tactiveCost,
      netSavings,
      roiPercentage,
      monthlySavings,
      paybackMonths,
      totalLaborCost,
    },
  };
}

/**
 * Get loss categories as array for chart rendering
 * @param {object} result - Output from calculateLosses
 * @returns {Array}
 */
export function getLossArray(result) {
  return Object.values(result.losses).map(loss => ({
    label: loss.label,
    amount: loss.amount,
    percentage: loss.percentage,
    icon: loss.icon,
  }));
}

/**
 * Get recovery modules as array
 * @param {object} result - Output from calculateLosses
 * @returns {Array}
 */
export function getRecoveryArray(result) {
  return Object.values(result.recovery).map(rec => ({
    module: rec.module,
    amount: rec.amount,
    rate: rec.rate,
    icon: rec.icon,
    description: rec.description,
  }));
}
