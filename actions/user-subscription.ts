"use server";

import { auth, currentUser } from "@clerk/nextjs";

import { getUserSubscription } from "@/db/queries";
import { stripe } from "@/lib/stripe";
import { absoluteUrl } from "@/lib/utils";

const returnUrl = absoluteUrl("/shop");

// Configuration for the subscription plan
const subscriptionDetails = {
  name: "Coursim Teacher",
  description: "Creating and sharing courses.",
  amount: 1499, // Amount in cents ($14.99)
  currency: "USD",
  interval: "month", // Ensure this is a valid string for the interval
};


export const createStripeUrl = async () => {
  const { userId } = auth();
  const user = await currentUser();

  if (!userId || !user) throw new Error("Unauthorized. Please log in.");

  const userSubscription = await getUserSubscription();

  // Validate user subscription and ensure it corresponds to the current user
  if (!userSubscription) {
    throw new Error("User subscription not found. Please subscribe to a plan.");
  }

  // Redirect user to customer portal if they already have a subscription
  if (userSubscription.stripeCustomerId) {
    const stripeSession = await stripe.billingPortal.sessions.create({
      customer: userSubscription.stripeCustomerId,
      return_url: returnUrl,
    });

    return { data: stripeSession.url };
  }

  // Create a checkout session for new subscriptions
  const stripeSession = await stripe.checkout.sessions.create({
    mode: "subscription" as const, // Use 'as const' to help with TypeScript inference
    payment_method_types: ["card"],
    customer_email: user.emailAddresses[0].emailAddress,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: subscriptionDetails.currency,
          product_data: {
            name: subscriptionDetails.name,
            description: subscriptionDetails.description,
          },
          unit_amount: subscriptionDetails.amount,
          recurring: {
            interval: subscriptionDetails.interval as "month", // Ensure this matches expected types
          },
        },
      },
    ],
    metadata: {
      userId,
    },
    success_url: returnUrl,
    cancel_url: returnUrl,
  });

  return { data: stripeSession.url };
};
