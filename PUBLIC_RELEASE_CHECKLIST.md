# Public Release Checklist

Use this before pushing to a public GitHub repo, sending a recruiter link, or deploying to production.

## Security

- Public GitHub uses a fresh clean repository/export, not unaudited inherited history.
- No `.env`, FTP/SFTP, Porkbun, DNS, payment, analytics, or deploy credentials are committed.
- Any secret that was ever committed has been revoked or rotated.
- The site stays static: no backend, Flask app, database, login system, or custom payment processing.
- Donation/payment actions link to the approved external Spotfund page.
- Sponsor packet PDF is intentionally public and organizer-approved.
- Event photos are approved for public web use.

## Content accuracy

- Steps of Valor is described as the organization.
- The 9/11 Memorial Stair Climb is described as the current event, not the entire organization.
- Kappa Sigma Theta Omega is described as a community partner.
- Confirmed event details are September 11, 2026, University of Texas at Arlington Maverick Stadium, 6:45 AM event-day registration, and 8:03 AM start.
- Unknown logistics remain clearly marked as coming soon.

## Visual quality

- Each page has one clear primary action.
- Placeholder content is not mixed into finished copy without a clear “coming soon” label.
- Real local photos are used intentionally, not as random decoration.
- CTAs, cards, spacing, and colors stay consistent across pages.
- Mobile navigation, text wrapping, and button stacking are checked.

## Accessibility

- Every page has one main heading and descriptive page title.
- Images have useful `alt` text.
- Links describe their destination or action.
- Keyboard focus is visible.
- Color contrast is checked, especially red/gold text and buttons.

## Final local checks

```bash
python3 -m http.server 8000
```

Open `http://localhost:8000`, then check:

- Homepage
- About
- Event
- Register
- Donate
- Sponsors
- Merch
- Gallery
- FAQ
- Contact

Also confirm:

- Spotfund opens in a new tab.
- Sponsor packet opens or downloads.
- No broken image references appear.
- Mobile layout works at phone width.
