/* search.js — public resident directory search. */
document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const q = (params.get("q") || "").trim();
  const input = document.getElementById("q-page");
  const resultsBody = document.querySelector("#results-table tbody");
  const status = document.getElementById("search-status");
  const count = document.getElementById("search-count");
  input.value = q;

  try {
    const data = await RB.api("/api/public/directory?q=" + encodeURIComponent(q) + "&size=25");
    count.textContent = RB.num(data.total) + " resident" + (data.total === 1 ? "" : "s") +
      (q ? " matching “" + q + "”" : " on file");
    status.textContent = data.notice;
    resultsBody.innerHTML = data.results.map((r) =>
      "<tr>" +
      "<td>" + RB.esc(r.name) + "</td>" +
      "<td>" + RB.esc(r.occupation) + "</td>" +
      "<td>" + RB.esc(r.education) + "</td>" +
      "<td>" + RB.esc(r.civic_address || "—") + "</td>" +
      "<td>" + RB.esc(r.neighbourhood || "—") + "</td>" +
      "</tr>").join("") ||
      "<tr><td colspan=\"5\" class=\"muted\">No residents matched your search.</td></tr>";
  } catch (err) {
    document.getElementById("search-gate").classList.remove("hidden");
    document.getElementById("search-panel").classList.add("hidden");
  }
});