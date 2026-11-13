/* Papaya Prints storefront. No secrets. */
const I18N = {
  he: {
    skip: "דילוג לתוכן",
    gadgets: "גאדג'טים",
    fridgeToys: "צעצועי מקרר",
    cart: "סל",
    addToCart: "הוסף לסל",
    buyNow: "קנה עכשיו",
    payNow: "לתשלום",
    checkout: "לקופה",
    close: "סגירה",
    qty: "כמות",
    remove: "הסרה",
    emptyCart: "הסל ריק",
    subtotal: "ביניים",
    shipping: "משלוח",
    total: "סה״כ",
    temp: "זמני",
    name: "שם",
    phone: "טלפון",
    email: "דוא״ל",
    street: "רחוב",
    city: "עיר",
    postal: "מיקוד",
    payment: "תשלום",
    placeOrder: "אישור הזמנה",
    order: "הזמנה",
    bit: "Bit",
    stripe: "Stripe",
    whatsapp: "WhatsApp",
    copy: "העתקה",
    langSwitch: "EN",
    terms: "תקנון",
    shippingReturns: "משלוחים והחזרות",
    accessibility: "הצהרת נגישות",
    back: "חזרה",
    menu: "תפריט",
    required: "שדה חובה",
    pickup: "איסוף מרעננה"
  },
  en: {
    skip: "Skip to content",
    gadgets: "Gadgets",
    fridgeToys: "Fridge toys",
    cart: "Cart",
    addToCart: "Add to cart",
    buyNow: "Buy",
    payNow: "Pay now",
    checkout: "Checkout",
    close: "Close",
    qty: "Qty",
    remove: "Remove",
    emptyCart: "Cart is empty",
    subtotal: "Subtotal",
    shipping: "Shipping",
    total: "Total",
    temp: "temp",
    name: "Name",
    phone: "Phone",
    email: "Email",
    street: "Street",
    city: "City",
    postal: "Postal code",
    payment: "Payment",
    placeOrder: "Place order",
    order: "Order",
    bit: "Bit",
    stripe: "Stripe",
    whatsapp: "WhatsApp",
    copy: "Copy",
    langSwitch: "עב",
    terms: "Terms",
    shippingReturns: "Shipping & returns",
    accessibility: "Accessibility",
    back: "Back",
    menu: "Menu",
    required: "Required",
    pickup: "Pickup in Ra'anana"
  }
};

