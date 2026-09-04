# Steps of Valor Website

Static website for Steps of Valor, a nonprofit organization supporting first responders and their families. The 2026 Steps of Valor 9/11 Memorial Stair Climb is the current public event.

Confirmed public details:

- Event: 2026 Steps of Valor 9/11 Memorial Stair Climb
- Date: September 11, 2026
- Event-day check-in opens: 6:45 AM
- Climb begins: 8:03 AM
- Venue: University of Texas at Arlington Maverick Stadium, 1307 W Mitchell St, Arlington, TX 76013
- Donation link: Spotfund fundraiser configured in `assets/js/config.js`
- Sponsor packet: `assets/docs/steps-of-valor-sponsor-packet-2026.pdf`
- Public contact: `Thaddeus@stepsofvalor.org`
- Payment, sponsor, and organizer contact: `kappasiguta@gmail.com`

This project is a static website built with HTML, CSS, JavaScript, and local images. Donations use the official Spotfund fundraiser; participant registration uses an embedded Tally form plus a required UTA MavEngage participant waiver, with event-day check-in beginning at 6:45 AM.

## Public GitHub safety

Use a fresh clean repository/export for public GitHub or production source control. Do not publish this working repo’s inherited Git history unless it has been fully audited and any old deploy credentials have been removed from history or rotated.

Approved public content currently includes the Spotfund fundraiser URL, public contact emails, selected event photos, and the 2026 sponsor packet PDF. The sponsor packet has been treated as approved public content by the organizer.

Before pushing, run:

```bash
rg -n "password|passwd|secret|api[_-]?key|token|private key|BEGIN .*PRIVATE|ftp|sftp|porkbun|stripe|paypal|venmo" -S .
git status --short
```

Do not commit deploy credentials, payment account credentials, private keys, `.env` files, Porkbun/FTP credentials, or unapproved organizer documents. See `SECURITY.md`.

For a concise pre-push review, use `PUBLIC_RELEASE_CHECKLIST.md`. The safest public workflow is to copy the approved site files into a new empty repository, make a first commit there, and push that clean history.

## Local preview

From this project folder, run:

```bash
python3 -m http.server 8000
```

Open [http://localhost:8000](http://localhost:8000). Stop the server with `Control-C`.

Opening `index.html` directly also works, but the local server is a closer match to deployment.

## Fastest shareable demo: Netlify Drop

No build is required.

1. Go to [Netlify Drop](https://app.netlify.com/drop) and sign in.
2. Drag this entire `StepsOfValor` folder onto the drop zone.
3. Wait for the upload, then copy the generated `*.netlify.app` URL.
4. Send that URL for review.

To update the demo, open the site's **Deploys** page and drag the updated project folder into the deploy area again. `netlify.toml` tells Netlify to publish the project root and adds lightweight security headers.

## Shareable demo with Vercel

From this project folder:

```bash
npx vercel
```

Sign in when prompted and accept the detected static-project defaults. The command prints a unique preview URL. For a production Vercel deployment later, run:

```bash
npx vercel --prod
```

No framework preset, build command, or output directory is needed for this project.

## Final deployment to Porkbun

Porkbun Static Hosting accepts plain HTML/CSS/JS sites like this one.

1. Log in to Porkbun and open **Domain Management**.
2. Find the domain and choose the house icon in the **Website** column.
3. Select a **Static Hosting** plan.
4. In the hosting panel, use the file uploader and upload the contents of this project so `index.html` is at the site root. Porkbun also offers FTP or GitHub connection options.
5. Open the domain and test every navigation item and CTA.

Do not commit Porkbun/FTP credentials. Keep real credentials only in your password manager or a local ignored file.

## Registration and required UTA waiver

Participant registration is a two-step flow on `register.html`.

- Public form URL: `https://tally.so/r/yP5dO8`
- Embedded form URL: `https://tally.so/embed/yP5dO8`
- Required UTA waiver URL: `https://mavengage.uta.edu/submitter/form/start/734561`
- The form collects full name, email, optional phone number, optional organization, and an event agreement checkbox.
- Submissions are available in the Tally dashboard for the `2026 Steps of Valor Registration` form.
- Every participant must also complete the UTA MavEngage Participant Release and Indemnification Agreement.

The Tally form is the organizer/check-in list. The UTA MavEngage form is the required participant waiver. Keep both URLs in `assets/js/config.js`; no backend migration is needed.

MavEngage blocks off-site iframe embedding with browser security headers, so the website links participants to the secure UTA-hosted waiver instead of trying to display it inline.

## Free check-in desk

The repo includes a free Google Sheets check-in tool in `tools/checkin-appscript/`.

Use it after the Tally form is connected to Google Sheets. If organizers need to verify waiver completion at check-in, export or access the MavEngage waiver records separately through UTA/MavEngage.

1. Open the registration Google Sheet.
2. Go to **Extensions → Apps Script**.
3. Paste in `tools/checkin-appscript/Code.gs` and `tools/checkin-appscript/Index.html`.
4. Run `setupCheckInSheet` once and approve permissions.
5. Run `installDayOfCheckInAutomation` once. This schedules an event-day-only check that marks new September 11 Tally submissions checked in automatically within about one minute.
6. Reload the Sheet, then open **Steps of Valor → Open Check-In Desk**.

This creates a private staff search-and-check-in panel backed by the Sheet. It is faster than manually scanning rows and stays free.

## Before public launch

The donation URL, registration form URL, and sponsor packet URL are maintained in `assets/js/config.js`. Event-day check-in begins at 6:45 AM. See `ORGANIZER_CHECKLIST.md` for information the event team may add as it is finalized.

## Project map

- `index.html` — homepage
- `about.html` — mission and featured coverage
- `event.html` — schedule and event-day information
- `register.html`, `donate.html`, `sponsors.html`, `merch.html` — action pages
- `gallery.html` — local event photo gallery
- `faq.html`, `contact.html`, `privacy.html` — help, official contacts, and privacy policy
- `assets/css/style.css` — shared visual system and responsive rules
- `assets/js/config.js` — external links and shared contact values
- `assets/js/main.js` — navigation, link wiring, and current year
- `assets/docs/steps-of-valor-sponsor-packet-2026.pdf` — local sponsor packet download
- `tools/checkin-appscript/` — optional internal Google Sheets check-in desk
- `output/pdf/steps-of-valor-day-of-registration-qr-sign.pdf` — print-ready day-of registration sign
- `tools/generate-day-of-registration-sign.py` — regenerates the QR sign for the permanent website URL
- `netlify.toml` — zero-build Netlify configuration
- `SECURITY.md`, `PUBLIC_RELEASE_CHECKLIST.md`, `ORGANIZER_CHECKLIST.md` — maintenance and launch notes

Deployment references: [Netlify Drop documentation](https://docs.netlify.com/start/quickstarts/netlify-drop-quickstart/), [Vercel deployment documentation](https://vercel.com/docs/deployments/deployment-methods), and [Porkbun Static Hosting setup](https://kb.porkbun.com/article/137-how-to-set-up-static-hosting).
