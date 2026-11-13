# Papaya Prints

Hebrew/English static store for GitHub Pages. No backend, no secret keys.

## Local

```sh
python3 -m http.server --directory site 8000
```

Open http://localhost:8000/

## Deploy

The live site is the `gh-pages` branch (contents of `site/`).

## Edit prices

1. Open `/admin.html`.
2. Password: `papaya` (checked in the browser only — not real security). Change `store.adminPasswordHash` in `products.json` (SHA-256) to set a new one.
3. Edit prices, Stripe payment links, Bit phone, WhatsApp, and shipping.
4. Use **products.json** to download the file and replace `site/products.json`, or paste a GitHub token (repo scope) and press **GitHub** to publish. The token stays in the browser.

Catalog data lives in `site/products.json`. A flat copy for a later Supabase table is in `catalog/supabase-products.json`. Prices are placeholder NIS estimates (shown as temporary in the UI) until Matias confirms them.

Stripe links go on each product (`stripeLink`) or in `store.stripe.multiItemLink` for mixed carts. Create Payment Links in Stripe and paste the `https://buy.stripe.com/…` URLs. Do not put secret keys in the repo.
