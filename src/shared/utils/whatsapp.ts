/**
 * Utility functions for WhatsApp formatting and link generation
 */

export function formatWhatsAppNumber(phone: string): string {
  if (!phone) return "";
  let cleaned = phone.replace(/[^0-9]/g, "");
  if (cleaned.startsWith("0")) {
    cleaned = "62" + cleaned.slice(1);
  } else if (cleaned.startsWith("+62")) {
    cleaned = "62" + cleaned.slice(3);
  } else if (!cleaned.startsWith("62")) {
    cleaned = "62" + cleaned;
  }
  return cleaned;
}

export function createWhatsAppLink(phone: string, message?: string): string {
  const formattedPhone = formatWhatsAppNumber(phone);
  if (!formattedPhone) return "";
  const encodedMsg = message ? encodeURIComponent(message) : "";
  return `https://wa.me/${formattedPhone}${encodedMsg ? `?text=${encodedMsg}` : ""}`;
}
