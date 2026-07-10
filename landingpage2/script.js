const packageSelect = document.querySelector("#package");
const areaSelect = document.querySelector("#area");
const guestInput = document.querySelector("#guests");
const estimate = document.querySelector("#estimate");
const bookingForm = document.querySelector("#bookingForm");
const packageButtons = document.querySelectorAll(".select-package");
const dateInput = document.querySelector("#date");
const addonInputs = document.querySelectorAll('input[name="addons"]');
const depositAmount = document.querySelector("#depositAmount");
const menuList = document.querySelector(".menu-list");
const menuPreviewImage = document.querySelector("#menuPreviewImage");
const menuPreviewTitle = document.querySelector("#menuPreviewTitle");

const whatsappNumber = "";
const bookingStorageKey = "grillmateBookings";

const rupiah = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

function getSelectedPrice() {
  return Number(packageSelect.selectedOptions[0]?.dataset.price || 0);
}

function getAreaFee() {
  return Number(areaSelect.selectedOptions[0]?.dataset.fee || 0);
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
  const grandTotal = packageTotal + getAreaFee() + getAddonTotal();
  estimate.textContent = rupiah.format(grandTotal);
  depositAmount.textContent = rupiah.format(Math.ceil(grandTotal * 0.3));
}

function setMinimumDate() {
  const today = new Date();
  today.setDate(today.getDate() + 2);
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  dateInput.min = `${year}-${month}-${day}`;
}

function resetBookingForm() {
  bookingForm.reset();
  setMinimumDate();
  dateInput.value = "";
  updateEstimate();
}

function saveBooking(booking) {
  const bookings = JSON.parse(localStorage.getItem(bookingStorageKey) || "[]");
  bookings.unshift(booking);
  localStorage.setItem(bookingStorageKey, JSON.stringify(bookings));
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

menuList.addEventListener("click", (event) => {
  const button = event.target.closest("button");

  if (!button) return;

  menuPreviewImage.src = button.dataset.image;
  menuPreviewImage.alt = button.dataset.title;
  menuPreviewTitle.textContent = button.dataset.title;
});

bookingForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const formData = new FormData(bookingForm);
  const total = estimate.textContent;
  const deposit = depositAmount.textContent;
  const addons = getSelectedAddons();
  const booking = {
    id: `GM-${Date.now()}`,
    createdAt: new Date().toLocaleString("id-ID"),
    name: formData.get("name"),
    phone: formData.get("phone"),
    package: formData.get("package"),
    area: formData.get("area"),
    guests: formData.get("guests"),
    date: formData.get("date"),
    time: formData.get("time"),
    payment: formData.get("payment"),
    addons,
    total,
    deposit,
    notes: formData.get("notes") || "-",
    status: "Menunggu konfirmasi",
  };
  saveBooking(booking);

  const message = [
    "Halo GrillMate, saya ingin reservasi makan di tempat.",
    `ID Booking: ${booking.id}`,
    `Nama: ${booking.name}`,
    `No. WhatsApp: ${booking.phone}`,
    `Paket: ${booking.package}`,
    `Area meja: ${booking.area}`,
    `Jumlah tamu: ${booking.guests} orang`,
    `Tanggal: ${booking.date}`,
    `Jam: ${booking.time}`,
    `Pembayaran: ${booking.payment}`,
    `DP 30%: ${booking.deposit}`,
    `Menu tambahan: ${addons.length ? addons.join(", ") : "-"}`,
    `Estimasi: ${booking.total}`,
    `Catatan: ${booking.notes}`,
  ].join("\n");

  const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
  if (whatsappNumber) {
    window.open(url, "_blank", "noopener,noreferrer");
  } else {
    alert("Booking berhasil disimpan. Nomor WhatsApp admin belum diatur, jadi data bisa dilihat dulu di dashboard admin.");
  }
  resetBookingForm();
});

window.addEventListener("pageshow", resetBookingForm);
resetBookingForm();
