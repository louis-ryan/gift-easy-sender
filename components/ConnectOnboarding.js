import { useState } from 'react';

export default function ConnectOnboarding({ userId, email }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const startOnboarding = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/createConnectAccount', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId,
                    email,
                }),
            });

            const { url } = await response.json();

            window.location.href = url;
        } catch (err) {
            setError('Failed to start onboarding. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h2>Set Up Your Gift Registry</h2>
            <p>
                To receive gift payments, you'll need to set up your bank account details.
                This process is secure and handled by Stripe.
            </p>

            {error && (
                <div>
                    {error}
                </div>
            )}

            <button
                onClick={startOnboarding}
                disabled={loading}
            >
                {loading ? 'Setting up...' : 'Set Up Payment Account'}
            </button>
        </div>
    );
}