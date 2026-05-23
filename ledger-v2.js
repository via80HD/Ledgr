const type = document.getElementById("entry-type");

type.addEventListener("change", () => {
  document.getElementById("payout-fields").classList.add("hidden");
  document.getElementById("other-fields").classList.add("hidden");
  document.getElementById("gas-fields").classList.add("hidden");

  if (type.value === "payout") {
    document.getElementById("payout-fields").classList.remove("hidden");
  }
  if (type.value === "other") {
    document.getElementById("other-fields").classList.remove("hidden");
  }
  if (type.value === "gas") {
    document.getElementById("gas-fields").classList.remove("hidden");
  }
});
