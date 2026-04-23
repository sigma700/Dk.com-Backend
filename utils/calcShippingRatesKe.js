export const calculateShippingCost = async (
  county,
  shippingMethod,
  subtotal,
) => {
  if (subtotal >= 5000) return 0;

  const majorCities = ["Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret"];
  let baseCost = majorCities.includes(county) ? 150 : 250;

  const methodMultiplier = {
    standard: 1,
    express: 1.8,
    "same-day": 2.5,
  };
  return Math.ceil(baseCost * (methodMultiplier[shippingMethod] || 1));
};
