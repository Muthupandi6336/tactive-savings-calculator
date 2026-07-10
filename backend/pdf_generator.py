"""
PDF report generator for Tactix Savings Calculator.

Uses fpdf2 to produce a professional, branded PDF report with:
  - Executive summary
  - Loss breakdown table
  - Recovery plan by Tactix module
  - ROI summary
All currency values are formatted in Indian notation (₹ Crores / Lakhs).
"""

import io
from datetime import datetime

from fpdf import FPDF

from calculator import format_inr_pdf as format_inr
from models import CalculationResult


# ---------------------------------------------------------------------------
# Colour palette
# ---------------------------------------------------------------------------
_DARK_BLUE = (10, 36, 99)
_MEDIUM_BLUE = (30, 80, 162)
_LIGHT_BLUE = (220, 232, 252)
_WHITE = (255, 255, 255)
_BLACK = (33, 33, 33)
_GREEN = (34, 139, 34)
_RED = (200, 40, 40)
_GREY_BG = (245, 245, 245)


class TactixReport(FPDF):
    """Custom FPDF subclass with Tactix branding."""

    def header(self):
        """Draw the page header with a dark-blue banner."""
        self.set_fill_color(*_DARK_BLUE)
        self.rect(0, 0, 210, 28, "F")
        self.set_font("Helvetica", "B", 18)
        self.set_text_color(*_WHITE)
        self.set_y(6)
        self.cell(0, 10, "Tactix Savings Report", align="C", new_x="LMARGIN", new_y="NEXT")
        self.set_font("Helvetica", "", 9)
        self.cell(0, 6, f"Generated on {datetime.now().strftime('%d %B %Y, %I:%M %p')}", align="C", new_x="LMARGIN", new_y="NEXT")
        self.ln(10)

    def footer(self):
        """Draw page footer with page number."""
        self.set_y(-15)
        self.set_font("Helvetica", "I", 8)
        self.set_text_color(128, 128, 128)
        self.cell(0, 10, f"Page {self.page_no()}/{{nb}}  |  Confidential - Tactix Technologies", align="C")

    def section_title(self, title: str):
        """Render a styled section heading."""
        self.set_font("Helvetica", "B", 13)
        self.set_text_color(*_DARK_BLUE)
        self.cell(0, 10, title, new_x="LMARGIN", new_y="NEXT")
        # Underline
        self.set_draw_color(*_MEDIUM_BLUE)
        self.set_line_width(0.6)
        self.line(self.l_margin, self.get_y(), 210 - self.r_margin, self.get_y())
        self.ln(4)

    def key_value_row(self, key: str, value: str, fill: bool = False):
        """Render a key-value row, optionally with a grey background."""
        if fill:
            self.set_fill_color(*_GREY_BG)
        self.set_font("Helvetica", "", 10)
        self.set_text_color(*_BLACK)
        self.cell(90, 8, f"  {key}", border=0, fill=fill)
        self.set_font("Helvetica", "B", 10)
        self.cell(0, 8, value, border=0, fill=fill, new_x="LMARGIN", new_y="NEXT")


