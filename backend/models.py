"""
Pydantic models for the Tactive Savings Calculator.

Defines request/response schemas for calculations, reports, and lead management.
"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field


class ProjectInput(BaseModel):
    """Input parameters describing a construction project."""

    budget: float = Field(..., gt=0, description="Total project budget in INR")
    duration_months: int = Field(..., gt=0, le=120, description="Project duration in months")
    num_laborers: int = Field(..., gt=0, description="Number of laborers on-site")
    name: Optional[str] = Field(None, max_length=100, description="Contact person name")
    email: Optional[str] = Field(None, max_length=255, description="Contact email address")
    phone: Optional[str] = Field(None, max_length=20, description="Contact phone number")
    company: Optional[str] = Field(None, max_length=200, description="Company name")


class LossBreakdown(BaseModel):
    """Breakdown of estimated losses without Tactive."""

    material_waste: float = Field(..., description="Loss due to material wastage (INR)")
    idle_machinery: float = Field(..., description="Loss due to idle machinery (INR)")
    labor_inefficiency: float = Field(..., description="Loss due to labor inefficiency (INR)")
    schedule_overrun: float = Field(..., description="Loss due to schedule overruns (INR)")
    rework_cost: float = Field(..., description="Loss due to rework and defects (INR)")
    total_loss: float = Field(..., description="Total estimated loss (INR)")


class RecoveryReport(BaseModel):
    """Breakdown of recoverable savings with Tactive modules."""

    material_recovery: float = Field(..., description="Recovery via Material Tracking module (INR)")
    machinery_recovery: float = Field(..., description="Recovery via Equipment Alerts module (INR)")
    labor_recovery: float = Field(..., description="Recovery via Labor Dashboard module (INR)")
    schedule_recovery: float = Field(..., description="Recovery via Schedule Optimizer module (INR)")
    rework_recovery: float = Field(..., description="Recovery via Quality Control module (INR)")
    total_recovery: float = Field(..., description="Total recoverable savings (INR)")
    roi_percentage: float = Field(..., description="Return on Investment percentage")


class CalculationResult(BaseModel):
    """Complete calculation result with losses, recoveries, and summary."""

    input_data: ProjectInput
    loss_breakdown: LossBreakdown
    recovery_report: RecoveryReport
    net_savings: float = Field(..., description="Net savings after Tactive implementation (INR)")
    payback_months: float = Field(..., description="Estimated payback period in months")


class LeadCreate(BaseModel):
    """Schema for creating a new sales lead."""

    name: str = Field(..., min_length=1, max_length=100)
    email: str = Field(..., min_length=5, max_length=255)
    phone: Optional[str] = Field(None, max_length=20)
    company: Optional[str] = Field(None, max_length=200)
    budget: float = Field(..., gt=0)
    duration_months: int = Field(..., gt=0)
    num_laborers: int = Field(..., gt=0)
    total_loss: float = Field(default=0.0)
    total_recovery: float = Field(default=0.0)


class LeadResponse(BaseModel):
    """Schema for lead data returned from the API."""

    id: int
    name: str
    email: str
    phone: Optional[str] = None
    company: Optional[str] = None
    budget: float
    duration_months: int
    num_laborers: int
    total_loss: float
    total_recovery: float
    created_at: str
