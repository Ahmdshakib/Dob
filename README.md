# DOB98 User Panel

This panel uses the shared DOB98 API for registration/login, wallet balance, deposit/withdraw requests, and transaction history. It is not a standalone wallet: the user panel and admin panel must point to the same deployed API/database.

## Connect the API
1. Deploy the backend included in `DOB98_Admin_Panel/server` on a private Node.js 20+ server with HTTPS in production.
2. Configure its `.env` using the backend README, including `APP_ORIGIN` (this user site's origin), `API_PUBLIC_URL` (the public API base origin), a long random `JWT_SECRET`, admin credentials, and SMTP settings.
3. In `app.js`, change `http://localhost:3000/api` in `window.DOB98_API_BASE || 'http://localhost:3000/api'` to your API URL, e.g. `https://api.example.com/api`. Do the same in admin `js/admin.js`. Both must use the exact same API.
4. Configure a bKash number in the Admin Panel. Deposit requests stay pending until admin approves them. The balance is credited only once when approved. Withdrawal requests reserve the balance; rejection refunds it, approval leaves the amount reserved as paid/processed.
5. Set up SMTP so users can verify Gmail before login. The backend emails a verification link.

## Account rules
- Gmail address only; an email and username can each be registered once.
- Username: 3–24 letters/numbers only.
- Password: exactly 6 digits, as requested.

## Requests and history
Users can add an optional message to deposit/withdraw requests. Admin sees that message alongside the request; users see the request status and message in their own history. Admin approval credits a deposit to the account ledger.

## Access control and balance safety
The front end now redirects guests to Login before opening Dashboard, Deposit, Withdraw, transaction history, or game views, including direct hash navigation. The backend remains the authority: it must reject withdrawals unless the authenticated account has sufficient available balance. Never deploy this site without the shared API/database configured; a front-end-only balance is not a real account balance. A deposit request showing `pending` is expected until an admin approves it; the balance must not increase before approval.

## Important
The included Aviator UI is not connected to the wallet ledger for real-money betting. Do not use this prototype to handle real funds without a professional security review, payment-provider reconciliation, appropriate licensing, and production controls.
