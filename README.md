# DOB98 User Panel

Responsive static frontend matching the supplied DOB98 reference layout. Open `index.html` for a visual preview; account, history, and payment requests require the API server described in `../DOB98_Admin_Panel/server/README.md`.

## Run
1. Install Node.js 20 or newer.
2. Start the backend from the Admin ZIP (`server/`): `npm install`, configure `.env`, then `npm start`.
3. Serve this folder over HTTP (not `file://`) using any static server. Set `window.DOB98_API_BASE` before `js/app.js` if the API is hosted elsewhere; default is `http://localhost:3000/api`.
4. Register, verify the email using the configured mail transport, then sign in.

## Aviator source map
- Original supplied file preserved unchanged at `legacy/aviator-standalone-2.original.html`.
- Original CSS: the single `<style>` block near the start of that legacy file (starts at source line 8).
- Original JS: inline scripts beginning around source lines 329, 334, and 490. `RXEngine` is defined in the second script; overlay/round UI code begins in the third.
- The supplied file does **not** contain a `GAME_HTML` variable or a conventional standalone real-money game/cashout API. Its comments describe a demo overlay/signal engine and its wallet storage uses `localStorage`/extension storage. Do not treat that client-side balance as authoritative.
- New reference-style Aviator presentation and demo-only bet controls are in `index.html` (`#aviator`) and `js/app.js`; styles are in `css/app.css`.
- Demo bet/cashout deliberately do not change account balance. For any licensed real-money game, connect a provider's approved server-side game API and reconcile bets, rounds and payouts on the server. Do not replace the preserved original without regression tests.

## Included assets
`assets/reference-layout.png` is the supplied reference screenshot for design documentation, not used as a website image. The logo and aircraft art are original inline SVG/CSS so there are no broken external image dependencies. Casino/sports/slots cards are stylized CSS illustrations, not third-party game logos.

## Important
This is a prototype scaffold, not a ready-to-launch real-money gambling platform. Email delivery needs SMTP configuration. Obtain legal review and any required licenses before enabling real-money gambling or payment processing.
