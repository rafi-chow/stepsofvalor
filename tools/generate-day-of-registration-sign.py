#!/usr/bin/env python3
"""Generate the print-ready Steps of Valor day-of registration QR sign."""

from pathlib import Path

from reportlab.graphics import renderPDF
from reportlab.graphics.barcode.qr import QrCodeWidget
from reportlab.graphics.shapes import Drawing
from reportlab.lib.colors import HexColor, white
from reportlab.lib.pagesizes import letter
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase.pdfmetrics import stringWidth
from reportlab.pdfgen import canvas


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "output" / "pdf" / "steps-of-valor-day-of-registration-qr-sign.pdf"
LOGO = ROOT / "assets" / "images" / "steps-of-valor-emblem-transparent.png"
REGISTRATION_URL = "https://www.stepsofvalor.org/register?source=day-of"

NAVY = HexColor("#071B2E")
DEEP_RED = HexColor("#B12134")
GOLD = HexColor("#D9A43D")
MUTED = HexColor("#526175")
SOFT = HexColor("#F4F7FA")
LINE = HexColor("#D9E1EA")


def centered_text(pdf, text, y, font, size, color=NAVY):
    pdf.setFont(font, size)
    pdf.setFillColor(color)
    pdf.drawCentredString(letter[0] / 2, y, text)


def draw_qr(pdf, url, x, y, size):
    widget = QrCodeWidget(url)
    bounds = widget.getBounds()
    width = bounds[2] - bounds[0]
    height = bounds[3] - bounds[1]
    drawing = Drawing(size, size, transform=[size / width, 0, 0, size / height, 0, 0])
    drawing.add(widget)
    renderPDF.draw(drawing, pdf, x, y)


def fit_centered_text(pdf, text, y, max_width, font="Helvetica-Bold", max_size=13, min_size=9):
    size = max_size
    while size > min_size and stringWidth(text, font, size) > max_width:
        size -= 0.5
    centered_text(pdf, text, y, font, size, MUTED)


def build_sign():
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    width, height = letter
    pdf = canvas.Canvas(str(OUTPUT), pagesize=letter)
    pdf.setTitle("Steps of Valor Day-of Registration QR Sign")
    pdf.setAuthor("Steps of Valor")
    pdf.setSubject("Printable event-day registration and check-in sign")

    # Header band and emblem
    pdf.setFillColor(NAVY)
    pdf.rect(0, height - 122, width, 122, fill=1, stroke=0)
    pdf.setFillColor(DEEP_RED)
    pdf.rect(0, height - 127, width, 5, fill=1, stroke=0)
    pdf.drawImage(ImageReader(str(LOGO)), 42, height - 103, width=74, height=74, mask="auto")
    pdf.setFillColor(white)
    pdf.setFont("Helvetica-Bold", 25)
    pdf.drawString(132, height - 61, "STEPS OF VALOR")
    pdf.setFont("Helvetica", 13)
    pdf.drawString(133, height - 84, "2026 9/11 Memorial Stair Climb")

    centered_text(pdf, "DAY-OF REGISTRATION", height - 172, "Helvetica-Bold", 15, DEEP_RED)
    centered_text(pdf, "Scan to register and check in", height - 198, "Helvetica-Bold", 26)
    centered_text(pdf, "Complete both required steps before joining the climb.", height - 222, "Helvetica", 12, MUTED)

    # QR card
    card_x, card_y, card_w, card_h = 104, 278, 404, 280
    pdf.setFillColor(SOFT)
    pdf.setStrokeColor(LINE)
    pdf.setLineWidth(1)
    pdf.roundRect(card_x, card_y, card_w, card_h, 18, fill=1, stroke=1)
    qr_size = 238
    qr_x = (width - qr_size) / 2
    qr_y = card_y + 29
    pdf.setFillColor(white)
    pdf.roundRect(qr_x - 12, qr_y - 12, qr_size + 24, qr_size + 24, 12, fill=1, stroke=0)
    draw_qr(pdf, REGISTRATION_URL, qr_x, qr_y, qr_size)

    fit_centered_text(pdf, "stepsofvalor.org/register", 255, 420, max_size=13)

    # Two-step reminder
    box_y = 152
    pdf.setFillColor(white)
    pdf.setStrokeColor(LINE)
    pdf.roundRect(54, box_y, width - 108, 82, 14, fill=1, stroke=1)
    pdf.setFillColor(DEEP_RED)
    pdf.circle(82, box_y + 54, 14, fill=1, stroke=0)
    pdf.setFillColor(white)
    pdf.setFont("Helvetica-Bold", 12)
    pdf.drawCentredString(82, box_y + 49, "1")
    pdf.setFillColor(NAVY)
    pdf.setFont("Helvetica-Bold", 12)
    pdf.drawString(108, box_y + 50, "Submit the Steps of Valor registration form.")
    pdf.setFillColor(GOLD)
    pdf.circle(82, box_y + 25, 14, fill=1, stroke=0)
    pdf.setFillColor(NAVY)
    pdf.setFont("Helvetica-Bold", 12)
    pdf.drawCentredString(82, box_y + 20, "2")
    pdf.setFillColor(NAVY)
    pdf.setFont("Helvetica-Bold", 12)
    pdf.drawString(108, box_y + 21, "Complete the required UTA participant waiver.")

    centered_text(pdf, "September 11, 2026  |  Check-in opens 6:45 AM  |  Climb begins 8:03 AM", 116, "Helvetica-Bold", 10.5, NAVY)
    centered_text(pdf, "Need help? Ask a registration volunteer.", 92, "Helvetica", 11, MUTED)

    pdf.setFillColor(NAVY)
    pdf.rect(0, 0, width, 60, fill=1, stroke=0)
    centered_text(pdf, "Official registration: www.stepsofvalor.org", 36, "Helvetica-Bold", 10.5, white)
    centered_text(pdf, "Your registration is complete after both required forms are submitted.", 20, "Helvetica", 8.5, white)

    pdf.showPage()
    pdf.save()


if __name__ == "__main__":
    build_sign()
