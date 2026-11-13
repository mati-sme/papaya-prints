# Catalog for later Supabase

`supabase-products.json` is a flat copy of the live catalog, one object per product, ready to load into a `products` table (plus a small `categories` array).

Suggested columns: `id` (text pk), `active`, `category_id`, `name_he`, `name_en`, `price_nis` (numeric), `price_placeholder` (bool), `currency`, `material_he`, `material_en`, `specs` (jsonb), `images` (text[]), `stripe_link`, `disclaimer_he`, `disclaimer_en`, `copyright_status`, `source`.

Do not put API keys or the admin password here. Prices are still placeholder estimates.
