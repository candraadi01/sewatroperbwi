export function calculateAmounts(
  base: number,
  units: number,
  pickupPerUnit: number,
  discount: number,
  dpBasisPoints: number,
  dpNominal?: number,
) {
  const values = [
    base,
    units,
    pickupPerUnit,
    discount,
    dpBasisPoints,
    ...(dpNominal === undefined ? [] : [dpNominal]),
  ];
  if (
    values.some((v) => !Number.isSafeInteger(v) || v < 0) ||
    units < 1 ||
    units > 10 ||
    dpBasisPoints < 1 ||
    dpBasisPoints > 10000
  )
    throw new Error("Nilai perhitungan tidak valid.");
  const subtotal = base * units,
    pickup = pickupPerUnit * units,
    total = subtotal + pickup - Math.min(discount, subtotal + pickup);
  if (!Number.isSafeInteger(total) || total < 1 || total > 100000000)
    throw new Error("Total harga tidak valid.");
  const dp = Math.min(
    total,
    dpNominal === undefined
      ? Math.ceil((total * dpBasisPoints) / 10000)
      : dpNominal,
  );
  if (dp < 1) throw new Error("DP harus lebih dari nol.");
  return { subtotal, pickup, total, dp, remaining: total - dp };
}
