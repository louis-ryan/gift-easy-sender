import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useState, useEffect } from 'react';

// Initialize Stripe with your publishable key
const stripePromise = loadStripe("pk_test_51QIZDoBA4OL48GP496gr6YabbIGhw1zzM4O7XhIAV52InnQp2tehgnZnRdCVRvzMCEmVI5QbIwfdIu51VcMN8utz00rDDwIK9Z");

// CheckoutForm Component (Inner form component)
const CheckoutForm = ({ recipientId, giftAmount }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const { error: submitError } = await elements.submit();
            if (submitError) {
                throw submitError;
            }

            const response = await fetch('https://wishlistsundayplatform.vercel.app/api/createPaymentIntent', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    amount: giftAmount,
                    recipientId: recipientId,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to create payment intent');
            }

            const { clientSecret } = await response.json();

            const { error: confirmError } = await stripe.confirmPayment({
                elements,
                clientSecret,
                confirmParams: {
                    return_url: `${window.location.origin}/payment-complete`,
                },
            });

            if (confirmError) {
                throw confirmError;
            }

            setSuccess(true);
        } catch (err) {
            setError(err.message);
            console.error('Payment error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-md mx-auto p-4 space-y-4">
            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                    Card Details
                </label>
                <PaymentElement
                    className="p-3 border rounded-md"
                    options={{
                        layout: {
                            type: 'tabs',
                            defaultCollapsed: false,
                        },
                    }}
                />
            </div>

            {error && (
                <div className="text-red-500 text-sm">
                    {error}
                </div>
            )}

            <button
                type="submit"
                disabled={!stripe || loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 
                 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                {loading ? 'Processing...' : `Pay $${giftAmount}`}
            </button>

            {success && (
                <div className="text-green-500 text-sm text-center">
                    Payment successful! Thank you for your gift.
                </div>
            )}
        </form>
    );
};

// Main component wrapper
const GiftPaymentForm = ({ recipientId, giftAmount }) => {
    const [clientSecret, setClientSecret] = useState(null);

    useEffect(() => {
        // Create PaymentIntent when component mounts
        const createIntent = async () => {
            try {
                const response = await fetch('https://wishlistsundayplatform.vercel.app/api/createPaymentIntent', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        amount: giftAmount,
                        recipientId: recipientId,
                    }),
                });

                const data = await response.json();
                setClientSecret(data.clientSecret);
            } catch (err) {
                console.error('Error creating payment intent:', err);
            }
        };

        createIntent();
    }, [giftAmount, recipientId]);

    if (!clientSecret) {
        return (
            <div className="text-center py-4">
                Loading payment form...
            </div>
        );
    }

    return (
        <Elements
            stripe={stripePromise}
            options={{
                clientSecret,
                appearance: {
                    theme: 'stripe',
                    variables: {
                        colorPrimary: '#0055FF',
                        colorBackground: '#ffffff',
                        colorText: '#30313d',
                        colorDanger: '#df1b41',
                        fontFamily: 'system-ui, sans-serif',
                        spacingUnit: '4px',
                        borderRadius: '4px',
                    },
                },
            }}
        >
            <CheckoutForm recipientId={recipientId} giftAmount={giftAmount} />
        </Elements>
    );
};

export default GiftPaymentForm;