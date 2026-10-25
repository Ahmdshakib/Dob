# DOB98 Single Index (fixed paths)

## File structure
- `index.html` — all views (Home, Register, Login, Reset Password, Dashboard, Deposit, Withdraw, histories, Casino, Sports and Aviator) and all primary color styling in its inline `<style>`.
- `app.js` — navigation and demo UI interactions. Kept beside `index.html` so the relative path works on GitHub Pages.
- `app.css` — small accessibility/layout helpers only; no color palette.
- `assets/aviator-standalone-2.html` — supplied original Aviator standalone file.

## Deploy
Upload **all** files/folders in this archive to the same GitHub Pages publishing root:
`index.html`, `app.js`, `app.css`, `assets/`.

The page references `app.css`, `app.js`, and `assets/aviator-standalone-2.html` relative to `index.html`. Do not upload only `index.html`.
If GitHub Pages is publishing from a `/docs` folder, upload all files into `/docs` instead.
After deployment, wait for GitHub Pages to finish, then hard-refresh or open the URL in a private tab to avoid stale cache.

## Notes
Forms and balances are demo UI only. They do not create authenticated accounts or verify/transfer real money. Production authentication, email verification, deposits, withdrawals, and wallet accounting require a secure backend.
