// ledger.js

const STORAGE_KEY = "ledgr_entries_v2";
const TANK_SIZE = 20.5; // gallons
const DEFAULT_MPG = 26; // used for first fill-up

function loadEntries() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveEntries(entries) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

function formatMoney(n) {
  return "$" + n.toFixed(2);
}

function showField(id, show) {
  document.getElementById(id).classList.toggle("hidden", !show);
}

function updateFormFields() {
  const type = document.getElementById("entry-type").value;

  // Reset amount field wrapper
  const amountField = document.getElementById("amount-field");
  amountField.innerHTML = "";

  if (type === "other") {
    // Forced negative sign UI
    amountField.innerHTML = `
      <div class="neg-wrapper">
        <span class="neg-prefix">- $</span>
        <input type="number" id="entry-amount" step="0.01" />
      </div>
    `;
  } else {
    amountField.innerHTML = `
      <input type="number" id="entry-amount" step="0.01" />
    `;
  }

  // Gas fields
  const isGas = type === "gas";
  showField("ppg-wrapper", isGas);
  showField("odo-wrapper", isGas);
  showField("mte-wrapper", isGas);
}

function calculateMPG(entries) {
  let totalMiles = 0;
  let totalGallons = 0;
  let lastOdo = null;
  let lastMPG = DEFAULT_MPG;

  entries.forEach((e) => {
    if (e.type === "gas") {
      if (lastOdo !== null) {
        const miles = e.odo - lastOdo;
        const remainingGallons = e.mte / lastMPG;
        const gallonsAdded = TANK_SIZE - remainingGallons;

        if (gallonsAdded > 0) {
          const mpg = miles / gallonsAdded;
          e.calcMPG = mpg;
          totalMiles += miles;
          totalGallons += gallonsAdded;
          lastMPG = mpg;
        }
      }
      lastOdo = e.odo;
    }
  });

  return { totalMiles, totalGallons };
}

function render(entries) {
  const tbody = document.getElementById("ledger-body");
  tbody.innerHTML = "";

  let sumPayout = 0;
  let sumGas = 0;
  let sumOther = 0;

  entries.forEach((e, idx) => {
    if (e.type === "payout") sumPayout += e.amount;
    if (e.type === "gas") sumGas += e.amount;
    if (e.type === "other") sumOther += e.amount;

    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${e.date}</td>
      <td>${e.type}</td>
      <td>${formatMoney(e.amount)}</td>
      <td>${e.odo ?? ""}</td>
      <td>${e.mte ?? ""}</td>
      <td>${e.calcMPG ? e.calcMPG.toFixed(1) : ""}</td>
      <td>${e.notes || ""}</td>
      <td><button data-del="${idx}">X</button></td>
    `;

    tbody.appendChild(tr);
  });

  // MPG summary
  const { totalMiles, totalGallons } = calculateMPG(entries);
  const mpg = totalGallons > 0 ? totalMiles / totalGallons : null;
  const gasPerMile = totalMiles > 0 ? sumGas / totalMiles : null;

  document.getElementById("sum-payout").textContent = formatMoney(sumPayout);
  document.getElementById("sum-gas").textContent = formatMoney(sumGas);
  document.getElementById("sum-other").textContent = formatMoney(sumOther);
  document.getElementById("sum-net").textContent = formatMoney(sumPayout + sumOther - sumGas);

  document.getElementById("sum-miles").textContent = totalMiles.toFixed(1);
  document.getElementById("sum-gallons").textContent = totalGallons.toFixed(2);
  document.getElementById("sum-mpg").textContent = mpg ? mpg.toFixed(1) : "–";
  document.getElementById("sum-gas-per-mile").textContent = gasPerMile ? "$" + gasPerMile.toFixed(3) : "–";

  // Delete buttons
  document.querySelectorAll("[data-del]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const updated = entries.slice();
      updated.splice(btn.dataset.del, 1);
      saveEntries(updated);
      render(updated);
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const entries = loadEntries();
  render(entries);

  updateFormFields();
  document.getElementById("entry-type").addEventListener("change", updateFormFields);

  document.getElementById("ledger-form").addEventListener("submit", (e) => {
    e.preventDefault();

    const type = document.getElementById("entry-type").value;
    const date = document.getElementById("entry-date").value;
    const notes = document.getElementById("entry-notes").value.trim();

    let amount = parseFloat(document.getElementById("entry-amount").value || "0");

    if (type === "other") amount = -Math.abs(amount);

    const entry = { type, date, amount, notes };

    if (type === "gas") {
      entry.ppg = parseFloat(document.getElementById("entry-ppg").value || "0");
      entry.odo = parseFloat(document.getElementById("entry-odo").value || "0");
      entry.mte = parseFloat(document.getElementById("entry-mte").value || "0");
    }

    const updated = loadEntries();
    updated.push(entry);
    saveEntries(updated);
    render(updated);

    e.target.reset();
    updateFormFields();
  });

  document.getElementById("clear-ledger").addEventListener("click", () => {
    if (confirm("Clear all entries?")) {
      saveEntries([]);
      render([]);
    }
  });
});
