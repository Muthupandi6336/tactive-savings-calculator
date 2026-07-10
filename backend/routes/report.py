"""
Routes: /api/report/pdf and /api/report/email

Generate PDF savings reports and optionally email them to the user.
"""

import logging

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
import io

from calculator import run_calculation
from email_service import get_email_service
from models import ProjectInput
from pdf_generator import generate_pdf

logger = logging.getLogger("tactix.routes.report")
router = APIRouter(prefix="/api/report", tags=["Report"])


@router.post("/pdf")
async def download_pdf(project: ProjectInput):
    """
    Generate a PDF savings report and return it as a downloadable file.

    The report contains an executive summary, loss breakdown, recovery
    plan, and ROI analysis based on the supplied project parameters.
    """
    try:
        result = run_calculation(project)
        pdf_bytes = generate_pdf(result)
    except Exception as exc:
        logger.exception("PDF generation failed")
        raise HTTPException(status_code=500, detail=f"PDF generation error: {exc}")

    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={
            "Content-Disposition": "attachment; filename=Tactix_Savings_Report.pdf"
        },
    )


@router.post("/email")
async def email_report(project: ProjectInput):
    """
    Generate a PDF savings report and email it to the user.

    Requires `email` and `name` fields in the project input.
    In development mode (EMAIL_MODE=mock), the email is logged
    to the console instead of being sent.
    """
    if not project.email:
        raise HTTPException(
            status_code=400, detail="Email address is required to send a report."
        )
    if not project.name:
        raise HTTPException(
            status_code=400, detail="Name is required to personalise the email."
        )

    try:
        result = run_calculation(project)
        pdf_bytes = generate_pdf(result)
    except Exception as exc:
        logger.exception("PDF generation failed")
        raise HTTPException(status_code=500, detail=f"Report generation error: {exc}")

    email_service = get_email_service()
    success = await email_service.send_report_email(
        to_email=project.email,
        name=project.name,
        pdf_bytes=pdf_bytes,
    )

    if not success:
        raise HTTPException(status_code=500, detail="Failed to send email.")

    return {
        "message": f"Report sent to {project.email}",
        "status": "success",
    }
