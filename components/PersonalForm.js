import React, { useState, useEffect } from 'react';

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

const fonts = [
    { name: 'Arial', value: 'Arial, sans-serif' },
    { name: 'Times New Roman', value: 'Times New Roman, serif' },
    { name: 'Georgia', value: 'Georgia, serif' },
    { name: 'Verdana', value: 'Verdana, sans-serif' },
    { name: 'Courier New', value: 'Courier New, monospace' },
    { name: 'Comic Sans MS', value: 'Comic Sans MS, cursive' },
    { name: 'Impact', value: 'Impact, fantasy' },
    { name: 'Tahoma', value: 'Tahoma, sans-serif' },
];

const CardBuilder = ({ cardData, setCardData }) => {
    const [selectedTab, setSelectedTab] = useState('message');
    const [uploading, setUploading] = useState(false);

    const handleImageUpload = async (file, type) => {
        setUploading(true);
        try {
            // Process and compress the image first
            const processedFile = await processAndCompressImage(file);
            
            // Upload to AWS S3
            const formData = new FormData();
            formData.append('file', processedFile);

            const response = await fetch('https://wishlistagogo.vercel.app/api/uploadToAWS', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) throw new Error('Upload failed');

            const resJSON = await response.json();
            const uploadedUrl = resJSON.url;
            
            if (type === 'background') {
                setCardData(prev => ({ ...prev, backgroundImage: uploadedUrl }));
            } else {
                setCardData(prev => ({ 
                    ...prev, 
                    images: [...(prev.images || []), uploadedUrl]
                }));
            }
        } catch (error) {
            console.error('Upload failed:', error);
            alert('Image upload failed. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const processAndCompressImage = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onerror = () => reject(new Error('FileReader failed'));
            reader.onload = (event) => {
                const img = new Image();
                img.onerror = () => reject(new Error('Image loading failed'));
                img.src = event.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');

                    let width = img.width;
                    let height = img.height;
                    
                    // Resize if too large (max 800px for card images)
                    const maxSize = 800;
                    if (width > height && width > maxSize) {
                        height = Math.round((height * maxSize) / width);
                        width = maxSize;
                    } else if (height > maxSize) {
                        width = Math.round((width * maxSize) / height);
                        height = maxSize;
                    }

                    canvas.width = width;
                    canvas.height = height;
                    ctx.drawImage(img, 0, 0, width, height);

                    canvas.toBlob((blob) => {
                        resolve(new File([blob], file.name.replace(/\.[^/.]+$/, '.jpg'), {
                            type: 'image/jpeg',
                            lastModified: Date.now()
                        }));
                    }, 'image/jpeg', 0.8);
                };
            };
        });
    };

    const removeImage = (index) => {
        setCardData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };

    const removeBackground = () => {
        setCardData(prev => ({ ...prev, backgroundImage: null }));
    };

    const generateCardHTML = () => {
        const { message, backgroundImage, font, images, textColor, fontSize } = cardData;
        
        return `
            <div style="
                width: 400px;
                height: 300px;
                background-image: ${backgroundImage ? `url('${backgroundImage}')` : 'none'};
                background-size: cover;
                background-position: center;
                border-radius: 15px;
                padding: 20px;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                position: relative;
                box-shadow: 0 4px 15px rgba(0,0,0,0.1);
                font-family: ${font || 'Arial, sans-serif'};
                color: ${textColor || '#333'};
                font-size: ${fontSize || '18px'};
                text-align: center;
                overflow: hidden;
            ">
                ${message ? `<p style="margin: 0; z-index: 2; position: relative;">${message}</p>` : ''}
                ${images && images.length > 0 ? `
                    <div style="
                        display: flex;
                        flex-wrap: wrap;
                        gap: 10px;
                        margin-top: 15px;
                        justify-content: center;
                        z-index: 2;
                        position: relative;
                    ">
                        ${images.map(img => `
                            <img src="${img}" style="
                                max-width: 80px;
                                max-height: 80px;
                                border-radius: 8px;
                                object-fit: cover;
                            " />
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        `;
    };

    return (
        <div>
            <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontSize: '0.9rem',
                fontWeight: '600',
                color: '#555'
            }}>
                Customize Your Card
            </label>

            {/* Tab Navigation */}
            <div style={{
                display: 'flex',
                marginBottom: '1rem',
                borderBottom: '1px solid #e1e5e9'
            }}>
                {['message', 'background', 'images', 'style'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setSelectedTab(tab)}
                        style={{
                            padding: '0.5rem 1rem',
                            border: 'none',
                            background: selectedTab === tab ? '#007bff' : 'transparent',
                            color: selectedTab === tab ? 'white' : '#666',
                            cursor: 'pointer',
                            borderRadius: '6px 6px 0 0',
                            fontSize: '0.9rem',
                            fontWeight: '500'
                        }}
                    >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div style={{ marginBottom: '1rem' }}>
                {selectedTab === 'message' && (
                    <div>
                        <textarea
                            placeholder="Write your message here..."
                            value={cardData.message || ''}
                            onChange={(e) => setCardData(prev => ({ ...prev, message: e.target.value }))}
                            rows={3}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                borderRadius: '8px',
                                border: '1px solid #e1e5e9',
                                fontSize: '1rem',
                                resize: 'vertical',
                                boxSizing: 'border-box'
                            }}
                        />
                    </div>
                )}

                {selectedTab === 'background' && (
                    <div>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                                Background Image
                            </label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (file) handleImageUpload(file, 'background');
                                }}
                                style={{ width: '100%' }}
                            />
                            {uploading && <p style={{ fontSize: '0.8rem', color: '#666' }}>Uploading...</p>}
                        </div>
                        {cardData.backgroundImage && (
                            <div style={{ marginTop: '1rem' }}>
                                <p style={{ fontSize: '0.8rem', marginBottom: '0.5rem' }}>Current Background:</p>
                                <div style={{ position: 'relative', display: 'inline-block' }}>
                                    <img 
                                        src={cardData.backgroundImage} 
                                        alt="Background preview"
                                        style={{ 
                                            width: '100px', 
                                            height: '60px', 
                                            objectFit: 'cover',
                                            borderRadius: '6px'
                                        }} 
                                    />
                                    <button
                                        onClick={removeBackground}
                                        style={{
                                            position: 'absolute',
                                            top: '-5px',
                                            right: '-5px',
                                            background: '#dc3545',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '50%',
                                            width: '20px',
                                            height: '20px',
                                            cursor: 'pointer',
                                            fontSize: '12px'
                                        }}
                                    >
                                        ×
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {selectedTab === 'images' && (
                    <div>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                                Add Images/GIFs
                            </label>
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={(e) => {
                                    Array.from(e.target.files).forEach(file => {
                                        handleImageUpload(file, 'images');
                                    });
                                }}
                                style={{ width: '100%' }}
                            />
                            {uploading && <p style={{ fontSize: '0.8rem', color: '#666' }}>Uploading...</p>}
                        </div>
                        {cardData.images && cardData.images.length > 0 && (
                            <div style={{ marginTop: '1rem' }}>
                                <p style={{ fontSize: '0.8rem', marginBottom: '0.5rem' }}>Added Images:</p>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                    {cardData.images.map((img, index) => (
                                        <div key={index} style={{ position: 'relative' }}>
                                            <img 
                                                src={img} 
                                                alt={`Card image ${index + 1}`}
                                                style={{ 
                                                    width: '60px', 
                                                    height: '60px', 
                                                    objectFit: 'cover',
                                                    borderRadius: '6px'
                                                }} 
                                            />
                                            <button
                                                onClick={() => removeImage(index)}
                                                style={{
                                                    position: 'absolute',
                                                    top: '-5px',
                                                    right: '-5px',
                                                    background: '#dc3545',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '50%',
                                                    width: '18px',
                                                    height: '18px',
                                                    cursor: 'pointer',
                                                    fontSize: '10px'
                                                }}
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {selectedTab === 'style' && (
                    <div>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                                Font Family
                            </label>
                            <select
                                value={cardData.font || 'Arial, sans-serif'}
                                onChange={(e) => setCardData(prev => ({ ...prev, font: e.target.value }))}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    borderRadius: '8px',
                                    border: '1px solid #e1e5e9',
                                    fontSize: '1rem'
                                }}
                            >
                                {fonts.map(font => (
                                    <option key={font.value} value={font.value}>
                                        {font.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                                Font Size
                            </label>
                            <input
                                type="range"
                                min="12"
                                max="32"
                                value={cardData.fontSize || 18}
                                onChange={(e) => setCardData(prev => ({ ...prev, fontSize: e.target.value }))}
                                style={{ width: '100%' }}
                            />
                            <span style={{ fontSize: '0.8rem', color: '#666' }}>
                                {cardData.fontSize || 18}px
                            </span>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                                Text Color
                            </label>
                            <input
                                type="color"
                                value={cardData.textColor || '#333'}
                                onChange={(e) => setCardData(prev => ({ ...prev, textColor: e.target.value }))}
                                style={{ width: '50px', height: '40px', border: 'none', borderRadius: '6px' }}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Live Preview */}
            <div style={{ marginTop: '1rem' }}>
                <p style={{ fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: '600' }}>
                    Preview:
                </p>
                <div 
                    dangerouslySetInnerHTML={{ __html: generateCardHTML() }}
                    style={{ display: 'flex', justifyContent: 'center' }}
                />
            </div>
        </div>
    );
};

const InputForm = ({ formData, setFormData, setExpandedView }) => {
    const [selectedCurrency, setSelectedCurrency] = useState('USD');
    const [usdAmount, setUsdAmount] = useState(0);
    const [isConverting, setIsConverting] = useState(false);
    const [cardData, setCardData] = useState({
        message: '',
        backgroundImage: null,
        images: [],
        font: 'Arial, sans-serif',
        textColor: '#333',
        fontSize: '18px'
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

            {/* Card Builder Component */}
            <CardBuilder cardData={cardData} setCardData={setCardData} />

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

            {formData.name && cardData.message && formData.amount && (
                <button
                    onClick={() => {
                        // Generate HTML for Stripe metadata
                        const cardHTML = `
                            <div style="
                                width: 400px;
                                height: 300px;
                                background-image: ${cardData.backgroundImage ? `url('${cardData.backgroundImage}')` : 'none'};
                                background-size: cover;
                                background-position: center;
                                border-radius: 15px;
                                padding: 20px;
                                display: flex;
                                flex-direction: column;
                                justify-content: center;
                                align-items: center;
                                position: relative;
                                box-shadow: 0 4px 15px rgba(0,0,0,0.1);
                                font-family: ${cardData.font};
                                color: ${cardData.textColor};
                                font-size: ${cardData.fontSize};
                                text-align: center;
                                overflow: hidden;
                            ">
                                <p style="margin: 0; z-index: 2; position: relative;">${cardData.message}</p>
                                ${cardData.images && cardData.images.length > 0 ? `
                                    <div style="
                                        display: flex;
                                        flex-wrap: wrap;
                                        gap: 10px;
                                        margin-top: 15px;
                                        justify-content: center;
                                        z-index: 2;
                                        position: relative;
                                    ">
                                        ${cardData.images.map(img => `
                                            <img src="${img}" style="
                                                max-width: 80px;
                                                max-height: 80px;
                                                border-radius: 8px;
                                                object-fit: cover;
                                            " />
                                        `).join('')}
                                    </div>
                                ` : ''}
                            </div>
                        `;

                        setFormData(prev => ({ 
                            ...prev, 
                            usdAmount: selectedCurrency === 'USD' ? formData.amount : usdAmount,
                            originalCurrency: selectedCurrency,
                            originalAmount: formData.amount,
                            cardHTML: cardHTML // Only store the HTML for Stripe metadata
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