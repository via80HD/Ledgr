// ===============================
// LEDGER V2 — FIELD LOGIC + STORAGE
// ===============================

// DOM ELEMENTS
const typeSelect = document.getElementById("entry-type");
const amountWrapper = document.getElementById("amount-wrapper");
const amountField = document.getElementById("amount-field");

const ppgWrapper = document.getElementById("ppg-wrapper");
const odoWrapper = document.getElementById("odo-wrapper");
const mteWrapper = document.getElementById("mte-wrapper");

const amountInput = document.getElementById("entry-amount");
const ppgInput = document.getElementById("entry-ppg");
const odoInput = document.getElementById("entry-odo");
const mteInput = document.getElementById("entry-mte");

const notesInput = document.getElementById("entry-notes");
const dateInput = document.getElementById("entry-date");

const tableBody = document.getElementById("ledger-body");

// SUMMARY FIELDS
const sumPayout = document.getElementById("sum-payout");
const sumGas = document.getElementById("sum-gas");
const sumOther = document.getElementById("sum-other");
const sumNet = document.getElementById("sum-net");
const sumMiles = document.getElementById("sum-miles");
const sumGallons = document.getElementById("sum-gallons");
const sumMPG = document.getElementById("sum-mpg");
const sumGasPerMile = document.getElementById("sum-gas-per-mile");

// ===============================
// FIELD SWITCHING LOGIC
// ===============================
function updateFormFields() {
  const type = typeSelect.value;

  // Reset visibility
  ppgWrapper.classList.add("hidden");
  odoWrapper.classList.add("hidden");
  mteWrapper.classList.add("hidden");

  // Reset amount field
  amountField.innerHTML = `<input type="number" id="entry-amount" step="0.01" />`;

  if (type === "payout") {
    // Payout: simple amount
    amountWrapper.querySelector("span").textContent = "Amount";
  }

  if (type === "other") {
    // Other: force negative sign
    amountWrapper.querySelector("span").textContent = "Amount (negative)";
    amountField.innerHTML = `
      <div class="neg-wrapper">
        <span class="neg-prefix">- $</span>
        <input type="number" id="entry-amount" step="0.01" />
      </div>
    `;
  }

  if (type === "gas") {
    // Gas: show PPG, Odo, MTE
    amountWrapper.querySelector("span").textContent = "Total Cost";
    ppgWrapper.classList.remove("hidden");
    odoWrapper.classList.remove("hidden");
    mteWrapper.classList.remove("hidden");
  }
}

typeSelect.addEventListener("change", updateFormFields);

// ===============================
// LOAD / SAVE LEDGER
// ===============================
let ledger = JSON.parse(localStorage.getItem("ledgerData") || "[]");

function saveLedger() {
  localStorage.setItem("ledgerData", JSON.stringify(ledger));
}

// ===============================
// ADD ENTRY
// ===============================
document.getElementById("ledger-form").addEventListener("submit", (e) => {
  e.preventDefault();

  const type = typeSelect.value;
  const date = dateInput.value;
  const notes = notesInput.value;

  const amountEl = document.getElementById("entry-amount");
  let amount = parseFloat(amountEl.value || 0);

  let ppg = parseFloat(ppgInput.value || 0);
  let odo = parseFloat(odoInput.value || 0);
  let mte = parseFloat(mteInput.value || 0);

  // Force negative for "other"
  if (type === "other") {
    amount = -Math.abs(amount);
  }

  // MPG calculation
  let mpg = "";
  if (type === "gas" && odo > 0 && mte > 0) {
    mpg = (mte / (amount / ppg)).toFixed(1);
  }

  const entry = { date, type, amount, ppg, odo, mte, mpg, notes };
  ledger.push(entry);
  saveLedger();
  renderLedger();
  updateSummary();

  e.target.reset();
  updateFormFields();
});

// ===============================
// RENDER TABLE
// ===============================
function renderLedger() {
  tableBody.innerHTML = "";

  ledger.forEach((entry, index) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${entry.date}</td>
      <td>${entry.type}</td>
      <td>${entry.amount.toFixed(2)}</td>
      <td>${entry.odo || ""}</td>
      <td>${entry.mte || ""}</td>
      <td>${entry.mpg || ""}</td>
      <td>${entry.notes || ""}</td>
      <td><button class="btn danger small" onclick="deleteEntry(${index})">X</button></td>
    `;

    tableBody.appendChild(row);
  });
}

// ===============================
// DELETE ENTRY
// ===============================
function deleteEntry(i) {
  ledger.splice(i, 1);
  saveLedger();
  renderLedger();
  updateSummary();
}

// ===============================
// SUMMARY CALCULATIONS
// ===============================
function updateSummary() {
  let payout = 0;
  let gas = 0;
  let other = 0;
  let miles = 0;
  let gallons = 0;

  ledger.forEach((e) => {
    if (e.type === "payout") payout += e.amount;
    if (e.type === "gas") {
      gas += e.amount;
      if (e.ppg > 0) gallons += e.amount / e.ppg;
      if (e.odo > 0 && e.mte > 0) miles += e.mte;
    }
    if (e.type === "other") other += e.amount;
  });

  const net = payout + gas + other;
  const mpg = miles > 0 && gallons > 0 ? (miles / gallons).toFixed(1) : "–";
  const gasPerMile = miles > 0 ? (gas / miles).toFixed(3) : "–";

  sumPayout.textContent = `$${payout.toFixed(2)}`;
  sumGas.textContent = `$${gas.toFixed(2)}`;
  sumOther.textContent = `$${other.toFixed(2)}`;
  sumNet.textContent = `$${net.toFixed(2)}`;
  sumMiles.textContent = miles.toFixed(0);
  sumGallons.textContent = gallons.toFixed(2);
  sumMPG.textContent = mpg;
  sumGasPerMile.textContent = gasPerMile;
}

// ===============================
// INIT
// ===============================
renderLedger();
updateSummary();
updateFormFields();
