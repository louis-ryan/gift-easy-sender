import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useState, useEffect, useRef } from 'react';
import CheckoutForm from './CheckoutForm';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

const GiftPaymentForm = ({ recipientId, giftAmount, eventName, giftId, eventId, getPaymentsData, senderName, description, cardHTML, cardText, backgroundImage, overlayImages, idempotencyKey }) => {
    const [clientSecret, setClientSecret] = useState(null);
    const [intentError, setIntentError] = useState(null);
    const intentCreated = useRef(false);

    useEffect(() => {
        if (!idempotencyKey || intentCreated.current) return;
        intentCreated.current = true;

        const createIntent = async () => {
            try {
                const response = await fetch('${process.env.NEXT_PUBLIC_REGISTRY_URL}/api/createPaymentIntent', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Idempotency-Key': idempotencyKey,
                    },
                    credentials: 'include',
                    body: JSON.stringify({
                        amount: giftAmount,
                        recipientId,
                        giftId,
                        eventId,
                        senderName,
                        description,
                        cardHTML,
                        cardText,
                        backgroundImage,
                        overlayImages
                    }),
                });

                const data = await response.json();
                if (!response.ok) throw new Error(data.error || 'Failed to initialise payment');
                setClientSecret(data.clientSecret);
            } catch (err) {
                console.error('Error creating payment intent:', err);
                setIntentError(err.message);
            }
        };

        createIntent();
    }, [idempotencyKey]);

    if (intentError) {
        return <div className="text-center py-4" style={{ color: '#ef4444' }}>Failed to load payment form: {intentError}</div>;
    }

    if (!clientSecret) {
        return <div className="text-center py-4">Loading payment form...</div>;
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
            <CheckoutForm
                recipientId={recipientId}
                giftAmount={giftAmount}
                eventName={eventName}
                giftId={giftId}
                eventId={eventId}
                getPaymentsData={getPaymentsData}
            />
        </Elements>
    );
};

export default GiftPaymentForm;