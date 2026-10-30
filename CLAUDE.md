# gift-easy-sender — public, login-free sender app

See [../CLAUDE.md](../CLAUDE.md) first for how this repo relates to `gift-ease`.

Next.js 13 (pages router) app. This is a **pure frontend** — no database connection is actually used, and there are no real API routes (`pages/api/` doesn't exist here). Every piece of data or money logic goes over HTTP to `gift-ease`, base URL configured via `NEXT_PUBLIC_REGISTRY_URL`.

## Stack

- Next.js 13 / React 18, `pages/` router
- Stripe (`@stripe/stripe-js` + `@stripe/react-stripe-js`) for the client-side payment confirmation step — the PaymentIntent itself is created by gift-ease
- No Auth0, no Mongoose usage in practice (see caveat below), no auth of any kind — the only "identity" is the wishlist `uri` in the URL
- Plain CSS (`css/sender.css` + shared files copied from gift-ease's original styling) — no styled-components here, unlike gift-ease's newer pages. Colours are the CSS variables at the top of `css/sender.css` (same autumn palette as gift-ease's `css/theme.css`). `css/buttons.css` styles every `<button>` (padding, uppercase), so new buttons need to reset that.

## Pages

- `pages/for/[id]/index.js` — the whole app, effectively. `id` in the route is actually the **event's `uri`**, not a Mongo `_id` (naming is misleading — don't confuse this with `Event._id`). Fetches the event and its wishes from gift-ease. Has a "Show in" currency switcher (remembered in localStorage; starts in the giftee's default currency). Drives a 3-step contribution flow inline (amount + optional thank-you contact → optional message/photos/GIF → payment) rather than separate routes. Coming back from the success page with `?gave=<wishId>&gaveAmount=…&gaveCurrency=…` briefly highlights the wish they gave to.
- `pages/for/[id]/[success]/index.js` — the post-payment thank-you screen (bundled CSS confetti, amount, wish and event names, one "Back to the wishlist" button, share buttons). It calls gift-ease's `confirmPayment` with `?payment_intent=…` so the gift is recorded and counted immediately. `success` in the path is just a route segment.
- `pages/index.js` — a stub placeholder (`"You need to add a '/' route to the url"`). This app is never meant to be visited at `/`; every real entry point is `/for/<uri>`.

## Components

- `GiftPaymentForm.js` — creates the PaymentIntent (POST to gift-ease's `createPaymentIntent`, with an idempotency key) and wraps Stripe Elements around `CheckoutForm.js`, which does `stripe.confirmPayment`.
- `MessageComposer.js` — message with bold/italic/emoji buttons (stored as `**bold**` / `_italic_` text, max 500), up to 4 photos (resized in the browser, uploaded to gift-ease's `uploadToAWS`) and one GIF (`GifPicker.js`, via gift-ease's `giphySearch`; hidden when gift-ease has no `GIPHY_API_KEY`).
- `ContactField.js` — optional WhatsApp number (country code + number, sent as digits only) or email, so the giftee can say thank you.
- `utils/money.js` — currency list, minimums, wish goal helpers and formatting, mirroring gift-ease (the repos share no code).

## Things that will bite you

- **`requests/getOrCreateNewAccount.js` and its sibling `requests/*.js` files are dead code.** They're leftovers from the shared `create-next-app` origin with gift-ease (same function names, same shape) but call *relative* paths like `api/getAccountForThisUser/...` — paths that don't exist in this repo since there's no `pages/api/` here. Nothing in `pages/for/[id]/index.js` imports from `requests/`; it fetches `NEXT_PUBLIC_REGISTRY_URL` directly inline. Don't "fix" these files thinking they're broken production code — they're unused.
- **`next.config.js` reads `MONGODB_URI`** but nothing in this repo's pages actually connects to Mongo. Likely copy-pasted from gift-ease's config. Don't assume setting this env var here does anything.
- **Template-literal URLs must use backticks.** `GiftPaymentForm.js` and the (since deleted) card builder once used `'${process.env.NEXT_PUBLIC_REGISTRY_URL}/api/...'` in single quotes, which sends the literal text as a relative URL. The sender site returns an HTML 404, and `response.json()` fails (Safari shows "The string did not match the expected pattern"). Fixed; watch for the pattern when adding fetches.
- **Payment form errors are shown inline** ("Failed to load payment form: …") using gift-ease's error message when it returns JSON, or the HTTP status when it doesn't. If `NEXT_PUBLIC_REGISTRY_URL` is misconfigured or gift-ease's CORS allowlist doesn't include this deployment's origin, that's where it shows up.
