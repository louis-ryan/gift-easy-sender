import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { amount, recipientId, giftId } = req.body;

    // Get or create recipient's Stripe account
    const account = await stripe.accounts.create({
      type: 'express',
      country: 'DE',
      capabilities: {
        transfers: {requested: true},
      },
    });

    // Create a Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: 'usd',  // or 'eur', 'gbp', etc.
      payment_method_types: ['card'],
      transfer_data: {
          destination: connectedAccountId,
      }
  });

    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      accountId: account.id,
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Error creating payment intent' });
  }
}