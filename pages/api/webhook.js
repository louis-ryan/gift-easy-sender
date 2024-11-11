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
    // Add debugging
    console.log('Webhook received:', {
        method: req.method,
        headers: req.headers,
        url: req.url
    });

    if (req.method !== 'POST') {
        console.log('Wrong method:', req.method);
        return res.status(405).json({ message: 'Method not allowed' });
    }

    let event;
    try {
        const buf = await buffer(req);
        const sig = req.headers['stripe-signature'];

        if (!sig) {
            console.log('Missing signature header');
            return res.status(400).json({ message: 'Missing stripe-signature header' });
        }

        console.log('Attempting to construct event with signature:', sig);
        event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
        console.log('Event constructed successfully:', event.type);
    } catch (err) {
        console.error(`Webhook Error: ${err.message}`);
        return res.status(400).json({ 
            message: 'Webhook signature verification failed',
            error: err.message 
        });
    }

    try {
        await dbConnect();
        console.log('DB connected');

        // Handle the event
        console.log('Processing event:', event.type, event.data.object);

        switch (event.type) {
            case 'account.updated': {
                const account = event.data.object;
                console.log('Account update received:', {
                    accountId: account.id,
                    details_submitted: account.details_submitted,
                    charges_enabled: account.charges_enabled,
                    payouts_enabled: account.payouts_enabled
                });
                
                const updatedUser = await User.findOneAndUpdate(
                    { stripeAccountId: account.id },
                    {
                        'stripeAccountStatus.detailsSubmitted': account.details_submitted,
                        'stripeAccountStatus.chargesEnabled': account.charges_enabled,
                        'stripeAccountStatus.payoutsEnabled': account.payouts_enabled,
                        'stripeAccountStatus.lastUpdated': new Date(),
                        'stripeAccountStatus.requirements': account.requirements,
                    },
                    { new: true }
                );
                
                console.log('User updated:', updatedUser);
                break;
            }
            // ... other cases ...
            default: {
                console.log(`Unhandled event type: ${event.type}`);
            }
        }

        return res.json({ 
            received: true,
            type: event.type,
            id: event.id
        });
    } catch (err) {
        console.error('Error processing webhook:', err);
        return res.status(200).json({ 
            received: true,
            error: 'Processing failed but webhook received',
            type: event.type,
            id: event.id
        });
    }
}