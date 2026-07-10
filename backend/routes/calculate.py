"""
Route: /api/calculate

Accepts project parameters and returns a full loss/recovery calculation.
"""

from fastapi import APIRouter, HTTPException

from calculator import run_calculation
from database import log_calculation
from models import CalculationResult, ProjectInput

router = APIRouter(prefix="/api", tags=["Calculate"])


@router.post("/calculate", response_model=CalculationResult)
async def calculate(project: ProjectInput) -> CalculationResult:
    """
    Run the Tactix savings calculation.

    Accepts project budget, duration, and laborer count; returns a detailed
    breakdown of estimated losses, Tactix recoveries, net savings, and
    the projected payback period.
    """
    try:
        result = run_calculation(project)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Calculation error: {exc}")

    # Log the calculation asynchronously (fire-and-forget for the client)
    try:
        await log_calculation(
            budget=project.budget,
            duration_months=project.duration_months,
            num_laborers=project.num_laborers,
            total_loss=result.loss_breakdown.total_loss,
            total_recovery=result.recovery_report.total_recovery,
            net_savings=result.net_savings,
            payback_months=result.payback_months,
        )
    except Exception:
        # Don't fail the request if logging fails
        pass

    return result
