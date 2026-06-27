export async function getWompiAcceptanceToken() {
  const key = process.env.WOMPI_PUBLIC_KEY;
  if (!key) return null;
  const res = await fetch(`https://sandbox.wompi.co/v1/merchants/${key}`);
  const data = await res.json();
  return data?.data?.presigned_acceptance?.acceptance_token ?? null;
}

export async function createWompiTransaction(params: {
  amountInCents: number;
  currency: string;
  customerEmail: string;
  reference: string;
  redirectUrl: string;
}) {
  const key = process.env.WOMPI_PRIVATE_KEY;
  if (!key) return null;

  const acceptanceToken = await getWompiAcceptanceToken();
  if (!acceptanceToken) return null;

  const body: Record<string, any> = {
    amount_in_cents: params.amountInCents,
    currency: params.currency,
    customer_email: params.customerEmail,
    reference: params.reference,
    acceptance_token: acceptanceToken,
    redirect_url: params.redirectUrl,
  };

  const res = await fetch("https://sandbox.wompi.co/v1/transactions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data?.message ?? "Wompi error");
  return data?.data;
}
