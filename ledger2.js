// --- UI MESSAGE BAR ---
function showMessage(text, type = "success") {
  const bar = document.getElementById("message-bar");
  if (!bar) return;
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

// --- TYPE SWITCHER WITH DYNAMIC REQUIRED ATTRIBUTES ---
const typeSelect = document.getElementById("entry-type");

function updateRequiredFields() {
  const selectedType = typeSelect.value;
  const sections = ["payout", "other", "gas"];

  sections.forEach((type) => {
    const container = document.getElementById(`${type}-fields`);
    if (!container) return;

    if (type === selectedType) {
      container.classList.remove("hidden");
      // Add 'required' to visible fields (ignoring notes)
      container.querySelectorAll("input:not([id$='notes'])").forEach(input => {
        input.required = true;
      });
    } else {
      container.classList.add("hidden");
      // Completely strip 'required' from hidden fields so the browser doesn't block submission
      container.querySelectorAll("input").forEach(input => {
        input.required = false;
      });
    }
  });
}

// Listen for dropdown changes
typeSelect.addEventListener("change", updateRequiredFields);

// Run right away on page load to initialize fields correctly
updateRequiredFields();

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

  // Fire off the save request
  saveEntry(entry);

  // Reset the form fields cleanly
  e.target.reset();
  
  // Force the UI script to hide unneeded tabs and recalculate required attributes
  updateRequiredFields();
});

// --- CORS-SAFE FETCH (text/plain bypass) ---
function saveEntry(entry) {
  fetch("https://script.google.com/macros/s/AKfycbxvMjmStfilAaQYcWLwUSRaE6EXQo9ej-u4rXrmG8AYgYZCZqy6JFpa4EuFNDNMyO2d/exec", {
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
