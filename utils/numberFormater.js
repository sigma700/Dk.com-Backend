// ✅ Add this helper to clean the phone number
export const formatPhone = (phone) => {
  phone = phone.replace(/\s/g, "");
  if (phone.startsWith("0")) return "254" + phone.slice(1);
  if (phone.startsWith("+")) return phone.slice(1);
  return phone;
};
