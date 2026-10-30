// Pure, offline adapter for AURMOVA owner-only booking records.
// No network, localStorage, secrets, or database side effects.
const BOOKING_SERVICES = Object.freeze(["人生蓝图解析","黄金流年蓝图解析","关系蓝图解析","亲子蓝图解析","合作蓝图解析"]);

export function bookingToCustomer(booking) {
  if (!booking || typeof booking !== "object" || !/^AUR-\d{6}-[A-F0-9]{12}$/.test(String(booking.id || ""))) {
    throw new TypeError("Invalid booking ID");
  }
  const services = String(booking.service || "").split(/[、,]/).map(s => s.trim()).filter(Boolean);
  if (!services.length || services.some(s => !BOOKING_SERVICES.includes(s))) {
    throw new TypeError("Unknown booking service");
  }
  const birthday = String(booking.birthday || "");
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(birthday)) throw new TypeError("Invalid birthday");
  return {
    source: "booking-staging",
    sourceBookingId: booking.id,
    // Namespace IDs: never overwrite an existing local customer with a coincidentally matching ID.
    id: `booking:${booking.id}`,
    name: String(booking.name || ""),
    gender: String(booking.gender || ""),
    birthday,
    whatsapp: String(booking.whatsapp || ""),
    occupation: String(booking.occupation || ""),
    customerQuestion: String(booking.question || ""),
    consultationTypes: services,
    consultationType: services[0],
    related: Array.isArray(booking.related) ? booking.related.map(person => ({...person})) : [],
    bookingStatus: String(booking.status || ""),
    createdAt: String(booking.created_at || ""),
  };
}

export function previewBookingMerge(localCustomers, ownerBookings) {
  if (!Array.isArray(localCustomers) || !Array.isArray(ownerBookings)) throw new TypeError("Expected arrays");
  const existing = new Set(localCustomers.map(c => String(c?.sourceBookingId || "")));
  const byId = new Map();
  for (const booking of ownerBookings) {
    const customer = bookingToCustomer(booking);
    if (!existing.has(customer.sourceBookingId)) byId.set(customer.sourceBookingId, customer);
  }
  // Preview only. Never mutate existing customer records or write imported data automatically.
  return { existingCount: localCustomers.length, newCustomers: [...byId.values()], duplicateCount: ownerBookings.length - byId.size };
}
