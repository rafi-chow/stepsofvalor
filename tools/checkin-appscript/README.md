# Steps of Valor Check-In Desk

Free internal check-in tool for the 2026 Steps of Valor registration Google Sheet.

This is not part of the public website and does not add a backend to the site. It is a Google Apps Script sidebar that runs inside the registration Sheet.

## What it does

- Searches registrations by name, email, phone number, or organization.
- Adds one-tap check-in.
- Writes check-in status back to the Google Sheet.
- Automatically adds these columns if missing:
  - `Checked In`
  - `Check-in Time`
  - `Checked In By`
  - `Check-in Notes`
- Shows live totals for registered, checked in, and remaining.

## Recommended free setup

1. In Tally, open the `2026 Steps of Valor Registration` form.
2. Go to **Integrations** and connect it to Google Sheets.
3. Keep the Google Sheet private. Share edit access only with event staff who should check people in.
4. Open the Google Sheet.
5. Go to **Extensions → Apps Script**.
6. Paste `Code.gs` into the Apps Script `Code.gs` file.
7. Add an HTML file named `Index` and paste `Index.html` into it.
8. Optional: paste `appsscript.json` into the project manifest if you use Apps Script project settings.
9. Save the project.
10. Run `setupCheckInSheet` once from the Apps Script editor and approve the requested Google permissions.
11. Reload the Google Sheet.
12. Use **Steps of Valor → Open Check-In Desk** from the Google Sheet menu.

## Day-of workflow

1. Open the registration Google Sheet on a laptop or tablet.
2. Click **Steps of Valor → Open Check-In Desk**.
3. Type the participant’s name, email, phone, or organization.
4. Click **Check In**.
5. The Sheet updates immediately with check-in status and time.

This is much faster than manually scanning a spreadsheet, but it stays free and keeps Google Sheets as the source of truth.

## Optional staff restrictions

The safest free setup is the sidebar inside the private Google Sheet. Only people with Sheet access can use it.

If you want extra guardrails, add script properties in **Apps Script → Project Settings → Script properties**:

| Property | Example | Purpose |
|---|---|---|
| `SOV_CHECKIN_PASSCODE` | `use-a-real-staff-passcode` | Requires a passcode before searching or checking in. |
| `SOV_STAFF_EMAILS` | `person1@gmail.com,person2@gmail.com` | Allows only listed Google accounts, when Google exposes the active user email. |
| `SOV_REGISTRATION_SHEET_NAME` | `Registrations` | Forces the tool to use a specific sheet tab. |

Do not commit real passcodes or private Sheet IDs to GitHub.

## Optional phone web-app mode

Use the sidebar mode by default. If the team needs phone check-in, you can deploy the same Apps Script as a web app.

Before deploying web-app mode:

1. Set `SOV_CHECKIN_PASSCODE` in script properties.
2. Use a strong event-day passcode.
3. Share the web-app URL only with check-in staff.
4. Do not choose public access without a passcode.

Suggested deployment settings:

- **Deploy → New deployment → Web app**
- **Execute as:** Me
- **Who has access:** Anyone with Google account, if available

If only `Anyone` is available, use the passcode and treat the link like private event-staff material.

## Privacy and safety notes

- Collect only what the event team needs.
- Keep the registration Sheet private.
- Remove staff access after the event if they no longer need it.
- Do not publish the registration Sheet or check-in URL.
- Do not store payment information in this Sheet.
- Use the website privacy policy for public-facing notice.
