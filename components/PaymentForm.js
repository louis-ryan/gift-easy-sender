import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.STRIPE_PUBLISHABLE_KEY);

export default function PaymentForm({ amount, currency = 'usd', recipientId, giftId }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handlePayment = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Create PaymentIntent
            const response = await fetch('/api/createPaymentIntent', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    amount,
                    recipientId,
                    giftId,
                }),
            });

            const { clientSecret, accountId } = await response.json();

            // Initialize Stripe
            const stripe = await stripePromise;

            // Confirm payment
            const { error: stripeError } = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: elements.getElement('card'),
                    billing_details: {
                        name: 'Gift Registry User',
                    },
                },
            });

            if (stripeError) {
                setError(stripeError.message);
            } else {
                // Payment successful - update your database here
                await updateGiftStatus(giftId, 'paid');
            }
        } catch (err) {
            setError('Payment failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handlePayment} className="max-w-md mx-auto p-4">
            <div className="mb-4">
                <label className="block text-gray-700 mb-2">
                    Amount to Pay: ${amount}
                </label>
                <div id="card-element" className="p-3 border rounded">
                    {/* Stripe Elements will be inserted here */}
                </div>
            </div>

            {error && (
                <div className="text-red-500 mb-4">
                    {error}
                </div>
            )}

            <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:opacity-50"
            >
                {loading ? 'Processing...' : 'Pay Now'}
            </button>
        </form>
    );
}