import React, { useState, useEffect } from 'react';
import SimpleCardBuilder from './SimpleCardBuilder';

const currencies = [
    { code: 'USD', name: 'US Dollar' },
    { code: 'EUR', name: 'Euro' },
    { code: 'GBP', name: 'British Pound' },
    { code: 'JPY', name: 'Japanese Yen' },
    { code: 'CAD', name: 'Canadian Dollar' },
    { code: 'AUD', name: 'Australian Dollar' },
    { code: 'CHF', name: 'Swiss Franc' },
    { code: 'CNY', name: 'Chinese Yuan' },
];

const InputForm = ({ formData, setFormData, setExpandedView, isStepMode = false }) => {
    const [selectedCurrency, setSelectedCurrency] = useState('USD');
    const [usdAmount, setUsdAmount] = useState(0);
    const [isConverting, setIsConverting] = useState(false);
    const [cardData, setCardData] = useState({
        canvasData: null
    });

    const formatMoney = (value) => {
        // If empty input, return 0
        if (!value) return 0.00;

        // Handle decimal point at the end
        if (value.endsWith('.')) {
            const num = parseFloat(value + '00');
            return isNaN(num) ? 0.00 : num;
        }

        // Regular case
        const num = parseFloat(value.replace(/[^\d.]/g, ''));
        return isNaN(num) ? 0.00 : parseFloat(num.toFixed(2));
    };

    const handleMoneyChange = (e) => {
        const formatted = formatMoney(e.target.value);
        setFormData(prev => ({ ...prev, amount: formatted }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCurrencyChange = (e) => {
        setSelectedCurrency(e.target.value);
    };

    // Convert amount to USD when currency or amount changes
    useEffect(() => {
        const convertToUSD = async () => {
            if (!formData.amount || formData.amount === 0 || selectedCurrency === 'USD') {
                setUsdAmount(formData.amount || 0);
                setIsConverting(false);
                return;
            }

            setIsConverting(true);
            try {
                const response = await fetch('https://wishlistagogo.vercel.app/api/convertToUsd', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        amount: formData.amount,
                        currency: selectedCurrency
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    console.log("DATA: ", data)
                    setUsdAmount(data.usdAmount);
                } else {
                    console.error('Currency conversion failed');
                    setUsdAmount(formData.amount || 0);
                }
            } catch (error) {
                console.error('Currency conversion error:', error);
                setUsdAmount(formData.amount || 0);
            } finally {
                setIsConverting(false);
            }
        };

        convertToUSD();
    }, [formData.amount, selectedCurrency]);

    // If in step mode, only show the card builder
    if (isStepMode) {
        return (
            <div style={{ padding: 0 }}>
                <div style={{
                    textAlign: 'center',
                    marginBottom: '24px'
                }}>
                    <h4 style={{
                        margin: '0 0 8px 0',
                        fontSize: '1.25rem',
                        fontWeight: '600',
                        color: '#111827'
                    }}>
                        Design Your Gift Card
                    </h4>
                    <p style={{
                        margin: '0',
                        color: '#6b7280',
                        fontSize: '0.875rem'
                    }}>
                        Create a personalized card that will be sent with your contribution
                    </p>
                </div>
                
                <SimpleCardBuilder
                    formData={formData}
                    setFormData={setFormData}
                    cardData={cardData}
                    setCardData={setCardData}
                />
            </div>
        );
    }

    return (
        <div>
            <h4 style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                marginBottom: '1.5rem',
                color: '#333',
                textAlign: 'center'
            }}>
                Personal Information
            </h4>

            <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                marginBottom: '2rem'
            }}>
                <div>
                    <label style={{
                        display: 'block',
                        marginBottom: '0.5rem',
                        fontWeight: '500',
                        color: '#374151'
                    }}>
                        Your Name
                    </label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter your name"
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            border: '1px solid #d1d5db',
                            borderRadius: '0.375rem',
                            fontSize: '1rem'
                        }}
                    />
                </div>

                <div>
                    <label style={{
                        display: 'block',
                        marginBottom: '0.5rem',
                        fontWeight: '500',
                        color: '#374151'
                    }}>
                        Contribution Amount
                    </label>
                    <div style={{
                        display: 'flex',
                        gap: '0.5rem'
                    }}>
                        <select
                            name="currency"
                            value={selectedCurrency}
                            onChange={handleCurrencyChange}
                            style={{
                                padding: '0.75rem',
                                border: '1px solid #d1d5db',
                                borderRadius: '0.375rem',
                                background: '#f9fafb',
                                minWidth: '100px'
                            }}
                        >
                            {currencies.map((currency) => (
                                <option key={currency.code} value={currency.code}>
                                    {currency.code}
                                </option>
                            ))}
                        </select>
                        <input
                            type="text"
                            name="amount"
                            value={formData.amount}
                            onChange={handleMoneyChange}
                            placeholder="0.00"
                            style={{
                                flex: 1,
                                padding: '0.75rem',
                                border: '1px solid #d1d5db',
                                borderRadius: '0.375rem',
                                fontSize: '1rem'
                            }}
                        />
                    </div>
                    {isConverting && (
                        <div style={{
                            marginTop: '0.5rem',
                            fontSize: '0.875rem',
                            color: '#6b7280'
                        }}>
                            Converting to USD...
                        </div>
                    )}
                </div>

                <div>
                    <label style={{
                        display: 'block',
                        marginBottom: '0.5rem',
                        fontWeight: '500',
                        color: '#374151'
                    }}>
                        Message (Optional)
                    </label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Add a personal message..."
                        rows="3"
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            border: '1px solid #d1d5db',
                            borderRadius: '0.375rem',
                            fontSize: '1rem',
                            resize: 'vertical'
                        }}
                    />
                </div>
            </div>

            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: '1rem'
            }}>
                <button
                    onClick={() => setExpandedView('PAYMENT')}
                    disabled={!formData.name || !formData.amount}
                    style={{
                        flex: 1,
                        padding: '0.75rem 1.5rem',
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.375rem',
                        fontSize: '1rem',
                        fontWeight: '500',
                        cursor: 'pointer',
                        opacity: (!formData.name || !formData.amount) ? 0.5 : 1
                    }}
                >
                    Continue to Payment
                </button>
            </div>
        </div>
    );
};

export default InputForm;