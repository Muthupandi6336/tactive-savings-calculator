"""
Tactix Savings Calculation Engine.

Uses industry-standard loss percentages and Tactix module recovery rates
to estimate potential savings for construction projects.
"""

from models import (
    CalculationResult,
    LossBreakdown,
    ProjectInput,
    RecoveryReport,
)

# ---------------------------------------------------------------------------
# Industry-average loss percentages (as fraction of total budget)
# ---------------------------------------------------------------------------
MATERIAL_WASTE_PCT = 0.12        # 12% of budget lost to material wastage
IDLE_MACHINERY_PCT = 0.065       # 6.5% of budget lost to idle machinery
LABOR_INEFFICIENCY_DAILY = 800   # ₹800 per laborer per day lost to inefficiency
LABOR_INEFFICIENCY_PCT = 0.20    # 20% of labor-days are inefficient
SCHEDULE_OVERRUN_PCT = 0.15      # 15% of budget lost to schedule overruns
REWORK_DEFECTS_PCT = 0.07        # 7% of budget lost to rework & defects

# ---------------------------------------------------------------------------
# Tactix module recovery rates (fraction of respective loss recovered)
# ---------------------------------------------------------------------------
MATERIAL_TRACKING_RECOVERY = 0.70    # Material Tracking recovers 70%
EQUIPMENT_ALERTS_RECOVERY = 0.80     # Equipment Alerts recovers 80%
LABOR_DASHBOARD_RECOVERY = 0.60      # Labor Dashboard recovers 60%
SCHEDULE_OPTIMIZER_RECOVERY = 0.50   # Schedule Optimizer recovers 50%
QUALITY_CONTROL_RECOVERY = 0.65      # Quality Control recovers 65%

# ---------------------------------------------------------------------------
# Tactix subscription cost estimate (annual)
# Used to compute payback period.
# ---------------------------------------------------------------------------
TACTIX_ANNUAL_COST_RATIO = 0.015  # ~1.5% of project budget per year


def _round2(value: float) -> float:
    """Round a value to 2 decimal places."""
    return round(value, 2)


def calculate_losses(project: ProjectInput) -> LossBreakdown:
    """
    Calculate the estimated losses for a construction project
    based on industry averages.

    Args:
        project: The project parameters.

    Returns:
        A LossBreakdown with itemised and total losses.
    """
    budget = project.budget
    duration_days = project.duration_months * 30  # approximate days

    material_waste = budget * MATERIAL_WASTE_PCT
    idle_machinery = budget * IDLE_MACHINERY_PCT
    labor_inefficiency = (
        project.num_laborers
        * LABOR_INEFFICIENCY_DAILY
        * duration_days
        * LABOR_INEFFICIENCY_PCT
    )
    schedule_overrun = budget * SCHEDULE_OVERRUN_PCT
    rework_cost = budget * REWORK_DEFECTS_PCT

    total_loss = (
        material_waste
        + idle_machinery
        + labor_inefficiency
        + schedule_overrun
        + rework_cost
    )

    return LossBreakdown(
        material_waste=_round2(material_waste),
        idle_machinery=_round2(idle_machinery),
        labor_inefficiency=_round2(labor_inefficiency),
        schedule_overrun=_round2(schedule_overrun),
        rework_cost=_round2(rework_cost),
        total_loss=_round2(total_loss),
    )


def calculate_recovery(losses: LossBreakdown) -> RecoveryReport:
    """
    Calculate recoverable savings using Tactix modules.

    Args:
        losses: The loss breakdown computed for the project.

    Returns:
        A RecoveryReport with itemised recoveries and ROI.
    """
    material_recovery = losses.material_waste * MATERIAL_TRACKING_RECOVERY
    machinery_recovery = losses.idle_machinery * EQUIPMENT_ALERTS_RECOVERY
    labor_recovery = losses.labor_inefficiency * LABOR_DASHBOARD_RECOVERY
    schedule_recovery = losses.schedule_overrun * SCHEDULE_OPTIMIZER_RECOVERY
    rework_recovery = losses.rework_cost * QUALITY_CONTROL_RECOVERY

    total_recovery = (
        material_recovery
        + machinery_recovery
        + labor_recovery
        + schedule_recovery
        + rework_recovery
    )

    roi_percentage = (
        (total_recovery / losses.total_loss * 100) if losses.total_loss > 0 else 0.0
    )

    return RecoveryReport(
        material_recovery=_round2(material_recovery),
        machinery_recovery=_round2(machinery_recovery),
        labor_recovery=_round2(labor_recovery),
        schedule_recovery=_round2(schedule_recovery),
        rework_recovery=_round2(rework_recovery),
        total_recovery=_round2(total_recovery),
        roi_percentage=_round2(roi_percentage),
    )


