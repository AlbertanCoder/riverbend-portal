/* portal.js — resident portal rendering (CSP-safe: no inline styles). */
(async function () {
  const gate = document.getElementById("gate");
  const content = document.getElementById("content");

  let data;
  try {
    data = await RB.api("/api/portal/household");
  } catch (err) {
    gate.classList.remove("hidden");
    return;
  }
  content.classList.remove("hidden");

  const r = data.resident, h = data.household;
  document.getElementById("welcome").textContent =
    "Welcome, " + r.first_name + " " + r.last_name;
  document.getElementById("welcome-sub").textContent =
    h ? h.civic_address + " · " + h.neighbourhood + " · " + h.postal_code
      : "No household linked.";

  const props = data.properties || [];
  const primary = props[0] || {};
  document.getElementById("k-address").textContent = h ? h.civic_address : "—";
  document.getElementById("k-assessed").textContent = primary.assessed_value != null
    ? RB.money(primary.assessed_value) : "—";
  document.getElementById("k-taxstatus").innerHTML =
    primary.tax_status ? RB.taxBadge(primary.tax_status) : "—";
  const utilTotal = (data.utilities || []).reduce((sum, u) => sum + (u.balance || 0), 0);
  document.getElementById("k-balance").textContent = RB.money(utilTotal);

  const rt = document.querySelector("#resident-table tbody");
  rt.innerHTML = [
    ["Date of birth", r.date_of_birth],
    ["Occupation", r.occupation],
    ["Education", r.education],
    ["Employer", r.employer],
    ["Property owner", r.is_property_owner ? "Yes" : "No (tenant)"],
    ["Record number", r.id],
  ].map(([k, v]) =>
    "<tr><th class=\"nowrap\">" + RB.esc(k) + "</th><td>" + RB.esc(v) + "</td></tr>").join("");

  const ct = document.querySelector("#contact-table tbody");
  const c = r.contact || {};
  ct.innerHTML = [
    ["Email", c.email], ["Phone", c.phone],
    ["Mailing address", c.mailing_address], ["Sector", c.sector],
  ].map(([k, v]) =>
    "<tr><th class=\"nowrap\">" + RB.esc(k) + "</th><td>" + RB.esc(v) + "</td></tr>").join("");
  document.getElementById("cipher-preview").textContent =
    (r.encryption && r.encryption.ciphertext_preview) || "n/a";

  const pt = document.querySelector("#props-table tbody");
  pt.innerHTML = props.map((p) =>
    "<tr>" +
    "<td class=\"mono\">" + RB.esc(p.parcel_id) + "</td>" +
    "<td>" + RB.esc(p.land_use) + "</td>" +
    "<td class=\"num\">" + RB.money(p.assessed_value) + "</td>" +
    "<td class=\"num\">" + RB.money(p.tax_levied) + "</td>" +
    "<td class=\"num\">" + RB.money(p.tax_paid) + "</td>" +
    "<td>" + RB.taxBadge(p.tax_status) + "</td>" +
    "</tr>").join("") ||
    "<tr><td colspan=\"6\" class=\"muted\">No properties linked.</td></tr>";

  const ut = document.querySelector("#utils-table tbody");
  ut.innerHTML = (data.utilities || []).map((u) =>
    "<tr>" +
    "<td class=\"mono\">" + RB.esc(u.account_number) + "</td>" +
    "<td>" + RB.esc(String(u.service).replace("_", " / ")) + "</td>" +
    "<td class=\"num\">" + RB.money(u.balance) + "</td>" +
    "<td>" + (u.status === "arrears"
      ? "<span class=\"badge badge-warn\">arrears</span>"
      : "<span class=\"badge badge-ok\">" + RB.esc(u.status) + "</span>") + "</td>" +
    "</tr>").join("") ||
    "<tr><td colspan=\"4\" class=\"muted\">No utility accounts linked.</td></tr>";
})();