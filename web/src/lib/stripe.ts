export async function createCheckoutSession() {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/stripe/create-checkout-session`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          priceId: process.env.STRIPE_PRO_PRICE_ID,
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to create checkout session");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error creating checkout session:", error);
    throw error;
  }
}
