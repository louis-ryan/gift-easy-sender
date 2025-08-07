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

const InputForm = ({ formData, setFormData, setExpandedView }) => {
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

    return (
        <div>
            <h4 style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                marginBottom: '1.5rem',
                color: '#333',
                textAlign: 'center'
            }}>
                Personal Details
            </h4>

            <div>
                <label htmlFor="name" style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    color: '#555'
                }}>
                    Recipient Name
                </label>
                <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter recipient's name"
                    style={{
                        width: '100%',
                        padding: '0.75rem',
                        borderRadius: '8px',
                        border: '1px solid #e1e5e9',
                        fontSize: '1rem',
                        color: '#333',
                        transition: 'all 0.3s ease',
                        boxSizing: 'border-box',
                        background: '#fff'
                    }}
                />
            </div>

            <div className="doublegapver" />

            <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 2fr',
                gap: '1rem'
            }}>
                <div>
                    <label htmlFor="currency" style={{
                        display: 'block',
                        marginBottom: '0.5rem',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        color: '#555'
                    }}>
                        Currency
                    </label>
                    <select
                        id="currency"
                        name="currency"
                        value={selectedCurrency}
                        onChange={handleCurrencyChange}
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            borderRadius: '8px',
                            border: '1px solid #e1e5e9',
                            fontSize: '1rem',
                            color: '#333',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            background: '#fff'
                        }}
                    >
                        {currencies.map((currency) => (
                            <option key={currency.code} value={currency.code}>
                                {currency.code}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label htmlFor="amount" style={{
                        display: 'block',
                        marginBottom: '0.5rem',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        color: '#555'
                    }}>
                        Amount ({selectedCurrency})
                    </label>
                    <input
                        type="text"
                        id="amount"
                        name="amount"
                        value={formData.amount}
                        onChange={handleMoneyChange}
                        placeholder={`0.00 ${selectedCurrency}`}
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            borderRadius: '8px',
                            border: '1px solid #e1e5e9',
                            fontSize: '1rem',
                            color: '#333',
                            transition: 'all 0.3s ease',
                            boxSizing: 'border-box',
                            background: '#fff'
                        }}
                    />
                    {formData.amount && formData.amount > 0 && selectedCurrency !== 'USD' && (
                        <div style={{
                            fontSize: '0.8rem',
                            color: '#666',
                            marginTop: '0.5rem',
                            padding: '0.5rem',
                            background: '#f8f9fa',
                            borderRadius: '6px',
                            textAlign: 'center',
                            border: '1px solid #e9ecef'
                        }}>
                            {isConverting ? (
                                <span>🔄 Converting to USD...</span>
                            ) : (
                                <span>💱 ≈ ${usdAmount.toFixed(2)} USD</span>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className="doublegapver" />

            {/* Working Fabric.js Card Builder */}
            <SimpleCardBuilder cardData={cardData} setCardData={setCardData} />

            <div className="doublegapver" />

            {/* Transaction Info */}
            <div style={{
                background: '#f8f9fa',
                padding: '1rem',
                borderRadius: '8px',
                marginBottom: '1rem',
                border: '1px solid #e9ecef'
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '0.5rem'
                }}>
                    <span style={{ fontSize: '1rem' }}>💳</span>
                    <strong style={{ fontSize: '0.9rem', color: '#495057' }}>Transaction Information</strong>
                </div>
                <p style={{
                    fontSize: '0.85rem',
                    margin: '0',
                    color: '#6c757d',
                    lineHeight: '1.4'
                }}>
                    All transactions are processed in USD.
                    {selectedCurrency !== 'USD' && formData.amount > 0 ? (
                        <span> Your {selectedCurrency} amount will be converted to ${usdAmount.toFixed(2)} USD.</span>
                    ) : (
                        <span> Your amount will be processed in USD.</span>
                    )}
                </p>
            </div>

            <div className="doublegapver" />

            {formData.name && cardData.cardHTML && formData.amount && (
                <button
                    onClick={() => {
                        // The SimpleCardBuilder now manages its own state and passes the generated HTML via setCardData
                        // The cardHTML is already updated in cardData by SimpleCardBuilder's updateCardData function
                        setFormData(prev => ({ 
                            ...prev, 
                            usdAmount: selectedCurrency === 'USD' ? formData.amount : usdAmount,
                            originalCurrency: selectedCurrency,
                            originalAmount: formData.amount,
                            cardHTML: cardData.cardHTML,
                            cardText: cardData.cardText,
                            backgroundImage: cardData.backgroundImage,
                            overlayImages: cardData.overlayImages
                        }));
                        setExpandedView('PAYMENT');
                    }}
                    style={{
                        width: '100%',
                        padding: '0.75rem',
                        borderRadius: '8px',
                        border: 'none',
                        background: 'linear-gradient(45deg, #007bff, #0056b3)',
                        color: 'white',
                        fontSize: '1rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 2px 8px rgba(0, 123, 255, 0.3)'
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.transform = 'translateY(-1px)';
                        e.target.style.boxShadow = '0 4px 12px rgba(0, 123, 255, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = '0 2px 8px rgba(0, 123, 255, 0.3)';
                    }}
                >
                    Continue to Payment
                </button>
            )}
        </div>
    );
};

export default InputForm;