const App = (() => {
  const LANG_KEY = "papaya-lang";
  const CART_KEY = "papaya-cart";
  const ORDER_KEY = "papaya-orders";
  let data = null;
  let lang = "he";

  const $ = (sel, el = document) => el.querySelector(sel);
  const $$ = (sel, el = document) => [...el.querySelectorAll(sel)];

  function t(key) { return (I18N[lang] && I18N[lang][key]) || I18N.he[key] || key; }
  function loc(obj) {
    if (obj == null) return "";
    if (typeof obj === "string") return obj;
    return obj[lang] || obj.he || obj.en || "";
  }
  function formatPrice(n, placeholder) {
    const num = Number(n) || 0;
    const body = '<span class="price-amt" dir="ltr">₪' + num.toLocaleString("en-IL") + "</span>";
    return placeholder
      ? body + ' <span class="temp">' + t("temp") + "</span>"
      : body;
  }
  function getLang() {
    const q = new URLSearchParams(location.search).get("lang");
    if (q === "he" || q === "en") {
      localStorage.setItem(LANG_KEY, q);
      return q;
    }
    const saved = localStorage.getItem(LANG_KEY);
    if (saved === "he" || saved === "en") return saved;
    return (data && data.store && data.store.localeDefault) || "he";
  }
  function setLang(next) {
    lang = next === "en" ? "en" : "he";
    localStorage.setItem(LANG_KEY, lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "he" ? "rtl" : "ltr";
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      el.textContent = t(el.dataset.i18n);
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
      el.placeholder = t(el.dataset.i18nPlaceholder);
    });
    const sw = document.querySelector("[data-lang-switch]");
    if (sw) sw.textContent = t("langSwitch");
  }

  function cart() {
    try { return JSON.parse(localStorage.getItem(CART_KEY) || "[]"); }
    catch { return []; }
  }
  function saveCart(items) {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
    paintCartCount();
  }
  function addToCart(id, qty = 1, replace = false) {
    const items = cart();
    const i = items.findIndex((x) => x.id === id);
    if (i >= 0) items[i].qty = replace ? qty : items[i].qty + qty;
    else items.push({ id, qty });
    saveCart(items.filter((x) => x.qty > 0));
  }
  function setQty(id, qty) {
    const items = cart().map((x) => x.id === id ? { ...x, qty } : x).filter((x) => x.qty > 0);
    saveCart(items);
  }
  function removeItem(id) { saveCart(cart().filter((x) => x.id !== id)); }
  function cartCount() { return cart().reduce((s, x) => s + (x.qty || 0), 0); }
  function product(id) { return (data.products || []).find((p) => p.id === id); }
  function activeProducts() { return (data.products || []).filter((p) => p.active !== false); }
  function productsIn(catId) { return activeProducts().filter((p) => p.category === catId); }
  function category(id) { return (data.categories || []).find((c) => c.id === id); }

  function lineItems() {
    return cart().map((x) => {
      const p = product(x.id);
      if (!p) return null;
      return { ...x, product: p, line: (Number(p.price) || 0) * x.qty };
    }).filter(Boolean);
  }
  function subtotal() { return lineItems().reduce((s, x) => s + x.line, 0); }
  function shippingCost(methodId) {
    const ship = (data.store.shipping || []).find((s) => s.id === methodId);
    if (!ship) return 0;
    const th = Number(data.store.freeShippingThreshold);
    if (methodId !== "pickup" && th && subtotal() >= th) return 0;
    return Number(ship.price) || 0;
  }

  function paintCartCount() {
    $$("[data-cart-count]").forEach((el) => {
      const n = cartCount();
      el.textContent = n;
      el.classList.toggle("is-zero", n === 0);
    });
  }

  function headerHTML() {
    const cats = (data.categories || []).map((c) =>
      `<a href="category.html?id=${encodeURIComponent(c.id)}">${escapeHtml(loc(c.name))}</a>`
    ).join("");
    return `
      <header class="site-header">
        <div class="wrap header-inner">
          <a class="wordmark" href="index.html" dir="ltr"><span class="pp-papaya">Papaya</span> Prints</a>
          <button class="nav-toggle" type="button" aria-expanded="false" data-nav-toggle aria-label="${t("menu")}"><span class="burger" aria-hidden="true"></span></button>
          <nav class="nav-cats" data-nav>${cats}</nav>
          <div class="header-tools">
            <button type="button" class="lang-toggle" data-lang-switch>${t("langSwitch")}</button>
            <button type="button" class="cart-btn" data-open-cart aria-controls="cart-drawer">
              <span data-i18n="cart">${t("cart")}</span>
              <span class="cart-count ${cartCount() ? "" : "is-zero"}" data-cart-count>${cartCount()}</span>
            </button>
          </div>
        </div>
      </header>`;
  }
  function footerHTML() {
    return `
      <footer class="site-footer">
        <div class="wrap footer-inner">
          <span class="footer-name" dir="ltr">Papaya Prints</span>
          <nav class="footer-links">
            <a href="terms.html" data-i18n="terms">${t("terms")}</a>
            <a href="shipping.html" data-i18n="shippingReturns">${t("shippingReturns")}</a>
            <a href="accessibility.html" data-i18n="accessibility">${t("accessibility")}</a>
          </nav>
        </div>
      </footer>`;
  }
  function drawerHTML() {
    return `
      <div class="drawer-backdrop" data-drawer-backdrop hidden></div>
      <aside class="drawer" id="cart-drawer" hidden>
        <div class="drawer-head">
          <h2 data-i18n="cart">${t("cart")}</h2>
          <button type="button" data-close-cart data-i18n="close">${t("close")}</button>
        </div>
        <div class="drawer-body" data-cart-body></div>
        <div class="drawer-foot">
          <div>
            <div class="drawer-total" data-cart-total></div>
          </div>
          <a class="btn btn-primary" href="checkout.html" data-i18n="checkout">${t("checkout")}</a>
        </div>
      </aside>`;
  }

  function paintDrawer() {
    const body = $("[data-cart-body]");
    if (!body) return;
    const items = lineItems();
    if (!items.length) {
      body.innerHTML = `<p class="cart-empty" data-i18n="emptyCart">${t("emptyCart")}</p>`;
    } else {
      body.innerHTML = items.map((x) => `
        <div class="cart-line" data-id="${escapeHtml(x.id)}">
          <a href="product.html?id=${encodeURIComponent(x.id)}"><img src="${escapeHtml(x.product.images[0] || "")}" alt=""></a>
          <div>
            <a class="cart-line-name" href="product.html?id=${encodeURIComponent(x.id)}">${escapeHtml(loc(x.product.name))}</a>
            <div class="cart-line-meta">${formatPrice(x.product.price, x.product.pricePlaceholder)}</div>
            <div class="qty" dir="ltr" style="margin-block-start:.4rem">
              <button type="button" data-qty="-1" aria-label="−">−</button>
              <input type="number" min="1" value="${x.qty}" aria-label="${t("qty")}">
              <button type="button" data-qty="1" aria-label="+">+</button>
            </div>
            <button type="button" class="remove" data-remove data-i18n="remove">${t("remove")}</button>
          </div>
          <div>${formatPrice(x.line, x.product.pricePlaceholder)}</div>
        </div>`).join("");
    }
    const tot = $("[data-cart-total]");
    if (tot) tot.innerHTML = t("total") + " " + formatPrice(subtotal(), items.some((x) => x.product.pricePlaceholder));
    paintCartCount();
  }

  function openCart() {
    const d = $("#cart-drawer");
    const b = $("[data-drawer-backdrop]");
    if (!d || !b) return;
    paintDrawer();
    d.hidden = false; b.hidden = false;
    requestAnimationFrame(() => { d.classList.add("is-open"); b.classList.add("is-open"); });
  }
  function closeCart() {
    const d = $("#cart-drawer");
    const b = $("[data-drawer-backdrop]");
    if (!d || !b) return;
    d.classList.remove("is-open"); b.classList.remove("is-open");
    setTimeout(() => { d.hidden = true; b.hidden = true; }, 280);
  }

  function productCard(p) {
    return `
      <article>
        <a class="card" href="product.html?id=${encodeURIComponent(p.id)}">
          <div class="card-media"><img src="${escapeHtml(p.images[0] || "")}" alt="${escapeHtml(loc(p.name))}" loading="lazy" width="800" height="600"></div>
          <h3 class="card-name">${escapeHtml(loc(p.name))}</h3>
          <p class="card-price">${formatPrice(p.price, p.pricePlaceholder)}</p>
        </a>
      </article>`;
  }

  function param(name) {
    return new URLSearchParams(location.search).get(name) || "";
  }
  function escapeHtml(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function mountChrome() {
    const h = document.getElementById("site-header");
    const f = document.getElementById("site-footer");
    const d = document.getElementById("chrome-drawer");
    if (h) h.outerHTML = headerHTML();
    if (f) f.outerHTML = footerHTML();
    if (d) d.outerHTML = drawerHTML();
    else document.body.insertAdjacentHTML("beforeend", drawerHTML());
    $("[data-lang-switch]")?.addEventListener("click", () => {
      setLang(lang === "he" ? "en" : "he");
      boot(currentPage, { recolor: true });
    });
    $("[data-open-cart]")?.addEventListener("click", openCart);
    $("[data-close-cart]")?.addEventListener("click", closeCart);
    $("[data-drawer-backdrop]")?.addEventListener("click", closeCart);
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeCart(); });
    const toggle = $("[data-nav-toggle]");
    const nav = $("[data-nav]");
    toggle?.addEventListener("click", () => {
      const open = toggle.getAttribute("aria-expanded") !== "true";
      toggle.setAttribute("aria-expanded", String(open));
      nav?.classList.toggle("is-open", open);
    });
    document.addEventListener("click", (e) => {
      const line = e.target.closest?.(".cart-line");
      if (!line) return;
      const id = line.dataset.id;
      if (e.target.closest("[data-remove]")) { removeItem(id); paintDrawer(); return; }
      const qbtn = e.target.closest("[data-qty]");
      if (qbtn) {
        const cur = cart().find((x) => x.id === id);
        setQty(id, Math.max(1, (cur?.qty || 1) + Number(qbtn.dataset.qty)));
        paintDrawer();
      }
    });
    document.addEventListener("change", (e) => {
      const line = e.target.closest?.(".cart-line");
      if (!line || e.target.tagName !== "INPUT") return;
      setQty(line.dataset.id, Math.max(1, parseInt(e.target.value, 10) || 1));
      paintDrawer();
    });
  }

  let currentPage = "home";

  function renderHome() {
    const main = $("#main");
    const tiles = (data.categories || []).map((c) => `
      <a class="cat-tile ${c.image ? "" : "cat-tile-plain"}" href="category.html?id=${encodeURIComponent(c.id)}">
        ${c.image ? `<img src="${escapeHtml(c.image)}" alt="">` : ""}
        <span>${escapeHtml(loc(c.name))}</span>
      </a>`).join("");
    const sections = (data.categories || []).map((c) => {
      const list = productsIn(c.id);
      if (!list.length) return `<section class="wrap"><div class="cat-head"><h2>${escapeHtml(loc(c.name))}</h2></div></section>`;
      return `<section class="wrap">
        <div class="cat-head">
          <h2>${escapeHtml(loc(c.name))}</h2>
        </div>
        <div class="grid">${list.map(productCard).join("")}</div>
      </section>`;
    }).join("");
    main.innerHTML = `<div class="wrap cat-tiles">${tiles}</div>${sections}`;
  }

  function renderCategory() {
    const id = param("id");
    const c = category(id);
    const main = $("#main");
    if (!c) { main.innerHTML = `<div class="wrap"><p>—</p></div>`; return; }
    const list = productsIn(c.id);
    main.innerHTML = `<div class="wrap">
      <h1 class="page-title">${escapeHtml(loc(c.name))}</h1>
      <div class="grid">${list.map(productCard).join("")}</div>
    </div>`;
    document.title = loc(c.name) + " · Papaya Prints";
  }

  function renderProduct() {
    const p = product(param("id"));
    const main = $("#main");
    if (!p || p.active === false) { main.innerHTML = `<div class="wrap"><p>—</p></div>`; return; }
    const thumbs = (p.images || []).map((src, i) =>
      `<button type="button" class="${i === 0 ? "is-active" : ""}" data-thumb="${escapeHtml(src)}"><img src="${escapeHtml(src)}" alt=""></button>`
    ).join("");
    const specs = [`${loc(p.material)}`].concat((p.specs || []).map(loc))
      .map((s) => `<li>${escapeHtml(s)}</li>`).join("");
    const disc = p.disclaimer ? `<p class="disclaimer">${escapeHtml(loc(p.disclaimer))}</p>` : "";
    main.innerHTML = `<div class="wrap product-layout">
      <div class="gallery">
        <div class="gallery-main"><img data-main-img src="${escapeHtml(p.images[0] || "")}" alt="${escapeHtml(loc(p.name))}"></div>
        <div class="thumbs">${thumbs}</div>
      </div>
      <div class="product-info">
        <h1>${escapeHtml(loc(p.name))}</h1>
        <p class="product-price">${formatPrice(p.price, p.pricePlaceholder)}</p>
        <ul class="specs">${specs}</ul>
        <div class="qty" dir="ltr" data-product-qty>
          <button type="button" data-pq="-1">−</button>
          <input type="number" min="1" value="1" aria-label="${t("qty")}">
          <button type="button" data-pq="1">+</button>
        </div>
        <div class="buy-row">
          <button type="button" class="btn btn-ghost" data-add data-i18n="addToCart">${t("addToCart")}</button>
          <button type="button" class="btn btn-primary" data-buy data-i18n="buyNow">${t("buyNow")}</button>
        </div>
        ${disc}
      </div>
    </div>`;
    document.title = loc(p.name) + " · Papaya Prints";
    $$("[data-thumb]").forEach((b) => b.addEventListener("click", () => {
      $("[data-main-img]").src = b.dataset.thumb;
      $$("[data-thumb]").forEach((x) => x.classList.toggle("is-active", x === b));
    }));
    const box = $("[data-product-qty]");
    const input = $("input", box);
    box.addEventListener("click", (e) => {
      const d = e.target.closest("[data-pq]");
      if (!d) return;
      input.value = Math.max(1, (parseInt(input.value, 10) || 1) + Number(d.dataset.pq));
    });
    $("[data-add]").addEventListener("click", () => {
      addToCart(p.id, Math.max(1, parseInt(input.value, 10) || 1));
      openCart();
    });
    $("[data-buy]").addEventListener("click", () => {
      addToCart(p.id, Math.max(1, parseInt(input.value, 10) || 1));
      location.href = "checkout.html";
    });
  }

  function renderCheckout() {
    const main = $("#main");
    const items = lineItems();
    const shippingOpts = (data.store.shipping || []).map((s) => `
      <label class="choice">
        <span><input type="radio" name="shipping" value="${escapeHtml(s.id)}" ${s.id === "pickup" ? "checked" : ""}> ${escapeHtml(loc(s.name))}</span>
        <span>${formatPrice(s.price, s.pricePlaceholder)}</span>
      </label>`).join("");
    main.innerHTML = `<div class="wrap checkout-grid">
      <form class="form" id="checkout-form">
        <h1 class="page-title" data-i18n="checkout">${t("checkout")}</h1>
        <label>${t("name")} <input name="name" type="text" required autocomplete="name"></label>
        <label>${t("phone")} <input name="phone" type="tel" required autocomplete="tel"></label>
        <label>${t("email")} <input name="email" type="email" required autocomplete="email"></label>
        <label>${t("street")} <input name="street" type="text" autocomplete="street-address"></label>
        <label>${t("city")} <input name="city" type="text" autocomplete="address-level2"></label>
        <label>${t("postal")} <input name="postal" type="text" autocomplete="postal-code"></label>
        <fieldset class="choices">
          <legend>${t("shipping")}</legend>
          ${shippingOpts}
        </fieldset>
        <fieldset class="choices">
          <legend>${t("payment")}</legend>
          <label class="choice"><span><input type="radio" name="payment" value="stripe" checked> ${t("stripe")}</span></label>
          <label class="choice"><span><input type="radio" name="payment" value="bit"> ${t("bit")}</span></label>
        </fieldset>
        <button class="btn btn-primary" type="submit" data-i18n="placeOrder">${t("placeOrder")}</button>
      </form>
      <aside class="summary" data-summary></aside>
    </div>`;
    const paintSum = () => {
      const method = document.querySelector("input[name=shipping]:checked")?.value || "pickup";
      const ship = shippingCost(method);
      const ph = items.some((x) => x.product.pricePlaceholder) ||
        (data.store.shipping || []).find((s) => s.id === method)?.pricePlaceholder ||
        (method !== "pickup" && data.store.freeShippingThresholdPlaceholder && ship === 0);
      $("[data-summary]").innerHTML = `
        <h2 data-i18n="cart">${t("cart")}</h2>
        ${items.map((x) => `<div class="sum-line"><span>${escapeHtml(loc(x.product.name))} × ${x.qty}</span><span>${formatPrice(x.line, x.product.pricePlaceholder)}</span></div>`).join("") || `<p class="cart-empty">${t("emptyCart")}</p>`}
        <div class="sum-line"><span data-i18n="subtotal">${t("subtotal")}</span><span>${formatPrice(subtotal(), ph)}</span></div>
        <div class="sum-line"><span data-i18n="shipping">${t("shipping")}</span><span>${formatPrice(ship, ph)}</span></div>
        <div class="sum-total"><span data-i18n="total">${t("total")}</span><span>${formatPrice(subtotal() + ship, ph)}</span></div>`;
    };
    paintSum();
    main.addEventListener("change", (e) => { if (e.target.name === "shipping") paintSum(); });
    $("#checkout-form")?.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!items.length) return;
      const fd = new FormData(e.target);
      const method = fd.get("shipping") || "pickup";
      const ship = shippingCost(method);
      const order = {
        id: makeOrderId(),
        created: new Date().toISOString(),
        name: String(fd.get("name") || ""),
        phone: String(fd.get("phone") || ""),
        email: String(fd.get("email") || ""),
        street: String(fd.get("street") || ""),
        city: String(fd.get("city") || ""),
        postal: String(fd.get("postal") || ""),
        shipping: method,
        payment: String(fd.get("payment") || "stripe"),
        items: items.map((x) => ({ id: x.id, name: x.product.name, qty: x.qty, price: x.product.price, stripeLink: x.product.stripeLink || "" })),
        subtotal: subtotal(),
        shippingCost: ship,
        total: subtotal() + ship
      };
      const all = loadOrders();
      all.push(order);
      localStorage.setItem(ORDER_KEY, JSON.stringify(all));
      saveCart([]);
      location.href = "order.html?id=" + encodeURIComponent(order.id);
    });
  }

  function makeOrderId() {
    const d = new Date();
    const p = (n) => String(n).padStart(2, "0");
    const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
    return "PP-" + d.getFullYear() + p(d.getMonth() + 1) + p(d.getDate()) + "-" + rand;
  }
  function loadOrders() {
    try { return JSON.parse(localStorage.getItem(ORDER_KEY) || "[]"); }
    catch { return []; }
  }

  function renderOrder() {
    const order = loadOrders().find((o) => o.id === param("id"));
    const main = $("#main");
    if (!order) { main.innerHTML = `<div class="wrap"><p>—</p></div>`; return; }
    const wa = data.store.whatsapp || "";
    const bit = data.store.bitPhone || "";
    const lines = order.items.map((x) => `${loc(x.name)} × ${x.qty} — ₪${x.price * x.qty}`).join("\n");
    const waText = encodeURIComponent(`${order.id}\n${lines}\n₪${order.total}`);
    const waBtn = wa ? `<a class="btn btn-ghost" target="_blank" rel="noopener" href="https://wa.me/${wa}?text=${waText}">${t("whatsapp")}</a>` : "";
    const uniqueLinks = [...new Set(order.items.map((x) => x.stripeLink).filter(Boolean))];
    const multi = data.store.stripe && data.store.stripe.multiItemLink;
    let stripeBtns = "";
    if (order.payment === "stripe" || true) {
      if (uniqueLinks.length === 1 && (order.items.length === 1 || order.items.every((x) => x.stripeLink === uniqueLinks[0]))) {
        stripeBtns = `<a class="btn btn-primary" href="${escapeHtml(uniqueLinks[0])}" target="_blank" rel="noopener">${t("payNow")}</a>`;
      } else if (multi) {
        stripeBtns = `<a class="btn btn-primary" href="${escapeHtml(multi)}" target="_blank" rel="noopener">${t("payNow")}</a>`;
      } else if (uniqueLinks.length > 1) {
        stripeBtns = uniqueLinks.map((u, i) => `<a class="btn btn-primary" href="${escapeHtml(u)}" target="_blank" rel="noopener">${t("payNow")} ${i + 1}</a>`).join("");
      }
    }
    const bitBox = bit ? `<div class="bit-box" dir="ltr">
        <div>Bit</div>
        <div data-copy="${escapeHtml(bit)}">${escapeHtml(bit)}</div>
        <div>₪${order.total}</div>
        <div>${escapeHtml(order.id)}</div>
        <button type="button" class="btn btn-text" data-copy-btn data-copy="${escapeHtml(bit + " ₪" + order.total + " " + order.id)}">${t("copy")}</button>
      </div>` : "";
    const shipName = loc((data.store.shipping || []).find((s) => s.id === order.shipping)?.name || order.shipping);
    main.innerHTML = `<div class="wrap" style="max-inline-size:640px">
      <h1 class="page-title" data-i18n="order">${t("order")}</h1>
      <p class="order-id" dir="ltr">${escapeHtml(order.id)}</p>
      <div class="summary">
        ${order.items.map((x) => `<div class="sum-line"><span>${escapeHtml(loc(x.name))} × ${x.qty}</span><span>₪${x.price * x.qty}</span></div>`).join("")}
        <div class="sum-line"><span>${t("shipping")}</span><span>${escapeHtml(shipName)} · ₪${order.shippingCost}</span></div>
        <div class="sum-total"><span>${t("total")}</span><span>₪${order.total}</span></div>
      </div>
      ${bitBox}
      <div class="pay-row">
        ${stripeBtns}
        ${bit ? `<span class="btn btn-ghost" style="pointer-events:none">${t("bit")}</span>` : ""}
        ${waBtn}
      </div>
    </div>`;
    $$("[data-copy-btn]").forEach((b) => b.addEventListener("click", () => {
      navigator.clipboard?.writeText(b.dataset.copy || "");
    }));
  }

  function renderLegal() { /* content is in the page, just set lang texts already in HTML */ }

  async function loadData() {
    const res = await fetch("products.json", { cache: "no-store" });
    data = await res.json();
    return data;
  }

  let currentPageName = "home";
  async function boot(page, opts = {}) {
    currentPage = page;
    currentPageName = page;
    if (!data || opts.reload) await loadData();
    lang = getLang();
    setLang(lang);
    if (!opts.recolor) {
      // first mount only
    }
    // Always remount chrome so category names follow language
    // Remove existing header/footer/drawer if recolor
    if (opts.recolor) {
      document.querySelector(".site-header")?.remove();
      document.querySelector(".site-footer")?.remove();
      document.querySelector(".drawer")?.remove();
      document.querySelector(".drawer-backdrop")?.remove();
      const hs = document.createElement("div"); hs.id = "site-header";
      const fs = document.createElement("div"); fs.id = "site-footer";
      document.body.insertBefore(hs, document.body.firstChild);
      document.body.appendChild(fs);
    }
    mountChrome();
    if (page === "home") renderHome();
    else if (page === "category") renderCategory();
    else if (page === "product") renderProduct();
    else if (page === "checkout") renderCheckout();
    else if (page === "order") renderOrder();
    else if (page === "legal") {
      document.querySelectorAll("[data-lang]").forEach((el) => {
        el.hidden = el.dataset.lang !== lang;
      });
    }
    paintCartCount();
  }

  return { boot, t, loc, formatPrice, loadData, get data() { return data; }, get lang() { return lang; }, setLang, getLang };
})();
