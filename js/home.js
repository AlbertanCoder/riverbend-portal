/* home.js — landing-page counters. */
document.addEventListener("DOMContentLoaded", () => {
  RB.api("/api/stats/public").then((s) => {
    document.getElementById("stat-residents").textContent = RB.num(s.residents);
    document.getElementById("stat-households").textContent = RB.num(s.households);
    document.getElementById("stat-properties").textContent = RB.num(s.properties);
  }).catch(() => {});
});