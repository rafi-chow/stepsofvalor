# Steps of Valor Check-In Desk

Free internal check-in tool for the 2026 Steps of Valor registration Google Sheet.

This is not part of the public website and does not add a backend to the site. It is a Google Apps Script sidebar that runs inside the registration Sheet.

The public website uses a two-step participant flow: Steps of Valor event registration through Tally, then the required UTA MavEngage Participant Release and Indemnification Agreement. This check-in tool uses the Tally/Google Sheets registration list. If the event team needs to verify waiver completion at check-in, use the official UTA/MavEngage export or access method alongside this Sheet.

## What it does

- Searches registrations by name, email, phone number, or organization.
- Adds one-tap check-in.
- Writes check-in status back to the Google Sheet.
- Automatically checks in registrations submitted on September 11, 2026, while leaving advance registrations for staff to check in when they arrive.
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
11. Run `installDayOfCheckInAutomation` once and approve the requested trigger permission. This schedules the private automation to activate just after midnight on September 11.
12. Reload the Google Sheet.
13. Use **Steps of Valor → Open Check-In Desk** from the Google Sheet menu.

## Day-of workflow

1. Place the printable day-of registration QR sign at the registration area.
2. People who scan it complete the Steps of Valor form and the required UTA waiver.
3. A registration submitted on September 11 is marked checked in automatically within about one minute.
4. Advance registrants still check in with staff. Open **Steps of Valor → Open Check-In Desk**, search by name, email, phone, or organization, and click **Check In**.

The automation uses the `Submitted at` value in the Sheet's `America/Chicago` timezone. It records the submission time as the check-in time and labels the check-in source `Day-of QR registration`. The one-minute trigger runs only on September 11 and removes itself after event day, protecting the free Apps Script quota.

Print `output/pdf/steps-of-valor-day-of-registration-qr-sign.pdf`. Its QR code opens `https://www.stepsofvalor.org/register?source=day-of`, which shows event-day instructions while preserving the normal two-step registration flow.

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
