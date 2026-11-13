/* Client-side admin. Not real security. Token never leaves the browser except to api.github.com. */
const Admin = (() => {
  const TOKEN_KEY = "papaya-gh-token";
  let draft = null;

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  async function sha256(text) {
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
    return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  function msg(text, err) {
    const el = $("[data-admin-msg]");
    if (!el) return;
    el.textContent = text || "";
    el.classList.toggle("is-err", !!err);
  }

  function locName(p) {
    return (p.name && (p.name[App.lang] || p.name.he || p.name.en)) || p.id;
  }

  function paint() {
    const store = draft.store;
    $("[name=whatsapp]").value = store.whatsapp || "";
    $("[name=bitPhone]").value = store.bitPhone || "";
    $("[name=stripeMulti]").value = (store.stripe && store.stripe.multiItemLink) || "";
    $("[name=freeShip]").value = store.freeShippingThreshold ?? "";
    const shipBox = $("[data-shipping]");
    shipBox.innerHTML = (store.shipping || []).map((s) => `
      <label>${s.name?.he || s.id} / ${s.name?.en || ""}
        <input type="number" min="0" step="1" data-ship="${s.id}" value="${s.price}">
      </label>`).join("");
    const list = $("[data-products]");
    list.innerHTML = (draft.products || []).map((p) => `
      <div class="admin-product" data-pid="${p.id}">
        <img src="${p.images?.[0] || ""}" alt="">
        <div>${locName(p)}<div class="note">${p.id} · ${p.category}</div></div>
        <label>₪ <input type="number" min="0" step="1" data-price value="${p.price}"></label>
        <label>Stripe <input type="url" data-stripe value="${p.stripeLink || ""}" placeholder="https://buy.stripe.com/…"></label>
        <label><input type="checkbox" data-active ${p.active !== false ? "checked" : ""}> on</label>
      </div>`).join("");
    $("[data-login]").hidden = true;
    $("[data-app]").hidden = false;
  }

  function collect() {
    draft.store.whatsapp = $("[name=whatsapp]").value.trim();
    draft.store.bitPhone = $("[name=bitPhone]").value.trim();
    draft.store.stripe = draft.store.stripe || {};
    draft.store.stripe.multiItemLink = $("[name=stripeMulti]").value.trim();
    const fs = $("[name=freeShip]").value;
    draft.store.freeShippingThreshold = fs === "" ? 0 : Number(fs);
    $$("[data-ship]").forEach((inp) => {
      const s = draft.store.shipping.find((x) => x.id === inp.dataset.ship);
      if (s) s.price = Number(inp.value) || 0;
    });
    $$(".admin-product").forEach((row) => {
      const p = draft.products.find((x) => x.id === row.dataset.pid);
      if (!p) return;
      p.price = Number($("[data-price]", row).value) || 0;
      p.stripeLink = $("[data-stripe]", row).value.trim();
      p.active = $("[data-active]", row).checked;
    });
  }

  function download() {
    collect();
    const blob = new Blob([JSON.stringify(draft, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "products.json";
    a.click();
    URL.revokeObjectURL(a.href);
  }

  async function publish() {
    collect();
    const token = $("[name=token]").value.trim() || localStorage.getItem(TOKEN_KEY) || "";
    if (!token) { msg(App.lang === "he" ? "דרוש טוקן" : "Token required", true); return; }
    localStorage.setItem(TOKEN_KEY, token);
    const gh = draft.store.github;
    if (!gh) { msg("github config missing", true); return; }
    const body = JSON.stringify(draft, null, 2);
    const encoded = btoa(unescape(encodeURIComponent(body)));
    const headers = { Authorization: "Bearer " + token, Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" };
    const results = [];
    for (const target of gh.paths) {
      const url = `https://api.github.com/repos/${gh.owner}/${gh.repo}/contents/${target.path}?ref=${encodeURIComponent(target.branch)}`;
      const cur = await fetch(url, { headers });
      const json = await cur.json();
      if (!cur.ok && cur.status !== 404) {
        msg((json && json.message) || ("GitHub " + cur.status), true);
        return;
      }
      const put = await fetch(`https://api.github.com/repos/${gh.owner}/${gh.repo}/contents/${target.path}`, {
        method: "PUT",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({
          message: "Update catalog prices",
          content: encoded,
          branch: target.branch,
          sha: json.sha
        })
      });
      const out = await put.json();
      if (!put.ok) { msg((out && out.message) || ("GitHub " + put.status), true); return; }
      results.push(target.branch + ":" + target.path);
    }
    msg(results.join(" · "));
  }

  async function login(ev) {
    ev.preventDefault();
    const pass = $("[name=password]").value;
    const hash = await sha256(pass);
    const expected = (App.data && App.data.store && App.data.store.adminPasswordHash) || "";
    if (hash !== expected) { msg(App.lang === "he" ? "סיסמה שגויה" : "Wrong password", true); return; }
    sessionStorage.setItem("papaya-admin", "1");
    draft = structuredClone(App.data);
    const saved = localStorage.getItem(TOKEN_KEY);
    if (saved) $("[name=token]").value = saved;
    msg("");
    paint();
  }

  async function init() {
    await App.boot("legal");
    $("[data-app]").hidden = true;
    document.title = "Admin · Papaya Prints";
    if (sessionStorage.getItem("papaya-admin") === "1") {
      draft = structuredClone(App.data);
      const saved = localStorage.getItem(TOKEN_KEY);
      if (saved) $("[name=token]").value = saved;
      paint();
    }
    $("[data-login-form]")?.addEventListener("submit", login);
    $("[data-download]")?.addEventListener("click", download);
    $("[data-publish]")?.addEventListener("click", (e) => { e.preventDefault(); publish(); });
    $("[data-logout]")?.addEventListener("click", () => {
      sessionStorage.removeItem("papaya-admin");
      location.reload();
    });
  }

  return { init };
})();
document.addEventListener("DOMContentLoaded", () => Admin.init());
