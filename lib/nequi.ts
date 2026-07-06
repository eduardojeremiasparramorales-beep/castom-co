export function getNequiConfig() {
  return {
    phone: process.env.NEXT_PUBLIC_NEQUI_PHONE ?? "",
    name: process.env.NEXT_PUBLIC_NEQUI_NAME ?? "",
  };
}

export function getNequiDeepLink(amount: number, reference: string) {
  const url = `https://app.cobro.nequi.com/cobrar?valor=${Math.round(amount)}&referencia=${encodeURIComponent(reference)}`;
  return url;
}
