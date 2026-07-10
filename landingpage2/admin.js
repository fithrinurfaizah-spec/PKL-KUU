const bookingStorageKey = "grillmateBookings";
const bookingList = document.querySelector("#bookingList");
const totalBookings = document.querySelector("#totalBookings");
const pendingBookings = document.querySelector("#pendingBookings");
const clearBookings = document.querySelector("#clearBookings");

function getBookings() {
  return JSON.parse(localStorage.getItem(bookingStorageKey) || "[]");
}

function saveBookings(bookings) {
  localStorage.setItem(bookingStorageKey, JSON.stringify(bookings));
}

function renderBookings() {
  const bookings = getBookings();
  totalBookings.textContent = bookings.length;
  pendingBookings.textContent = bookings.filter((booking) => booking.status === "Menunggu konfirmasi").length;

  if (!bookings.length) {
    bookingList.innerHTML = '<div class="empty-state">Belum ada booking masuk dari customer.</div>';
    return;
  }

  bookingList.innerHTML = bookings
    .map(
      (booking) => `
        <article class="booking-item">
          <div class="booking-item-header">
            <div>
              <span>${booking.id}</span>
              <h2>${booking.name}</h2>
            </div>
            <select data-id="${booking.id}" class="status-select">
              <option ${booking.status === "Menunggu konfirmasi" ? "selected" : ""}>Menunggu konfirmasi</option>
              <option ${booking.status === "Dikonfirmasi" ? "selected" : ""}>Dikonfirmasi</option>
              <option ${booking.status === "Selesai" ? "selected" : ""}>Selesai</option>
              <option ${booking.status === "Dibatalkan" ? "selected" : ""}>Dibatalkan</option>
            </select>
          </div>
          <dl class="booking-detail">
            <div><dt>WhatsApp</dt><dd>${booking.phone}</dd></div>
            <div><dt>Tanggal</dt><dd>${booking.date}, ${booking.time}</dd></div>
            <div><dt>Tamu</dt><dd>${booking.guests} orang</dd></div>
            <div><dt>Area</dt><dd>${booking.area}</dd></div>
            <div><dt>Paket</dt><dd>${booking.package}</dd></div>
            <div><dt>Pembayaran</dt><dd>${booking.payment || "-"}</dd></div>
            <div><dt>Nominal DP</dt><dd>${booking.deposit || "-"}</dd></div>
            <div><dt>Menu tambahan</dt><dd>${booking.addons.length ? booking.addons.join(", ") : "-"}</dd></div>
            <div><dt>Total</dt><dd>${booking.total}</dd></div>
            <div><dt>Masuk</dt><dd>${booking.createdAt}</dd></div>
          </dl>
          <div class="payment-action">
            ${getPaymentInstruction(booking)}
            <a class="whatsapp-action" href="${getPaymentWhatsappUrl(booking)}" target="_blank" rel="noopener noreferrer">Kirim instruksi pembayaran</a>
          </div>
          <p class="booking-notes">${booking.notes}</p>
        </article>
      `,
    )
    .join("");
}

function getPaymentInstruction(booking) {
  const payment = booking.payment || "";

  if (payment.includes("QRIS")) {
    return `Kirim QRIS restoran ke WhatsApp customer dan minta bukti transfer DP ${booking.deposit}.`;
  }

  if (payment.includes("bank")) {
    return `Kirim nomor rekening restoran ke WhatsApp customer dan minta bukti transfer DP ${booking.deposit}.`;
  }

  if (payment.includes("E-wallet")) {
    return `Kirim nomor e-wallet restoran ke WhatsApp customer dan minta bukti pembayaran DP ${booking.deposit}.`;
  }

  return "Customer memilih bayar di kasir saat datang. Admin cukup konfirmasi ketersediaan meja.";
}

function getPaymentWhatsappUrl(booking) {
  const phone = formatPhone(booking.phone);
  const message = [
    `Halo ${booking.name}, booking GrillMate dengan ID ${booking.id} sudah kami terima.`,
    `Detail: ${booking.package}, ${booking.guests} orang, ${booking.date} jam ${booking.time}.`,
    `Total estimasi: ${booking.total}.`,
    getPaymentMessage(booking),
    "Mohon kirim bukti pembayaran di chat ini agar booking bisa kami konfirmasi.",
    "Terima kasih.",
  ].join("\n");

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

function getPaymentMessage(booking) {
  const payment = booking.payment || "";

  if (payment.includes("QRIS")) {
    return `Metode pembayaran: DP QRIS 30% sebesar ${booking.deposit}. Kami akan kirim gambar QRIS restoran di chat ini.`;
  }

  if (payment.includes("bank")) {
    return `Metode pembayaran: transfer bank DP 30% sebesar ${booking.deposit}. Silakan transfer ke BCA 1234567890 a.n. GrillMate BBQ.`;
  }

  if (payment.includes("E-wallet")) {
    return `Metode pembayaran: e-wallet DP 30% sebesar ${booking.deposit}. Silakan transfer ke 081234567890 a.n. GrillMate BBQ.`;
  }

  return "Metode pembayaran: bayar di kasir saat datang. Booking akan kami tahan sesuai jadwal reservasi.";
}

function formatPhone(phone) {
  const digits = String(phone || "").replace(/\D/g, "");

  if (digits.startsWith("0")) {
    return `62${digits.slice(1)}`;
  }

  if (digits.startsWith("62")) {
    return digits;
  }

  return digits;
}

bookingList.addEventListener("change", (event) => {
  if (!event.target.matches(".status-select")) return;

  const bookings = getBookings().map((booking) => {
    if (booking.id !== event.target.dataset.id) return booking;
    return { ...booking, status: event.target.value };
  });

  saveBookings(bookings);
  renderBookings();
});

clearBookings.addEventListener("click", () => {
  localStorage.removeItem(bookingStorageKey);
  renderBookings();
});

renderBookings();
