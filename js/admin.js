/* admin.js — staff console rendering (CSP-safe: no inline styles). */
(async function () {
  const gate = document.getElementById("gate");
  const content = document.getElementById("content");
  try {
    const me = await RB.api("/api/auth/me");
    if (me.user.role === "resident") throw new Error("staff only");
  } catch (err) {
    gate.classList.remove("hidden");
    return;
  }
  content.classList.remove("hidden");

  const k = await RB.api("/api/admin/kpis");
  document.getElementById("k-residents").textContent = RB.num(k.residents);
  document.getElementById("k-households").textContent = RB.num(k.households);
  document.getElementById("k-levied").textContent = RB.money(k.tax_levied);
  document.getElementById("k-rate").textContent = k.collection_rate + "%";

  document.querySelector("#status-table tbody").innerHTML =
    Object.entries(k.properties_by_tax_status).map(([s, n]) =>
      "<tr><td>" + RB.taxBadge(s) + "</td><td class=\"num\">" + RB.num(n) + "</td></tr>").join("");

  document.querySelector("#jobs-table tbody").innerHTML =
    k.top_occupations.map((j) =>
      "<tr><td>" + RB.esc(j.occupation) + "</td><td class=\"num\">" + RB.num(j.n) + "</td></tr>").join("");

  document.querySelector("#edu-table tbody").innerHTML =
    k.education_breakdown.map((e) =>
      "<tr><td>" + RB.esc(e.education) + "</td><td class=\"num\">" + RB.num(e.n) + "</td></tr>").join("");

  let page = 1;
  const size = 15;
  async function loadRoll() {
    const status = document.getElementById("f-status").value;
    const use = document.getElementById("f-use").value;
    const q = new URLSearchParams({ page, size });
    if (status) q.set("status", status);
    if (use) q.set("land_use", use);
    const data = await RB.api("/api/admin/tax-roll?" + q.toString());
    document.querySelector("#roll-table tbody").innerHTML =
      data.results.map((row) =>
        "<tr>" +
        "<td class=\"mono\">" + RB.esc(row.parcel_id) + "</td>" +
        "<td>" + RB.esc(row.civic_address) + "</td>" +
        "<td>" + RB.esc(row.owner || "—") + "</td>" +
        "<td>" + RB.esc(row.land_use) + "</td>" +
        "<td class=\"num\">" + RB.money(row.assessed_value) + "</td>" +
        "<td class=\"num\">" + RB.money(row.tax_levied) + "</td>" +
        "<td class=\"num\">" + RB.money(row.tax_paid) + "</td>" +
        "<td>" + RB.taxBadge(row.tax_status) + "</td>" +
        "</tr>").join("") ||
      "<tr><td colspan=\"8\" class=\"muted\">No parcels match these filters.</td></tr>";
    const pages = Math.max(1, Math.ceil(data.total / size));
    document.getElementById("page-info").textContent =
      "Page " + data.page + " of " + pages + " · " + RB.num(data.total) + " parcels";
    document.getElementById("page-prev").disabled = page <= 1;
    document.getElementById("page-next").disabled = page >= pages;
  }
  document.getElementById("f-apply").addEventListener("click", () => { page = 1; loadRoll(); });
  document.getElementById("f-clear").addEventListener("click", () => {
    document.getElementById("f-status").value = "";
    document.getElementById("f-use").value = "";
    page = 1; loadRoll();
  });
  document.getElementById("page-prev").addEventListener("click", () => { if (page > 1) { page--; loadRoll(); } });
  document.getElementById("page-next").addEventListener("click", () => { page++; loadRoll(); });
  await loadRoll();

  async function loadAudit() {
    const data = await RB.api("/api/admin/audit");
    const v = data.verification;
    document.getElementById("audit-status").innerHTML = v.ok
      ? "<span class=\"badge badge-ok\">Chain consistent</span> " + RB.num(v.checked) +
        " entries verified. <span class=\"muted\">" + RB.esc(v.message) + "</span>"
      : "<span class=\"badge badge-bad\">Chain broken</span> First bad entry: #" +
        v.first_bad_id + ". <span class=\"muted\">" + RB.esc(v.message) + "</span>";
    document.querySelector("#audit-table tbody").innerHTML =
      data.recent.map((e) =>
        "<tr>" +
        "<td class=\"nowrap\">" + RB.esc(e.ts) + "</td>" +
        "<td>" + RB.esc(e.actor) + "</td>" +
        "<td>" + RB.esc(e.action) + "</td>" +
        "<td>" + RB.esc(e.detail) + "</td>" +
        "<td class=\"mono\">" + RB.esc(String(e.entry_hash).slice(0, 16)) + "…</td>" +
        "</tr>").join("");
  }
  document.getElementById("audit-verify").addEventListener("click", loadAudit);
  await loadAudit();
})();