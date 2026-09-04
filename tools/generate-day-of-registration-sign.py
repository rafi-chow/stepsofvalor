#!/usr/bin/env python3
"""Generate the print-ready Steps of Valor day-of registration QR sign."""

from pathlib import Path

from PIL import Image, ImageOps
from reportlab.graphics import renderPDF
from reportlab.graphics.barcode.qr import QrCodeWidget
from reportlab.graphics.shapes import Drawing
from reportlab.lib.colors import HexColor, black, white
from reportlab.lib.pagesizes import letter
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase.pdfmetrics import stringWidth
from reportlab.pdfgen import canvas


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "output" / "pdf" / "steps-of-valor-day-of-registration-qr-sign.pdf"
LOGO = ROOT / "assets" / "images" / "steps-of-valor-emblem-transparent.png"
MONO_LOGO = ROOT / "tmp" / "pdfs" / "steps-of-valor-emblem-monochrome.png"
REGISTRATION_URL = "https://www.stepsofvalor.org/register?source=day-of"

DARK = HexColor("#202020")
MUTED = HexColor("#555555")
SOFT = HexColor("#F2F2F2")
LINE = HexColor("#111111")


def centered_text(pdf, text, y, font, size, color=black):
    pdf.setFont(font, size)
    pdf.setFillColor(color)
    pdf.drawCentredString(letter[0] / 2, y, text)


def draw_qr(pdf, url, x, y, size):
    widget = QrCodeWidget(url)
    widget.barLevel = "H"
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


def make_monochrome_logo():
    """Create a neutral grayscale logo on white for reliable office printing."""
    MONO_LOGO.parent.mkdir(parents=True, exist_ok=True)
    source = Image.open(LOGO).convert("RGBA")
    white_background = Image.new("RGBA", source.size, (255, 255, 255, 255))
    white_background.alpha_composite(source)
    grayscale = ImageOps.grayscale(white_background.convert("RGB"))
    grayscale.save(MONO_LOGO, optimize=True)


def build_sign():
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    make_monochrome_logo()
    width, height = letter
    pdf = canvas.Canvas(str(OUTPUT), pagesize=letter)
    pdf.setTitle("Steps of Valor Day-of Registration QR Sign")
    pdf.setAuthor("Steps of Valor")
    pdf.setSubject("Black-and-white printable event-day registration and check-in sign")

    # Ink-friendly monochrome frame and header.
    pdf.setStrokeColor(LINE)
    pdf.setLineWidth(1.5)
    pdf.rect(24, 24, width - 48, height - 48, fill=0, stroke=1)
    pdf.drawImage(ImageReader(str(MONO_LOGO)), 44, height - 97, width=64, height=64)
    pdf.setFillColor(black)
    pdf.setFont("Helvetica-Bold", 24)
    pdf.drawString(122, height - 59, "STEPS OF VALOR")
    pdf.setFont("Helvetica", 12.5)
    pdf.drawString(123, height - 82, "2026 9/11 Memorial Stair Climb")
    pdf.setLineWidth(1)
    pdf.line(44, height - 115, width - 44, height - 115)

    centered_text(pdf, "DAY-OF REGISTRATION & CHECK-IN", height - 150, "Helvetica-Bold", 14)
    centered_text(pdf, "Scan to register and check in", height - 181, "Helvetica-Bold", 27)
    centered_text(pdf, "Complete both required steps before joining the climb.", height - 205, "Helvetica", 12, MUTED)

    # QR card
    card_x, card_y, card_w, card_h = 126, 276, 360, 300
    pdf.setFillColor(white)
    pdf.setStrokeColor(LINE)
    pdf.setLineWidth(2)
    pdf.roundRect(card_x, card_y, card_w, card_h, 16, fill=1, stroke=1)
    qr_size = 252
    qr_x = (width - qr_size) / 2
    qr_y = card_y + 24
    pdf.setFillColor(white)
    pdf.rect(qr_x - 14, qr_y - 14, qr_size + 28, qr_size + 28, fill=1, stroke=0)
    draw_qr(pdf, REGISTRATION_URL, qr_x, qr_y, qr_size)

    fit_centered_text(pdf, "stepsofvalor.org/register", 255, 420, max_size=13.5)

    # Two-step reminder
    box_y = 150
    pdf.setFillColor(white)
    pdf.setStrokeColor(LINE)
    pdf.setLineWidth(1)
    pdf.roundRect(54, box_y, width - 108, 84, 12, fill=1, stroke=1)
    pdf.setFillColor(white)
    pdf.setStrokeColor(black)
    pdf.setLineWidth(1.5)
    pdf.circle(82, box_y + 55, 14, fill=1, stroke=1)
    pdf.setFillColor(black)
    pdf.setFont("Helvetica-Bold", 12)
    pdf.drawCentredString(82, box_y + 50, "1")
    pdf.setFillColor(DARK)
    pdf.setFont("Helvetica-Bold", 12)
    pdf.drawString(108, box_y + 51, "Submit the Steps of Valor registration form.")
    pdf.setFillColor(white)
    pdf.circle(82, box_y + 25, 14, fill=1, stroke=1)
    pdf.setFillColor(black)
    pdf.setFont("Helvetica-Bold", 12)
    pdf.drawCentredString(82, box_y + 20, "2")
    pdf.setFillColor(DARK)
    pdf.setFont("Helvetica-Bold", 12)
    pdf.drawString(108, box_y + 21, "Complete the required UTA participant waiver.")

    centered_text(pdf, "September 11, 2026  |  Check-in opens 6:45 AM  |  Climb begins 8:03 AM", 116, "Helvetica-Bold", 10.5, black)
    centered_text(pdf, "Need help? Ask a registration volunteer.", 92, "Helvetica", 11, MUTED)

    pdf.setStrokeColor(LINE)
    pdf.setLineWidth(1)
    pdf.line(44, 72, width - 44, 72)
    centered_text(pdf, "Official registration: www.stepsofvalor.org", 52, "Helvetica-Bold", 10.5, black)
    centered_text(pdf, "Your registration is complete after both required forms are submitted.", 37, "Helvetica", 8.5, DARK)

    pdf.showPage()
    pdf.save()


if __name__ == "__main__":
    build_sign()
