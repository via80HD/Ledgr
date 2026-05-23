// tripcalc.js

function formatMoney(n) {
  if (isNaN(n)) return "$0.00";
  return "$" + n.toFixed(2);
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("trip-form");
  const resultsCard = document.getElementById("trip-results");
  const profitSection = document.getElementById("profit-section");

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const distance = parseFloat(document.getElementById("trip-distance").value || "0");
    const hours = parseFloat(document.getElementById("trip-hours").value || "0");
    const mpg = parseFloat(document.getElementById("trip-mpg").value || "0");
    const gasPrice = parseFloat(document.getElementById("trip-gas-price").value || "0");
    const payoutRaw = document.getElementById("trip-payout").value;
    const payout = payoutRaw ? parseFloat(payoutRaw) : null;

    if (!distance || !mpg || !gasPrice) {
      alert("Distance, MPG, and gas price are required.");
      return;
    }

    const gallons = distance / mpg;
    const gasCost = gallons * gasPrice;
    const distanceRT = distance * 2;
    const gasCostRT = gasCost * 2;
    const gasPerMile = gasCost / distance;

    document.getElementById("res-distance").textContent = distance.toFixed(1) + " mi";
    document.getElementById("res-distance-rt").textContent = distanceRT.toFixed(1) + " mi";
    document.getElementById("res-gallons").textContent = gallons.toFixed(2) + " gal";
    document.getElementById("res-gas-cost").textContent = formatMoney(gasCost);
    document.getElementById("res-gas-cost-rt").textContent = formatMoney(gasCostRT);
    document.getElementById("res-gas-per-mile").textContent =
      "$" + gasPerMile.toFixed(3);
    document.getElementById("res-hours").textContent = hours
      ? hours.toFixed(1) + " h"
      : "–";

    // Profit section (optional payout)
    if (payout !== null && !isNaN(payout)) {
      const profit = payout - gasCost;
      const profitPerMile = profit / distance;
      const profitPerHour = hours ? profit / hours : null;

      document.getElementById("res-profit").textContent = formatMoney(profit);
      document.getElementById("res-profit-per-mile").textContent =
        "$" + profitPerMile.toFixed(3);
      document.getElementById("res-profit-per-hour").textContent = profitPerHour
        ? formatMoney(profitPerHour)
        : "–";

      profitSection.hidden = false;
    } else {
      profitSection.hidden = true;
    }

    resultsCard.hidden = false;
  });
});
