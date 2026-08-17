# Steps of Valor Website

Static website for Steps of Valor, a nonprofit organization supporting first responders and their families. The 2026 Steps of Valor 9/11 Memorial Stair Climb is the current public event.

Confirmed public details:

- Event: 2026 Steps of Valor 9/11 Memorial Stair Climb
- Date: September 11, 2026
- Event registration opens: 6:45 AM
- Climb begins: 8:03 AM
- Venue: University of Texas at Arlington Maverick Stadium, 1307 W Mitchell St, Arlington, TX 76013
- Donation link: Spotfund fundraiser configured in `assets/js/config.js`
- Sponsor packet: `assets/docs/steps-of-valor-sponsor-packet-2026.pdf`
- Public contact: `Thaddeus@stepsofvalor.org`
- Payment, sponsor, and organizer contact: `kappasiguta@gmail.com`

This is intentionally a static-only site: HTML, CSS, JavaScript, and local images. It has no backend, Flask app, database, account system, or custom payment processing. Donation, sponsor, and merchandise links are configured in `assets/js/config.js` and should point only to organizer-approved external services. Event registration is currently day-of only.

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

## Before public launch

Update `assets/js/config.js` only when organizer-approved URLs are available:

- `volunteerUrl`
- `merchUrl`

The donation URL and sponsor packet URL are already configured. Registration is currently handled on event day at 6:45 AM. Until other links are confirmed, related buttons safely route to contact information and display “coming soon.” See `TODO.md` for the remaining organizer decisions.

## Project map

- `index.html` — homepage
- `about.html` — mission and featured coverage
- `event.html` — confirmed schedule and pending logistics
- `register.html`, `donate.html`, `sponsors.html`, `merch.html` — action pages
- `gallery.html` — local event photo gallery
- `faq.html`, `contact.html` — help and official contacts
- `assets/css/style.css` — shared visual system and responsive rules
- `assets/js/config.js` — external links and shared contact values
- `assets/js/main.js` — navigation, link wiring, and current year
- `assets/docs/steps-of-valor-sponsor-packet-2026.pdf` — local sponsor packet download
- `netlify.toml` — zero-build Netlify configuration
- `SECURITY.md`, `PUBLIC_RELEASE_CHECKLIST.md` — public repo safety and launch review notes

Deployment references: [Netlify Drop documentation](https://docs.netlify.com/start/quickstarts/netlify-drop-quickstart/), [Vercel deployment documentation](https://vercel.com/docs/deployments/deployment-methods), and [Porkbun Static Hosting setup](https://kb.porkbun.com/article/137-how-to-set-up-static-hosting).
