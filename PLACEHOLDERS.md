# Placeholders to replace before launch

Everything below is fake or unconfirmed. Search the repo for `PLACEHOLDER` or `data-placeholder` to find it all.

| What | Current value | Where it lives |
| --- | --- | --- |
| WhatsApp number | `972500000000` (fake) | `site/assets/js/main.js`, `CONFIG.whatsapp`. The only place the number exists. Digits only, with country code (e.g. `9725XXXXXXXX`). |
| Instagram profile | `https://instagram.com/PLACEHOLDER` | `site/assets/js/main.js`, `CONFIG.instagram`. The contact and footer links also carry this URL as an HTML fallback (`data-instagram`). |
| WhatsApp pre-filled messages | Generic Hebrew text | `site/assets/js/main.js`, `MESSAGES`. Product links add the product name automatically. |
| Prices | `החל מ-₪__` | Every product card in `site/index.html`, `<span class="price" data-placeholder="price">`. No prices were provided, none are invented. |
| Product photos (6 cards) | CSS/SVG placeholder with "תמונה תתווסף בקרוב" | `site/index.html`, `<div class="ph" data-placeholder="replace-with-photo">` under each `<!-- PLACEHOLDER: replace with real photo -->` comment. Cards: SKÅDIS holder, Snitch stand, Benchy boat, home repairs, helping-hand adapter, kids items. Replace the `.ph` div with an `<img>` (4:3, `loading="lazy"`, Hebrew alt). |
| Material tag per product | PLA / PETG guessed from use case | Product cards in `site/index.html` (`.tag-mat`). Confirm the real material for each product. |
| Shipping options | "יעודכן" | `site/index.html`, FAQ item "משלוח או איסוף?" (`data-placeholder="shipping"`). Pickup in Ra'anana is stated, shipping is TBD. |
| Payment methods | "יעודכן" | `site/index.html`, FAQ item "איך משלמים?" (`data-placeholder="payment"`). |
| Domain / share image | `https://example.com/` | `site/index.html` `<head>`: `og:url` and `og:image`. Use an absolute URL and a 1200×630 image. |
| Kids bike spec | 70×40×14 mm, ~17 g | From the brief. Verify against the final printed part. |
| Color swatches | Generic filament colors | `site/index.html`, Materials section. Labeled "המלאי משתנה"; update to match real stock. |
