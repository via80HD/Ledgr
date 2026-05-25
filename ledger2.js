// --- UI MESSAGE BAR ---
function showMessage(text, type = "success") {
  const bar = document.getElementById("message-bar");
  bar.textContent = text;
  bar.className = "";
  bar.classList.add(type);
  bar.classList.remove("hidden");

  setTimeout(() => {
    bar.classList.add("hidden");
  }, 3000);
}

// --- SAFE GETTER ---
function getValue(id, parser = (v) => v) {
  const el = document.getElementById(id);
  if (!el) return null;
  if (el.value === "") return null;
  try {
    return parser(el.value);
  } catch {
    return null;
  }
}

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
    entry.date = getValue("payout-date");
    entry.amount = getValue("payout-amount", parseFloat);
    entry.notes = getValue("payout-notes");
  }

  if (type === "other") {
    entry.date = getValue("other-date");
    const amt = getValue("other-amount", parseFloat);
    entry.amount = amt !== null ? -Math.abs(amt) : null;
    entry.notes = getValue("other-notes");
  }

  if (type === "gas") {
    entry.date = getValue("gas-date");
    entry.total = getValue("gas-total", parseFloat);
    entry.ppg = getValue("gas-ppg", parseFloat);
    entry.odo = getValue("gas-odo", parseInt);
    entry.mte = getValue("gas-mte", parseInt);
    entry.notes = getValue("gas-notes");
  }

  saveEntry(entry);

  e.target.reset();
  typeSelect.dispatchEvent(new Event("change"));
});

// --- CORS-SAFE FETCH (text/plain bypass) ---
function saveEntry(entry) {
  fetch("https://script.google.com/macros/s/AKfycbyXff6-CIiiOSlRNkuqCBtfvjgcWLrdOanHYu51_o7a2Va5sh6SXTi22wnsK1kV7W93/exec", {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(entry)
  })
  .then(response => {
    if (!response.ok) {
      throw new Error("Server returned " + response.status);
    }
    showMessage("Entry saved successfully!", "success");
  })
  .catch(err => {
    showMessage("Error saving entry: " + err.message, "error");
  });
}
