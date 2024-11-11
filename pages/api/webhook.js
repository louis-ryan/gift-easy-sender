import Stripe from 'stripe';
import { buffer } from 'micro';
import dbConnect from '../../utils/dbConnect';
import User from '../../models/Account';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export const config = {
    api: {
        bodyParser: false,
    },
};

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const buf = await buffer(req);
    const sig = req.headers['stripe-signature'];

    let event;

    try {
        event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
    } catch (err) {
        console.error(`Webhook Error: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    await dbConnect();

    // Handle the event
    switch (event.type) {
        case 'account.updated': {
            const account = event.data.object;

            await User.findOneAndUpdate(
                { stripeAccountId: account.id },
                {
                    'stripeAccountStatus.detailsSubmitted': account.details_submitted,
                    'stripeAccountStatus.chargesEnabled': account.charges_enabled,
                    'stripeAccountStatus.payoutsEnabled': account.payouts_enabled,
                }
            );
            break;
        }
        case 'payment_intent.succeeded': {
            const paymentIntent = event.data.object;
            // Add logic to update gift status
            break;
        }
        case 'payout.paid': {
            // Add logic to track successful payouts
            break;
        }
        case 'account.external_account.created': {
            // Add logic to track when bank accounts are added
            break;
        }
        case 'capability.updated': {
            // Add logic to track capability updates
            break;
        }
    }

    res.json({ received: true });
}