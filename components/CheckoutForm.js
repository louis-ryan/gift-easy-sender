import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useState } from 'react';
import { useRouter } from 'next/router';

const CheckoutForm = ({ giftAmount, giftCurrency, eventName }) => {
    const router = useRouter();
    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!stripe || !elements) return;

        setLoading(true);
        setError(null);

        try {
            const { error: submitError } = await elements.submit();
            if (submitError) throw submitError;

            // Redirect-based methods (iDEAL, Bancontact, ...) leave the site and come back to
            // return_url with ?payment_intent=…; card payments complete here and we send them
            // to the same page with the same parameter, so it can confirm the payment
            const successPath = `/for/${eventName}/success`;
            const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
                elements,
                confirmParams: { return_url: `${window.location.origin}${successPath}` },
                redirect: 'if_required',
            });

            if (confirmError) throw confirmError;

            router.push({
                pathname: successPath,
                query: { payment_intent: paymentIntent.id, redirect_status: paymentIntent.status === 'succeeded' ? 'succeeded' : paymentIntent.status },
            });
        } catch (err) {
            setError(err.message);
            console.error('Payment error:', err);
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="sender-checkout">
            <PaymentElement options={{ layout: { type: 'tabs', defaultCollapsed: false } }} />

            {error && <div className="sender-form-status error">{error}</div>}

            <button type="submit" className="sender-btn-large full" disabled={!stripe || loading}>
                {loading ? 'Processing…' : `Pay ${new Intl.NumberFormat('en-US', { style: 'currency', currency: giftCurrency || 'USD' }).format(giftAmount)}`}
            </button>
        </form>
    );
};

export default CheckoutForm;
