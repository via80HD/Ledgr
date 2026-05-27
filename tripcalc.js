// tripcalc.js

function formatMoney(n) {
  if (isNaN(n)) return "$0.00";
  return "$" + n.toFixed(2);
}

// Helper to look up GPS coordinates for a written location name using OpenStreetMap
async function getCoords(locationText) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(locationText)}`;
  const response = await fetch(url, {
    headers: { "User-Agent": "LedgrTripCalcApp/1.0" } // Required by OpenStreetMap terms
  });
  if (!response.ok) throw new Error("Location lookup failed");
  const data = await response.json();
  if (data.length === 0) throw new Error(`Could not find location: "${locationText}"`);
  return {
    lat: data[0].lat,
    lon: data[0].lon
  };
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("trip-form");
  const resultsCard = document.getElementById("trip-results");
  const profitSection = document.getElementById("profit-section");
  const messageBar = document.getElementById("calc-message");
  const calcBtn = document.getElementById("calc-btn");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Grab inputs
    const startText = document.getElementById("trip-start").value.trim();
    const endText = document.getElementById("trip-end").value.trim();
    const mpg = parseFloat(document.getElementById("trip-mpg").value || "0");
    const gasPrice = parseFloat(document.getElementById("trip-gas-price").value || "0");
    const payoutRaw = document.getElementById("trip-payout").value;
    const payout = payoutRaw ? parseFloat(payoutRaw) : null;

    if (!startText || !endText || !mpg || !gasPrice) {
      alert("Start, End, MPG, and Gas Price are all required.");
      return;
    }

    // Show loading state, hide previous results, disable button
    messageBar.textContent = "Calculating driving route details...";
    messageBar.className = "summary-item"; // Use style class from CSS
    messageBar.style.color = "var(--accent)";
    resultsCard.hidden = true;
    calcBtn.disabled = true;

    try {
      // Step 1: Get GPS coordinates for both points in parallel
      const [startCoords, endCoords] = await Promise.all([
        getCoords(startText),
        getCoords(endText)
      ]);

      // Step 2: Fetch the driving route distance and duration from OSRM Router
      const routeUrl = `https://router.project-osrm.org/route/v1/driving/${startCoords.lon},${startCoords.lat};${endCoords.lon},${endCoords.lat}?overview=false`;
      const routeResponse = await fetch(routeUrl);
      if (!routeResponse.ok) throw new Error("Routing machine calculation failed");
      
      const routeData = await routeResponse.json();
      if (!routeData.routes || routeData.routes.length === 0) {
        throw new Error("No driving route could be found between these points.");
      }

      // OSRM returns distance in meters and duration in seconds
      const distanceMeters = routeData.routes[0].distance;
      const durationSeconds = routeData.routes[0].duration;

      // Convert to Miles and Hours
      const distance = distanceMeters * 0.000621371;
      const hours = durationSeconds / 3600;

      // Step 3: Run your core calculations
      const gallons = distance / mpg;
      const gasCost = gallons * gasPrice;
      const distanceRT = distance * 2;
      const gasCostRT = gasCost * 2;
      const gasPerMile = gasCost / distance;

      // Step 4: Inject data directly into the results table
      document.getElementById("res-distance").textContent = distance.toFixed(1) + " mi";
      document.getElementById("res-distance-rt").textContent = distanceRT.toFixed(1) + " mi";
      document.getElementById("res-gallons").textContent = gallons.toFixed(2) + " gal";
      document.getElementById("res-gas-cost").textContent = formatMoney(gasCost);
      document.getElementById("res-gas-cost-rt").textContent = formatMoney(gasCostRT);
      document.getElementById("res-gas-per-mile").textContent = "$" + gasPerMile.toFixed(3);
      document.getElementById("res-hours").textContent = hours.toFixed(1) + " h";

      // Profit section handling (optional payload)
      if (payout !== null && !isNaN(payout)) {
        const profit = payout - gasCost;
        const profitPerMile = profit / distance;
        const profitPerHour = hours ? profit / hours : null;

        document.getElementById("res-profit").textContent = formatMoney(profit);
        document.getElementById("res-profit-per-mile").textContent = "$" + profitPerMile.toFixed(3);
        document.getElementById("res-profit-per-hour").textContent = profitPerHour ? formatMoney(profitPerHour) : "–";

        profitSection.hidden = false;
      } else {
        profitSection.hidden = true;
      }

      // Hide the loading message and reveal results card
      messageBar.className = "hidden";
      resultsCard.hidden = false;

    } catch (err) {
      // Handle lookup or routing failures gracefully
      messageBar.textContent = "Error: " + err.message;
      messageBar.style.color = "var(--danger)";
    } finally {
      // Re-enable the button regardless of success or failure
      calcBtn.disabled = false;
    }
  });
});
