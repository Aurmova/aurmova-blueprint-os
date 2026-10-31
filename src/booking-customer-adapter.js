// Pure, offline adapter for AURMOVA owner-only booking records.
// No network, localStorage, secrets, or database side effects.
const BOOKING_SERVICES = Object.freeze(["人生蓝图解析","黄金流年蓝图解析","关系蓝图解析","亲子蓝图解析","合作蓝图解析"]);

function bookingServices(booking) {
  // The booking Worker stores services joined with the FULLWIDTH PLUS SIGN (＋).
  // Legacy fixtures may use 、 or commas. Do not silently accept unknown services.
  const raw = booking.service;
  if (typeof raw !== "string") throw new TypeError("Invalid booking service");
  const services = raw.split(/[＋+、,，]/u).map(s => s.trim()).filter(Boolean);
  if (!services.length || services.some(s => !BOOKING_SERVICES.includes(s)) || new Set(services).size !== services.length) {
    throw new TypeError("Unknown or duplicate booking service");
  }
  return services;
}

export function bookingToCustomer(booking) {
  if (!booking || typeof booking !== "object" || !/^AUR-\d{6}-[A-F0-9]{12}$/.test(String(booking.id || ""))) {
    throw new TypeError("Invalid booking ID");
  }
  const services = bookingServices(booking);
  const birthday = String(booking.birthday || "");
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(birthday)) throw new TypeError("Invalid birthday");
  const [day, month, year] = birthday.split("/").map(Number);
  const date = new Date(0);
  date.setFullYear(year, month - 1, day);
  if (year < 1900 || date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day || date.getTime() > Date.now()) throw new TypeError("Invalid birthday");
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
  const existingBookingIds = new Set(localCustomers.map(c => String(c?.sourceBookingId || "")).filter(Boolean));
  const existingCustomerIds = new Set(localCustomers.map(c => String(c?.id || "")).filter(Boolean));
  const byId = new Map();
  let duplicateCount = 0;
  for (const booking of ownerBookings) {
    const customer = bookingToCustomer(booking);
    if (existingBookingIds.has(customer.sourceBookingId) || existingCustomerIds.has(customer.id) || byId.has(customer.sourceBookingId)) {
      duplicateCount++;
      continue;
    }
    byId.set(customer.sourceBookingId, customer);
  }
  // Preview only. Never mutate existing customer records or write imported data automatically.
  return { existingCount: localCustomers.length, newCustomers: [...byId.values()], duplicateCount };
}
