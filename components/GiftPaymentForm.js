import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useState, useEffect } from 'react';
import CheckoutForm from './CheckoutForm';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

const GiftPaymentForm = ({ recipientId, giftAmount, eventName, giftId, eventId, getPaymentsData, senderName, description, cardHTML }) => {
    const [clientSecret, setClientSecret] = useState(null);

    useEffect(() => {
        const createIntent = async () => {
            try {
                const response = await fetch('https://wishlistagogo.vercel.app/api/createPaymentIntent', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify({
                        amount: giftAmount,
                        recipientId,
                        giftId,
                        eventId,
                        senderName,
                        description,
                        cardHTML
                    }),
                });

                const data = await response.json();
                setClientSecret(data.clientSecret);
            } catch (err) {
                console.error('Error creating payment intent:', err);
            }
        };

        createIntent();
    }, [giftAmount, recipientId, giftId, eventId, cardHTML]);

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