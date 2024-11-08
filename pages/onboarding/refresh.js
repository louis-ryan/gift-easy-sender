import { useState, useEffect } from 'react';

export default function OnboardingRefresh() {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const refreshOnboarding = async () => {
            try {
                const response = await fetch('/api/createConnectAccount', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        userId: currentUser.id,
                        email: currentUser.email,
                    }),
                });

                const { url } = await response.json();
                window.location.href = url;
            } catch (error) {
                console.error('Error refreshing onboarding:', error);
            }
        };

        refreshOnboarding();
    }, []);

    return (
        <div className="max-w-md mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Resuming Account Setup...</h1>
            <p>Please wait while we redirect you back to the account setup process.</p>
        </div>
    );
}