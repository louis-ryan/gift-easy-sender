import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

const CheckoutForm = ({ giftAmount, giftCurrency, eventName }) => {
    const router = useRouter();
    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!stripe || !elements) return;

        setLoading(true);
        setError(null);

        try {
            const { error: submitError } = await elements.submit();
            if (submitError) throw submitError;

            // Redirect-based methods (iDEAL, Bancontact, ...) leave the site and come back to
            // return_url; card payments complete here and we send them to the same page
            const successPath = `/for/${eventName}/success`;
            const { error: confirmError } = await stripe.confirmPayment({
                elements,
                confirmParams: { return_url: `${window.location.origin}${successPath}` },
                redirect: "if_required"
            });

            if (confirmError) throw confirmError;

            setSuccess(true);
            router.push(successPath);
        } catch (err) {
            setError(err.message);
            console.error('Payment error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-md mx-auto p-4 space-y-4">
            <div>
                <h4>CARD DETAILS</h4>
                <div className="doublegapver" />
                <PaymentElement
                    options={{
                        layout: {
                            type: 'tabs',
                            defaultCollapsed: false,
                        },
                    }}
                />
            </div>

            <div className="gapver" />

            {error && <div>{error}</div>}

            <div className="gapver" />

            <button type="submit" disabled={!stripe || loading}>
                {loading ? 'Processing...' : `Pay ${new Intl.NumberFormat('en-US', { style: 'currency', currency: giftCurrency || 'USD' }).format(giftAmount)}`}
            </button>

            {success && (
                <div className="text-green-500 text-sm text-center">
                    Payment successful! Thank you for your gift.
                </div>
            )}
        </form>
    );
};

export default CheckoutForm;