def calculate_payback_months(
    project: ProjectInput, total_recovery: float
) -> float:
    """
    Estimate payback period for Tactix subscription.

    The annual subscription cost is approximated as a percentage of
    the project budget. Payback = (annual_cost / 12) months until
    cumulative recovery exceeds cost.

    Args:
        project: The project parameters.
        total_recovery: Total recovery over the project lifetime.

    Returns:
        Payback period in months (capped at project duration).
    """
    annual_cost = project.budget * TACTIX_ANNUAL_COST_RATIO
    monthly_cost = annual_cost / 12
    monthly_recovery = (
        total_recovery / project.duration_months
        if project.duration_months > 0
        else 0
    )

    if monthly_recovery <= monthly_cost:
        return float(project.duration_months)

    # months until cumulative net recovery ≥ 0
    payback = monthly_cost / (monthly_recovery - monthly_cost) if (monthly_recovery - monthly_cost) > 0 else float(project.duration_months)
    return _round2(min(payback, project.duration_months))


def run_calculation(project: ProjectInput) -> CalculationResult:
    """
    Run the full Tactix savings calculation pipeline.

    Args:
        project: The project input parameters.

    Returns:
        Complete CalculationResult with losses, recovery, savings and payback.
    """
    losses = calculate_losses(project)
    recovery = calculate_recovery(losses)
    net_savings = _round2(recovery.total_recovery)
    payback_months = calculate_payback_months(project, recovery.total_recovery)

    return CalculationResult(
        input_data=project,
        loss_breakdown=losses,
        recovery_report=recovery,
        net_savings=net_savings,
        payback_months=payback_months,
    )


# ---------------------------------------------------------------------------
# Indian currency formatting helper
# ---------------------------------------------------------------------------

def format_inr(amount: float) -> str:
    """
    Format an amount in Indian currency notation.

    - Amounts >= 1 Crore  → "₹X.XX Crores"
    - Amounts >= 1 Lakh   → "₹X.XX Lakhs"
    - Otherwise           → "₹X,XXX" with Indian grouping

    Args:
        amount: The amount in INR.

    Returns:
        Human-readable string in Indian notation.
    """
    abs_amount = abs(amount)
    sign = "-" if amount < 0 else ""

    if abs_amount >= 1_00_00_000:  # 1 Crore
        value = abs_amount / 1_00_00_000
        return f"{sign}₹{value:,.2f} Crores"
    elif abs_amount >= 1_00_000:  # 1 Lakh
        value = abs_amount / 1_00_000
        return f"{sign}₹{value:,.2f} Lakhs"
    else:
        # Indian grouping: last 3 digits, then groups of 2
        s = f"{abs_amount:,.2f}"
        return f"{sign}₹{s}"


def format_inr_pdf(amount: float) -> str:
    """
    Format an amount in Indian currency notation for PDF output.

    Uses 'Rs.' instead of '₹' so the text renders correctly with
    fpdf2's built-in Helvetica font (which only supports latin-1).

    Args:
        amount: The amount in INR.

    Returns:
        Human-readable string in Indian notation using 'Rs.'.
    """
    abs_amount = abs(amount)
    sign = "-" if amount < 0 else ""

    if abs_amount >= 1_00_00_000:  # 1 Crore
        value = abs_amount / 1_00_00_000
        return f"{sign}Rs.{value:,.2f} Crores"
    elif abs_amount >= 1_00_000:  # 1 Lakh
        value = abs_amount / 1_00_000
        return f"{sign}Rs.{value:,.2f} Lakhs"
    else:
        s = f"{abs_amount:,.2f}"
        return f"{sign}Rs.{s}"
