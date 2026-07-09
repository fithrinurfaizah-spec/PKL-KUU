const packageSelect = document.querySelector("#package");
const areaSelect = document.querySelector("#area");
const guestInput = document.querySelector("#guests");
const estimate = document.querySelector("#estimate");
const bookingForm = document.querySelector("#bookingForm");
const packageButtons = document.querySelectorAll(".select-package");
const dateInput = document.querySelector("#date");
const addonInputs = document.querySelectorAll('input[name="addons"]');

const whatsappNumber = "6281234567890";

const rupiah = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

function getSelectedPrice() {
  return Number(packageSelect.selectedOptions[0].dataset.price);
}

function getAreaFee() {
  return Number(areaSelect.selectedOptions[0].dataset.fee);
}

function getAddonTotal() {
  return [...addonInputs]
    .filter((input) => input.checked)
    .reduce((total, input) => total + Number(input.dataset.price), 0);
}

function getSelectedAddons() {
  return [...addonInputs]
    .filter((input) => input.checked)
    .map((input) => input.value);
}

function updateEstimate() {
  const guests = Math.max(Number(guestInput.value || 0), 0);
  const packageTotal = getSelectedPrice() * guests;
  estimate.textContent = rupiah.format(packageTotal + getAreaFee() + getAddonTotal());
}

function setMinimumDate() {
  const today = new Date();
  today.setDate(today.getDate() + 2);
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  dateInput.min = `${year}-${month}-${day}`;
}

packageButtons.forEach((button) => {
  button.addEventListener("click", () => {
    packageSelect.value = button.dataset.package;
    updateEstimate();
    document.querySelector("#booking").scrollIntoView({ behavior: "smooth" });
  });
});

packageSelect.addEventListener("change", updateEstimate);
areaSelect.addEventListener("change", updateEstimate);
guestInput.addEventListener("input", updateEstimate);
addonInputs.forEach((input) => input.addEventListener("change", updateEstimate));

bookingForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const formData = new FormData(bookingForm);
  const total = estimate.textContent;
  const addons = getSelectedAddons();
  const message = [
    "Halo GrillMate, saya ingin reservasi makan di tempat.",
    `Nama: ${formData.get("name")}`,
    `No. WhatsApp: ${formData.get("phone")}`,
    `Paket: ${formData.get("package")}`,
    `Area meja: ${formData.get("area")}`,
    `Jumlah tamu: ${formData.get("guests")} orang`,
    `Tanggal: ${formData.get("date")}`,
    `Jam: ${formData.get("time")}`,
    `Menu tambahan: ${addons.length ? addons.join(", ") : "-"}`,
    `Estimasi: ${total}`,
    `Catatan: ${formData.get("notes") || "-"}`,
  ].join("\n");

  const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank", "noopener,noreferrer");
});

setMinimumDate();
updateEstimate();
