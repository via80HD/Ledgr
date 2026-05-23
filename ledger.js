// ledger.js

const STORAGE_KEY = "ledgr_entries_v1";

function loadEntries() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error("Failed to parse ledger storage", e);
    return [];
  }
}

function saveEntries(entries) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

function formatMoney(n) {
  if (isNaN(n)) return "$0.00";
  return "$" + n.toFixed(2);
}

function render(entries) {
  const tbody = document.getElementById("ledger-body");
  tbody.innerHTML = "";

  let sumUber = 0;
  let sumGas = 0;
  let sumMaint = 0;
  let sumMiles = 0;
  let sumGallons = 0;

  entries.forEach((entry, idx) => {
    const tr = document.createElement("tr");

    const tdDate = document.createElement("td");
    tdDate.textContent = entry.date || "";
    tr.appendChild(tdDate);

    const tdType = document.createElement("td");
    tdType.textContent = entry.type;
    tr.appendChild(tdType);

    const tdAmount = document.createElement("td");
    tdAmount.textContent = formatMoney(entry.amount);
    tr.appendChild(tdAmount);

    const tdMiles = document.createElement("td");
    tdMiles.textContent = entry.miles ? entry.miles.toFixed(1) : "";
    tr.appendChild(tdMiles);

    const tdGallons = document.createElement("td");
    tdGallons.textContent = entry.gallons ? entry.gallons.toFixed(2) : "";
    tr.appendChild(tdGallons);

    const tdNotes = document.createElement("td");
    tdNotes.textContent = entry.notes || "";
    tr.appendChild(tdNotes);

    const tdActions = document.createElement("td");
    const delBtn = document.createElement("button");
    delBtn.textContent = "X";
    delBtn.addEventListener("click", () => {
      const updated = entries.slice();
      updated.splice(idx, 1);
      saveEntries(updated);
      render(updated);
    });
    tdActions.appendChild(delBtn);
    tr.appendChild(tdActions);

    tbody.appendChild(tr);

    // accumulate
    if (entry.type === "uber") sumUber += entry.amount;
    if (entry.type === "gas") sumGas += entry.amount;
    if (entry.type === "maintenance") sumMaint += entry.amount;
    if (entry.miles) sumMiles += entry.miles;
    if (entry.gallons) sumGallons += entry.gallons;
  });

  const sumNet = sumUber - sumGas - sumMaint;
  const mpg = sumGallons > 0 ? sumMiles / sumGallons : null;
  const gasPerMile = sumMiles > 0 ? sumGas / sumMiles : null;

  document.getElementById("sum-uber").textContent = formatMoney(sumUber);
  document.getElementById("sum-gas").textContent = formatMoney(sumGas);
  document.getElementById("sum-net").textContent = formatMoney(sumNet);
  document.getElementById("sum-miles").textContent = sumMiles.toFixed(1);
  document.getElementById("sum-gallons").textContent = sumGallons.toFixed(2);
  document.getElementById("sum-mpg").textContent = mpg ? mpg.toFixed(1) : "–";
  document.getElementById("sum-gas-per-mile").textContent = gasPerMile
    ? "$" + gasPerMile.toFixed(3)
    : "–";
}

document.addEventListener("DOMContentLoaded", () => {
  const entries = loadEntries();
  render(entries);

  const form = document.getElementById("ledger-form");
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const date = document.getElementById("entry-date").value;
    const type = document.getElementById("entry-type").value;
    const amount = parseFloat(document.getElementById("entry-amount").value || "0");
    const miles = parseFloat(document.getElementById("entry-miles").value || "0");
    const gallons = parseFloat(document.getElementById("entry-gallons").value || "0");
    const notes = document.getElementById("entry-notes").value.trim();

    if (!date || !type || isNaN(amount)) {
      alert("Date, type, and amount are required.");
      return;
    }

    const newEntry = {
      date,
      type,
      amount,
      miles: isNaN(miles) ? 0 : miles,
      gallons: isNaN(gallons) ? 0 : gallons,
      notes,
    };

    const updated = loadEntries();
    updated.push(newEntry);
    saveEntries(updated);
    render(updated);
    form.reset();
  });

  const clearBtn = document.getElementById("clear-ledger");
  clearBtn.addEventListener("click", () => {
    if (!confirm("Clear all entries?")) return;
    saveEntries([]);
    render([]);
  });
});
