// --- TYPE SWITCHER ---
const typeSelect = document.getElementById("entry-type");

typeSelect.addEventListener("change", () => {
  document.getElementById("payout-fields").classList.add("hidden");
  document.getElementById("other-fields").classList.add("hidden");
  document.getElementById("gas-fields").classList.add("hidden");

  if (typeSelect.value === "payout") {
    document.getElementById("payout-fields").classList.remove("hidden");
  }
  if (typeSelect.value === "other") {
    document.getElementById("other-fields").classList.remove("hidden");
  }
  if (typeSelect.value === "gas") {
    document.getElementById("gas-fields").classList.remove("hidden");
  }
});

// --- FORM SUBMISSION ---
document.getElementById("ledger-form").addEventListener("submit", (e) => {
  e.preventDefault();

  const type = typeSelect.value;
  let entry = { type };

  if (type === "payout") {
    entry.date = document.getElementById("payout-date").value;
    entry.amount = parseFloat(document.getElementById("payout-amount").value);
    entry.notes = document.getElementById("payout-notes").value;
  }

  if (type === "other") {
    entry.date = document.getElementById("other-date").value;
    entry.amount = -Math.abs(parseFloat(document.getElementById("other-amount").value));
    entry.notes = document.getElementById("other-notes").value;
  }

  if (type === "gas") {
    entry.date = document.getElementById("gas-date").value;
    entry.total = parseFloat(document.getElementById("gas-total").value);
    entry.ppg = parseFloat(document.getElementById("gas-ppg").value);
    entry.odo = parseInt(document.getElementById("gas-odo").value);
    entry.mte = parseInt(document.getElementById("gas-mte").value);
    entry.notes = document.getElementById("gas-notes").value;
  }

  saveEntry(entry);
  e.target.reset();
  typeSelect.dispatchEvent(new Event("change"));
});

// --- SEND TO GOOGLE SHEETS ---
function saveEntry(entry) {
  fetch("https://script.google.com/macros/s/AKfycbzD6F3865YTuYFS4qCKXCoe3yKJmXcNQoMIO-XNWMcKalAXQfZHHtGTEtpZHRvH1sHF/exec", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(entry)
  })
  .then(() => console.log("Saved to Google Sheets"))
  .catch(err => console.error("Error:", err));
}
