"""
Routes: /api/leads

CRUD operations for sales leads captured from the calculator.
"""

from fastapi import APIRouter, HTTPException

from database import save_lead, get_leads
from models import LeadCreate, LeadResponse

router = APIRouter(prefix="/api", tags=["Leads"])


@router.post("/leads", response_model=dict, status_code=201)
async def create_lead(lead: LeadCreate):
    """
    Store a new sales lead.

    Typically called after a user runs a calculation and provides
    their contact information.
    """
    try:
        lead_id = await save_lead(
            name=lead.name,
            email=lead.email,
            phone=lead.phone,
            company=lead.company,
            budget=lead.budget,
            duration_months=lead.duration_months,
            num_laborers=lead.num_laborers,
            total_loss=lead.total_loss,
            total_recovery=lead.total_recovery,
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to save lead: {exc}")

    return {"id": lead_id, "message": "Lead saved successfully", "status": "success"}


@router.get("/leads", response_model=list[LeadResponse])
async def list_leads():
    """
    List all leads (admin endpoint).

    Returns leads in reverse chronological order.
    """
    try:
        leads = await get_leads()
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to fetch leads: {exc}")

    return leads
