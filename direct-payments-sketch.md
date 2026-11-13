# Papaya Prints: direct payments sketch (researched 13 Oct 2026)
Research only. No accounts were created. Prices are before 18% VAT unless marked otherwise. Confirm the final terms with each provider before signing.

## 1. Stripe in Israel
- Israel is **not** on Stripe's supported-country list (https://stripe.com/global). I checked the page HTML on 13 Oct 2026: UAE, Thailand and Gibraltar are listed, Israel is not. Stripe says businesses in unsupported countries can use "Treasury with stablecoins… Payments not supported yet."
- Workaround: a Stripe Atlas Delaware LLC (https://stripe.com/atlas) costs about $500 to set up, plus a registered agent (about $100/yr) and Delaware franchise tax ($300/yr).
  - Tax: a single-member LLC owned by a non-US person must file IRS Form 5472 + pro-forma 1120 every year (penalty $25k). Israel generally treats the LLC as transparent, so Matias still reports the income in Israel and pays Israeli income tax + VAT/Bituach Leumi on it. Israeli customers still expect a חשבונית/קבלה (receipt or invoice) from an Israeli עוסק (registered business), so he'd need separate invoicing software anyway. Selling physical goods to Israelis through a US shell also adds accounting cost and a risk of being seen as a "permanent establishment" in Israel.
  - **Not worth it** for a small local business. Use an Israeli acquirer.

## 2. Israeli providers
| Provider | Integration | Bit / Apple Pay | Auto Israeli invoice | Monthly | Per txn | Static site + serverless? |
|---|---|---|---|---|---|---|
| **Grow (Meshulam)** | Hosted payment page / payment links + API + webhook (server callback) | Yes / Yes (+Google Pay) | Yes, built in | Light ₪29 (annual ₪348, 20 txns+20 docs/mo); Standard ₪59 annual / ₪69 monthly (100 incl.) | 1% (Light) / 0.75%; foreign card 3.5% | Yes: create the page from a function, confirm by webhook |
| **PayPlus** | Hosted page / iframe + REST API + IPN | Yes / Yes | Yes (PayPlus invoice module) | ₪0–150 (quoted) | ~0.9–1.3% (quoted) | Yes |
| **Tranzila** | Hosted iframe/redirect + API (mostly a terminal; usually needs a separate acquirer contract) | Yes / Yes | Via add-on or a 3rd party | ~₪90–200 | ~1.2–1.7% + acquirer | Yes, but more paperwork |
| **Cardcom** | LowProfile hosted page + JSON API + webhook; mature docs | Yes / Yes | Yes, built-in documents | ~₪49 + setup fee | from ~1.2% | Yes |
| **PayPal** | JS SDK buttons + Orders API + webhooks | No Bit / Apple Pay possible | No Israeli tax invoice | ₪0 | 3.4% + ₪1.20 domestic (4.01% + ₪1.42 incl. VAT); +1–2% for foreign buyers | Yes (easiest technically) |

Fees on a ₪100 sale, VAT included (variable fee only):
- Grow Light ≈ ₪1.18
- Grow ≈ ₪0.89
- Cardcom ≈ ₪1.42
- PayPlus ≈ ₪1.06–1.53
- Tranzila ≈ ₪1.42–2.00 + acquirer
- PayPal ≈ ₪5.43

Sources:
- Grow pricing: https://grow.business/price-offer/
- Comparison (checked Sep 2026): https://arbiter.co.il/credit-card-clearing-comparison and https://arbiter.co.il/providers/grow
- PayPlus/Cardcom/Tranzila ranges: https://sitelink.co.il/web/ecommerce/payment-solutions-for-businesses-israel-2026/ and https://www.autoflowr.co.il/compare/payment-gateways-israel-2026
- PayPal IL fees: https://www.paypal.com/il/business/paypal-business-fees and https://www.paypalobjects.com/marketing/ua/OA/merchant-fees/en-IL-070626.pdf

Note: the PayPlus, Tranzila and Cardcom numbers come from third-party comparison sites. These providers don't publish a full price list, so get quotes.

## 3. Architectures
### A. Payment link per product (no backend)
1. Create one Grow (or PayPlus) payment link per product in their dashboard, with shipping as a product option.
2. Put a "קנו עכשיו" (Buy now) button on each product card in the static site.
3. The provider sends the invoice and an email to Matias, and he ships manually.
- Cost: hosting ₪0 (Netlify/Cloudflare Pages) + Grow Light ₪29/mo.
- ₪100 sale: about ₪1.18.
- Effort: about half a day.
- Limits: no cart, stock tracked by hand, catalog edits happen in two places.

### B. Cart + serverless checkout + webhook, catalog in a Google Sheet
1. His wife edits a Google Sheet on her phone (name, price, photo URL, stock, active). Optionally an AppSheet or Glide form on top as a nicer phone admin.
2. The site fetches the published sheet as CSV/JSON at build time or runtime (cached).
3. Cart lives in localStorage. A Netlify/Vercel/Cloudflare function re-prices the cart from the sheet and calls the Grow/PayPlus API to create a payment page, then redirects the buyer to it.
4. A webhook function verifies the payment, decrements stock via the Sheets API (service account), and emails the order. The provider issues the invoice automatically.
- Cost: ₪0 infra + ₪29–69/mo provider.
- ₪100 sale: about ₪0.89–1.18.
- Effort: about 2–4 days.
- Risks: sheet race conditions (fine at low volume), Sheets API quotas.

### C. Cart + serverless + hosted DB (Supabase) with a phone admin
Same flow as B, but products and orders live in Supabase Postgres. Images go to Supabase Storage. The admin is a small password-protected mobile page (or the Supabase table editor) for editing the catalog and viewing orders, with an order status workflow.
- Cost: Supabase free tier (projects pause after 1 week of inactivity; Pro is $25/mo) + provider ₪29–69.
- ₪100 sale: same as B.
- Effort: about 5–8 days.

## 4. Recommendation
**Option B with Grow** (start on Grow Light ₪29/mo, upgrade above about 20 orders/mo). Why:
- Bit + Apple Pay + automatic חשבונית (tax invoice) in one contract.
- Lowest published fees.
- The Google Sheet is the easiest phone admin for his wife, with no server to run.

Option A can launch in one day as phase 0. Move to C only if order volume or admin needs outgrow the sheet. Before building, confirm with Grow:
- API/webhook access on the Light plan (vs. only payment links)
- the exact Bit flow via API
