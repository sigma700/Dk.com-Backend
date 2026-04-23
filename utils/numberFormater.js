// ✅ Add this helper to clean the phone number
export const formatPhone = (phone) => {
  if (!phone) return null;

  let cleaned = phone.replace(/\D/g, "");

  if (cleaned.startsWith("0")) {
    cleaned = cleaned.slice(1);
  }

  if (!cleaned.startsWith("254")) {
    cleaned = "254" + cleaned;
  }

  cleaned = cleaned.slice(0, 12);

  // Return the number with the leading '+'
  return "+" + cleaned;
};
export const isValidKenyanPhone = (phone) => {
  if (!phone) return false; // ← add this guard
  const cleaned = phone.replace(/\s/g, "");
  const regex = /^(?:\+254|0)?([7-9][0-9]{8})$/;
  return regex.test(cleaned);
};
