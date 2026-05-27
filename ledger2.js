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
  if (!el) return "";
  if (el.value === "") return "";
  try {
    return parser(el.value);
  } catch {
    return "";
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
    entry.total = "";
    entry.ppg = "";
    entry.odo = "";
    entry.mte = "";
  }

  if (type === "other") {
    entry.date = getValue("other-date");
    const amt = getValue("other-amount", parseFloat);
    entry.amount = amt !== "" ? -Math.abs(amt) : "";
    entry.notes = getValue("other-notes");
    entry.total = "";
    entry.ppg = "";
    entry.odo = "";
    entry.mte = "";
  }

  if (type === "gas") {
    entry.date = getValue("gas-date");
    entry.total = getValue("gas-total", parseFloat);
    entry.ppg = getValue("gas-ppg", parseFloat);
    entry.odo = getValue("gas-odo", parseInt);
    entry.mte = getValue("gas-mte", parseInt);
    entry.notes = getValue("gas-notes");
    entry.amount = "";
  }

  saveEntry(entry);

  e.target.reset();
  typeSelect.dispatchEvent(new Event("change"));
});

// --- GOOGLE FORMS BACKEND (NO CORS, ALWAYS WORKS) ---
function saveEntry(entry) {
  const formData = new FormData();

  formData.append("entry.1877171559", entry.type);
  formData.append("entry.1937408394", entry.date);
  formData.append("entry.568811173", entry.amount);
  formData.append("entry.1162546458", entry.notes);
  formData.append("entry.502439932", entry.total);
  formData.append("entry.1831913986", entry.ppg);
  formData.append("entry.1184210259", entry.odo);
  formData.append("entry.1013258718", entry.mte);

  fetch("https://docs.google.com/forms/d/e/1FAIpQLSetOjoFF9-AalCI2qkcaTZdInjPox6C2FKEumHHUvp26D97OQ/formResponse", {
    method: "POST",
    mode: "no-cors",
    body: formData
  });

  showMessage("Entry saved!", "success");
}
