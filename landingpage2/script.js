const packageSelect = document.querySelector("#package");
const guestInput = document.querySelector("#guests");
const estimate = document.querySelector("#estimate");
const bookingForm = document.querySelector("#bookingForm");
const packageButtons = document.querySelectorAll(".select-package");
const dateInput = document.querySelector("#date");

const whatsappNumber = "6281234567890";

const rupiah = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

function getSelectedPrice() {
  return Number(packageSelect.selectedOptions[0].dataset.price);
}

function updateEstimate() {
  const guests = Math.max(Number(guestInput.value || 0), 0);
  estimate.textContent = rupiah.format(getSelectedPrice() * guests);
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
guestInput.addEventListener("input", updateEstimate);

bookingForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const formData = new FormData(bookingForm);
  const total = estimate.textContent;
  const message = [
    "Halo GrillMate, saya ingin booking BBQ.",
    `Nama: ${formData.get("name")}`,
    `Paket: ${formData.get("package")}`,
    `Jumlah tamu: ${formData.get("guests")} orang`,
    `Tanggal: ${formData.get("date")}`,
    `Lokasi: ${formData.get("location")}`,
    `Estimasi: ${total}`,
    `Catatan: ${formData.get("notes") || "-"}`,
  ].join("\n");

  const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank", "noopener,noreferrer");
});

setMinimumDate();
updateEstimate();
