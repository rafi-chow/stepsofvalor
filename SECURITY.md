# Security Policy

## Scope

The site content is intended to be safe for a public GitHub repository when published from a fresh clean history. The site is static HTML, CSS, JavaScript, local images, and approved public documents. It does not include a backend, database, login system, or custom payment processing.

Do not publish inherited Git history unless it has been fully audited. If a credential was ever committed, rotate or revoke it before launch; deleting the file from the latest commit is not enough.

## Do not commit

- Porkbun, FTP, SFTP, Netlify, Vercel, DNS, analytics, email, or payment credentials.
- `.env` files, private keys, certificates, deploy tokens, API keys, or account recovery information.
- Unapproved sponsor documents, private phone numbers, private email addresses, tax records, or internal organizer notes.
- Unapproved event photos or assets without permission for public web use.

## Public content intentionally included

- Public contact email: `Thaddeus@stepsofvalor.org`
- Payment, sponsor, and organizer email: `kappasiguta@gmail.com`
- Spotfund fundraiser URL
- Tally registration form URL
- 2026 sponsor packet PDF, approved for public release by the organizer
- Local event photos already selected for the site

## Before pushing public

Run:

```bash
rg -n "password|passwd|secret|api[_-]?key|token|private key|BEGIN .*PRIVATE|ftp|sftp|porkbun|stripe|paypal|venmo" -S .
git status --short
```

Review any matches before committing. If a real secret was ever committed, revoke or rotate it; deleting it from the latest commit is not sufficient because Git history can preserve it.

For public GitHub, prefer a clean first commit made from the approved static files rather than pushing an older working history.

## Payments

Payments must stay external. The site may link to Spotfund or another organizer-approved third-party platform, but it must not collect card numbers, bank details, passwords, or payment credentials.
