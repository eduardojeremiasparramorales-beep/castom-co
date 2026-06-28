export function getNequiDeepLink(amount: number, reference: string) {
  const url = `https://app.cobro.nequi.com/cobrar?valor=${Math.round(amount)}&referencia=${encodeURIComponent(reference)}`;
  return url;
}
