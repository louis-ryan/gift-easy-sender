# gift-easy-sender — public, login-free sender app

See [../CLAUDE.md](../CLAUDE.md) first for how this repo relates to `gift-ease`.

Next.js 13 (pages router) app. This is a **pure frontend** — no database connection is actually used, and there are no real API routes (`pages/api/` doesn't exist here). Every piece of data or money logic goes over HTTP to `gift-ease`, base URL configured via `NEXT_PUBLIC_REGISTRY_URL`.

## Stack

- Next.js 13 / React 18, `pages/` router
- Stripe (`@stripe/stripe-js` + `@stripe/react-stripe-js`) for the client-side payment confirmation step — the PaymentIntent itself is created by gift-ease
- No Auth0, no Mongoose usage in practice (see caveat below), no auth of any kind — the only "identity" is the wishlist `uri` in the URL
- Plain CSS (`css/sender.css` + shared files copied from gift-ease's original styling) — no styled-components here, unlike gift-ease's newer pages

## Pages

- `pages/for/[id]/index.js` — the whole app, effectively. `id` in the route is actually the **event's `uri`**, not a Mongo `_id` (naming is misleading — don't confuse this with `Event._id`). Fetches the event, the giftee's Stripe account id, and the wishes, all from gift-ease. Drives a 3-step contribution flow inline (amount → optional message/card → payment) rather than separate routes.
- `pages/for/[id]/[success]/index.js` — post-payment confirmation screen (share buttons, receipt). `success` in the path is unused as data (no logic reads it) — it's just a route segment to get a distinct URL.
- `pages/index.js` — a stub placeholder (`"You need to add a '/' route to the url"`). This app is never meant to be visited at `/`; every real entry point is `/for/<uri>`.

## Components

- `GiftPaymentForm.js` — creates the PaymentIntent (POST to gift-ease's `createPaymentIntent`, with an idempotency key) and wraps Stripe Elements around `CheckoutForm.js`, which does `stripe.confirmPayment`.
- `SimpleCardBuilder.js` — lets the sender design a simple gift card (background image, draggable overlay photos, text) that gets attached to the payment via gift-ease's `Card` model. Images upload through gift-ease's `uploadToAWS` endpoint, not a local one.
- `PersonalForm.js` — appears to be an older/alternate version of the amount+message step that duplicates logic now inlined in `pages/for/[id]/index.js`'s `renderStep1`/`renderStep2`. Check whether it's still referenced anywhere before editing either — they've likely diverged.
- `CoverImage.js` — wishlist hero image display.

## Things that will bite you

- **`requests/getOrCreateNewAccount.js` and its sibling `requests/*.js` files are dead code.** They're leftovers from the shared `create-next-app` origin with gift-ease (same function names, same shape) but call *relative* paths like `api/getAccountForThisUser/...` — paths that don't exist in this repo since there's no `pages/api/` here. Nothing in `pages/for/[id]/index.js` imports from `requests/`; it fetches `NEXT_PUBLIC_REGISTRY_URL` directly inline. Don't "fix" these files thinking they're broken production code — they're unused.
- **`next.config.js` reads `MONGODB_URI`** but nothing in this repo's pages actually connects to Mongo. Likely copy-pasted from gift-ease's config. Don't assume setting this env var here does anything.
- **Hardcoded template-literal bug pattern**: several fetch URLs are written as plain strings that *look* like template literals but use single quotes, e.g. in `GiftPaymentForm.js`: `fetch('${process.env.NEXT_PUBLIC_REGISTRY_URL}/api/createPaymentIntent', ...)`. Because it's `'...'` not `` `...` ``, this does **not** interpolate — it sends the literal string `${process.env.NEXT_PUBLIC_REGISTRY_URL}/api/createPaymentIntent` as the URL. Same bug appears in `SimpleCardBuilder.js` (upload URL) and `PersonalForm.js` (convertToUsd URL). This looks like a real, live bug — worth verifying whether contributions/uploads are actually reaching gift-ease in production or silently failing/falling through to relative-path resolution.
- **`getRecipientAccount` in `pages/for/[id]/index.js`** fetches `` `${NEXT_PUBLIC_REGISTRY_URL}/api/getAccountForThisUser/${sub}||"` `` — note the trailing `||"` (a stray quote character) instead of `||` + email. This likely doesn't match gift-ease's `user.split('||')` expectation cleanly; worth checking whether recipient lookup for the sender flow is actually working or degrading gracefully.
- **No error boundary / retry** around the payment intent creation — if `NEXT_PUBLIC_REGISTRY_URL` is misconfigured or gift-ease's CORS allowlist doesn't include this deployment's origin, the failure mode is a silent console error and a stuck "Loading payment form..." state, not a user-visible message.