def generate_pdf(result: CalculationResult) -> bytes:
    """
    Generate a professional PDF savings report.

    Args:
        result: The complete calculation result.

    Returns:
        The PDF document as bytes.
    """
    pdf = TactixReport()
    pdf.alias_nb_pages()
    pdf.set_auto_page_break(auto=True, margin=20)
    pdf.add_page()

    inp = result.input_data
    losses = result.loss_breakdown
    recovery = result.recovery_report

    # ------------------------------------------------------------------
    # 1. Executive Summary
    # ------------------------------------------------------------------
    pdf.section_title("Executive Summary")
    pdf.set_font("Helvetica", "", 10)
    pdf.set_text_color(*_BLACK)

    company_str = inp.company or "your company"
    pdf.multi_cell(
        0,
        6,
        f"Based on a project budget of {format_inr(inp.budget)} over "
        f"{inp.duration_months} months with {inp.num_laborers} laborers, "
        f"{company_str} is estimated to face potential losses of "
        f"{format_inr(losses.total_loss)}. With Tactix's smart construction "
        f"management platform, up to {format_inr(recovery.total_recovery)} can "
        f"be recovered - an ROI of {recovery.roi_percentage:.1f}%.",
    )
    pdf.ln(6)

    # Highlight boxes
    box_y = pdf.get_y()
    _summary_box(pdf, "Total Estimated Loss", format_inr(losses.total_loss), _RED)
    _summary_box(pdf, "Recoverable with Tactix", format_inr(recovery.total_recovery), _GREEN)
    _summary_box(pdf, "Payback Period", f"{result.payback_months:.1f} months", _MEDIUM_BLUE)
    pdf.set_y(box_y + 18 + 8)

    # ------------------------------------------------------------------
    # 2. Loss Breakdown
    # ------------------------------------------------------------------
    pdf.section_title("Loss Breakdown (Industry Averages)")

    loss_rows = [
        ("Material Wastage (12% of budget)", format_inr(losses.material_waste)),
        ("Idle Machinery (6.5% of budget)", format_inr(losses.idle_machinery)),
        ("Labor Inefficiency (per laborer/day)", format_inr(losses.labor_inefficiency)),
        ("Schedule Overruns (15% of budget)", format_inr(losses.schedule_overrun)),
        ("Rework & Defects (7% of budget)", format_inr(losses.rework_cost)),
    ]
    for i, (label, val) in enumerate(loss_rows):
        pdf.key_value_row(label, val, fill=(i % 2 == 0))

    # Total row
    pdf.set_font("Helvetica", "B", 11)
    pdf.set_text_color(*_RED)
    pdf.cell(90, 10, "  TOTAL ESTIMATED LOSS", border="T")
    pdf.cell(0, 10, format_inr(losses.total_loss), border="T", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(6)

    # ------------------------------------------------------------------
    # 3. Recovery Plan by Tactix Module
    # ------------------------------------------------------------------
    pdf.section_title("Recovery Plan - Tactix Modules")

    recovery_rows = [
        ("Material Tracking (70% recovery)", format_inr(recovery.material_recovery)),
        ("Equipment Alerts (80% recovery)", format_inr(recovery.machinery_recovery)),
        ("Labor Dashboard (60% recovery)", format_inr(recovery.labor_recovery)),
        ("Schedule Optimizer (50% recovery)", format_inr(recovery.schedule_recovery)),
        ("Quality Control (65% recovery)", format_inr(recovery.rework_recovery)),
    ]
    for i, (label, val) in enumerate(recovery_rows):
        pdf.key_value_row(label, val, fill=(i % 2 == 0))

    # Total row
    pdf.set_font("Helvetica", "B", 11)
    pdf.set_text_color(*_GREEN)
    pdf.cell(90, 10, "  TOTAL RECOVERABLE SAVINGS", border="T")
    pdf.cell(0, 10, format_inr(recovery.total_recovery), border="T", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(6)

    # ------------------------------------------------------------------
    # 4. ROI Summary
    # ------------------------------------------------------------------
    pdf.section_title("ROI Summary")
    pdf.key_value_row("Net Savings", format_inr(result.net_savings), fill=True)
    pdf.key_value_row("ROI", f"{recovery.roi_percentage:.1f}%", fill=False)
    pdf.key_value_row("Payback Period", f"{result.payback_months:.1f} months", fill=True)
    pdf.ln(8)

    # ------------------------------------------------------------------
    # 5. Project Parameters
    # ------------------------------------------------------------------
    pdf.section_title("Project Parameters")
    pdf.key_value_row("Budget", format_inr(inp.budget), fill=True)
    pdf.key_value_row("Duration", f"{inp.duration_months} months", fill=False)
    pdf.key_value_row("Laborers", str(inp.num_laborers), fill=True)
    if inp.company:
        pdf.key_value_row("Company", inp.company, fill=False)
    if inp.name:
        pdf.key_value_row("Contact", inp.name, fill=True)
    if inp.email:
        pdf.key_value_row("Email", inp.email, fill=False)
    pdf.ln(6)

    # ------------------------------------------------------------------
    # Disclaimer
    # ------------------------------------------------------------------
    pdf.set_font("Helvetica", "I", 8)
    pdf.set_text_color(120, 120, 120)
    pdf.multi_cell(
        0,
        5,
        "Disclaimer: These estimates are based on industry-average loss percentages "
        "and Tactix's observed recovery rates across projects. Actual results may "
        "vary depending on project specifics, adoption, and implementation scope.",
    )

    # Return bytes
    return pdf.output()


def _summary_box(pdf: TactixReport, label: str, value: str, color: tuple):
    """Draw a small coloured summary box."""
    x = pdf.get_x()
    y = pdf.get_y()
    box_w = 58
    box_h = 18

    # Background
    pdf.set_fill_color(*color)
    pdf.rect(x, y, box_w, box_h, "F")

    # Label
    pdf.set_xy(x, y + 2)
    pdf.set_font("Helvetica", "", 8)
    pdf.set_text_color(*_WHITE)
    pdf.cell(box_w, 5, label, align="C")

    # Value
    pdf.set_xy(x, y + 8)
    pdf.set_font("Helvetica", "B", 11)
    pdf.cell(box_w, 8, value, align="C")

    # Move cursor past this box
    pdf.set_xy(x + box_w + 4, y)
