import { useState, useEffect } from 'react';
import fetch from 'isomorphic-unfetch';
import { useRouter } from 'next/router';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import PersonalForm from '../../../components/PersonalForm';
import GiftPaymentForm from '../../../components/GiftPaymentForm';
import CoverImage from '../../../components/CoverImage';

const Note = () => {

    const [recipient, setRecipient] = useState({})
    const [event, setEvent] = useState({})
    const [wishes, setWishes] = useState([])
    const [thisWish, setThisWish] = useState({})
    const [intentKey, setIntentKey] = useState(null)
    const [currentStep, setCurrentStep] = useState(1)
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        amount: '',
        currency: 'USD',
        messageType: 'none', // 'none', 'simple', 'card'
        cardHTML: '',
        cardText: '',
        backgroundImage: '',
        overlayImages: []
    });

    const router = useRouter()
    const eventName = router.query.id

    const organizePaymentsByGift = (payments, wishes) => {

        let updatedWishes

        updatedWishes = [...wishes]

        payments.forEach(payment => {
            console.log("payment: ", payment)
            wishes.forEach((wish, idx) => {
                if (payment.giftId === wish._id) {
                    updatedWishes[idx] = { ...wish, paid: wish.paid = wish.paid + payment.amount }
                }
            })
        });

        setWishes(updatedWishes)
    }

    const getPaymentsData = async (eventId, wishes) => {
        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_REGISTRY_URL}/api/getStripePaymentsForEvent?eventId=${eventId}`,
                {
                    method: 'GET',
                    credentials: 'include',  // Important for CORS with credentials
                    headers: {
                        'Content-Type': 'application/json',
                        // No need to explicitly set Origin as browser will do this
                    }
                }
            );
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            const { payments } = await res.json();
            organizePaymentsByGift(payments, wishes);
        } catch (error) {
            console.error("Error fetching payments:", error);
        }
    }

    const getRecipientAccount = async (sub) => {
        try {
            const recipientRes = await fetch(`${process.env.NEXT_PUBLIC_REGISTRY_URL}/api/getAccountForThisUser/${sub}||"`);
            const { data } = await recipientRes.json();
            setRecipient(data)
        } catch (error) {
            console.error("Error getting recipient account id:", error);
        }
    }

    const getWishesData = async (eventId) => {
        const noteRes = await fetch(`${process.env.NEXT_PUBLIC_REGISTRY_URL}/api/getNotesBy/${eventId}`);
        const { noteData } = await noteRes.json();
        const noteDataWithPaid = []
        noteData.forEach((note) => {
            noteDataWithPaid.push({ ...note, price: parseFloat(note.price), paid: 0 })
        })
        setWishes(noteDataWithPaid)
        getPaymentsData(eventId, noteDataWithPaid)
    }

    const getEventData = async (eventName) => {
        const eventRes = await fetch(`${process.env.NEXT_PUBLIC_REGISTRY_URL}/api/getEventBy/${eventName}`);
        const { eventData } = await eventRes.json();
        setEvent(eventData)
        getRecipientAccount(eventData.user)
        getWishesData(eventData._id)
    }

    const getInitialProps = async () => {
        if (!eventName) return
        getEventData(eventName)
    }

    useEffect(() => {
        getInitialProps(eventName)
    }, [router])

    const handleNextStep = () => {
        setCurrentStep(currentStep + 1);
    };

    const handlePrevStep = () => {
        setCurrentStep(currentStep - 1);
    };

    const handleClosePayment = () => {
        setThisWish({});
        setCurrentStep(1);
        setFormData({
            name: '',
            description: '',
            amount: '',
            currency: 'USD',
            messageType: 'none', // 'none', 'simple', 'card'
            cardHTML: '',
            cardText: '',
            backgroundImage: '',
            overlayImages: []
        });
    };

    const renderStepIndicator = () => (
        <div style={{
            padding: '24px 32px',
            background: '#f9fafb',
            borderBottom: '1px solid #e5e7eb'
        }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '16px'
            }}>
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px'
                }}>
                    <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: currentStep >= 1 ? '#3b82f6' : '#e5e7eb',
                        color: currentStep >= 1 ? 'white' : '#6b7280',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: '600',
                        fontSize: '14px',
                        transition: 'all 0.3s'
                    }}>
                        1
                    </div>
                    <div style={{
                        fontSize: '12px',
                        color: currentStep >= 1 ? '#3b82f6' : '#6b7280',
                        fontWeight: '500'
                    }}>
                        Details
                    </div>
                </div>
                <div style={{
                    width: '60px',
                    height: '2px',
                    background: currentStep >= 2 ? '#3b82f6' : '#e5e7eb',
                    transition: 'all 0.3s'
                }}></div>
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px'
                }}>
                    <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: currentStep >= 2 ? '#3b82f6' : '#e5e7eb',
                        color: currentStep >= 2 ? 'white' : '#6b7280',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: '600',
                        fontSize: '14px',
                        transition: 'all 0.3s'
                    }}>
                        2
                    </div>
                    <div style={{
                        fontSize: '12px',
                        color: currentStep >= 2 ? '#3b82f6' : '#6b7280',
                        fontWeight: '500'
                    }}>
                        Message
                    </div>
                </div>
                <div style={{
                    width: '60px',
                    height: '2px',
                    background: currentStep >= 3 ? '#3b82f6' : '#e5e7eb',
                    transition: 'all 0.3s'
                }}></div>
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px'
                }}>
                    <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: currentStep >= 3 ? '#3b82f6' : '#e5e7eb',
                        color: currentStep >= 3 ? 'white' : '#6b7280',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: '600',
                        fontSize: '14px',
                        transition: 'all 0.3s'
                    }}>
                        3
                    </div>
                    <div style={{
                        fontSize: '12px',
                        color: currentStep >= 3 ? '#3b82f6' : '#6b7280',
                        fontWeight: '500'
                    }}>
                        Payment
                    </div>
                </div>
            </div>
        </div>
    );

    const renderStep1 = () => (
        <div style={{ padding: '32px' }}>
            <div style={{
                textAlign: 'center',
                marginBottom: '32px'
            }}>
                <h3 style={{
                    margin: '0 0 8px 0',
                    fontSize: '1.5rem',
                    fontWeight: '600',
                    color: '#111827'
                }}>
                    Your Contribution Details
                </h3>
                <p style={{
                    margin: '0',
                    color: '#6b7280',
                    fontSize: '0.875rem'
                }}>
                    Tell us about your gift contribution
                </p>
            </div>
            
            <div style={{ marginBottom: '24px' }}>
                <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: '500',
                    color: '#374151',
                    fontSize: '0.875rem'
                }}>
                    Your Name
                </label>
                <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Enter your name"
                    style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '1rem',
                        transition: 'all 0.2s',
                        boxSizing: 'border-box'
                    }}
                />
            </div>

            <div style={{ marginBottom: '24px' }}>
                <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: '500',
                    color: '#374151',
                    fontSize: '0.875rem'
                }}>
                    Contribution Amount
                </label>
                <div style={{
                    display: 'flex',
                    gap: '8px'
                }}>
                    <select
                        value={formData.currency}
                        onChange={(e) => setFormData({...formData, currency: e.target.value})}
                        style={{
                            padding: '12px 16px',
                            border: '1px solid #d1d5db',
                            borderRadius: '8px',
                            background: '#f9fafb',
                            fontSize: '1rem',
                            minWidth: '80px'
                        }}
                    >
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="GBP">GBP</option>
                        <option value="JPY">JPY</option>
                        <option value="CAD">CAD</option>
                        <option value="AUD">AUD</option>
                        <option value="CHF">CHF</option>
                        <option value="CNY">CNY</option>
                    </select>
                    <input
                        type="number"
                        value={formData.amount}
                        onChange={(e) => setFormData({...formData, amount: e.target.value})}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        style={{
                            flex: 1,
                            padding: '12px 16px',
                            border: '1px solid #d1d5db',
                            borderRadius: '8px',
                            fontSize: '1rem',
                            transition: 'all 0.2s',
                            boxSizing: 'border-box'
                        }}
                    />
                </div>
            </div>

            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: '16px',
                marginTop: '32px'
            }}>
                <button
                    onClick={handleClosePayment}
                    style={{
                        padding: '12px 24px',
                        borderRadius: '8px',
                        fontWeight: '500',
                        fontSize: '0.875rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        border: 'none',
                        minWidth: '120px',
                        background: '#f3f4f6',
                        color: '#374151',
                        border: '1px solid #d1d5db'
                    }}
                >
                    Cancel
                </button>
                <button
                    onClick={handleNextStep}
                    disabled={!formData.name || !formData.amount}
                    style={{
                        padding: '12px 24px',
                        borderRadius: '8px',
                        fontWeight: '500',
                        fontSize: '0.875rem',
                        cursor: !formData.name || !formData.amount ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s',
                        border: 'none',
                        minWidth: '120px',
                        background: (!formData.name || !formData.amount) ? '#9ca3af' : '#3b82f6',
                        color: 'white',
                        opacity: (!formData.name || !formData.amount) ? 0.5 : 1
                    }}
                >
                    Continue to Message
                </button>
            </div>
        </div>
    );

    const renderStep2 = () => (
        <div style={{ padding: '32px' }}>
            <div style={{
                textAlign: 'center',
                marginBottom: '32px'
            }}>
                <h3 style={{
                    margin: '0 0 8px 0',
                    fontSize: '1.5rem',
                    fontWeight: '600',
                    color: '#111827'
                }}>
                    Add a Personal Touch
                </h3>
                <p style={{
                    margin: '0',
                    color: '#6b7280',
                    fontSize: '0.875rem'
                }}>
                    Choose how you'd like to personalize your contribution
                </p>
            </div>
            
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                marginBottom: '32px'
            }}>
                {/* Option 1: No Message */}
                <div
                    onClick={() => setFormData({...formData, messageType: 'none'})}
                    style={{
                        padding: '20px',
                        border: `2px solid ${formData.messageType === 'none' ? '#3b82f6' : '#e5e7eb'}`,
                        borderRadius: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        background: formData.messageType === 'none' ? '#f0f9ff' : 'white'
                    }}
                >
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px'
                    }}>
                        <div style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            border: `2px solid ${formData.messageType === 'none' ? '#3b82f6' : '#d1d5db'}`,
                            background: formData.messageType === 'none' ? '#3b82f6' : 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            {formData.messageType === 'none' && (
                                <div style={{
                                    width: '8px',
                                    height: '8px',
                                    borderRadius: '50%',
                                    background: 'white'
                                }}></div>
                            )}
                        </div>
                        <div>
                            <h4 style={{
                                margin: '0 0 4px 0',
                                fontSize: '1.125rem',
                                fontWeight: '600',
                                color: '#111827'
                            }}>
                                No Message
                            </h4>
                            <p style={{
                                margin: '0',
                                fontSize: '0.875rem',
                                color: '#6b7280'
                            }}>
                                Send your contribution without any additional message
                            </p>
                        </div>
                    </div>
                </div>

                {/* Option 2: Simple Message */}
                <div
                    onClick={() => setFormData({...formData, messageType: 'simple'})}
                    style={{
                        padding: '20px',
                        border: `2px solid ${formData.messageType === 'simple' ? '#3b82f6' : '#e5e7eb'}`,
                        borderRadius: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        background: formData.messageType === 'simple' ? '#f0f9ff' : 'white'
                    }}
                >
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px'
                    }}>
                        <div style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            border: `2px solid ${formData.messageType === 'simple' ? '#3b82f6' : '#d1d5db'}`,
                            background: formData.messageType === 'simple' ? '#3b82f6' : 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            {formData.messageType === 'simple' && (
                                <div style={{
                                    width: '8px',
                                    height: '8px',
                                    borderRadius: '50%',
                                    background: 'white'
                                }}></div>
                            )}
                        </div>
                        <div>
                            <h4 style={{
                                margin: '0 0 4px 0',
                                fontSize: '1.125rem',
                                fontWeight: '600',
                                color: '#111827'
                            }}>
                                Simple Message
                            </h4>
                            <p style={{
                                margin: '0',
                                fontSize: '0.875rem',
                                color: '#6b7280'
                            }}>
                                Add a short personal message to your contribution
                            </p>
                        </div>
                    </div>
                </div>

                {/* Option 3: Card Builder */}
                <div
                    onClick={() => setFormData({...formData, messageType: 'card'})}
                    style={{
                        padding: '20px',
                        border: `2px solid ${formData.messageType === 'card' ? '#3b82f6' : '#e5e7eb'}`,
                        borderRadius: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        background: formData.messageType === 'card' ? '#f0f9ff' : 'white'
                    }}
                >
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px'
                    }}>
                        <div style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            border: `2px solid ${formData.messageType === 'card' ? '#3b82f6' : '#d1d5db'}`,
                            background: formData.messageType === 'card' ? '#3b82f6' : 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            {formData.messageType === 'card' && (
                                <div style={{
                                    width: '8px',
                                    height: '8px',
                                    borderRadius: '50%',
                                    background: 'white'
                                }}></div>
                            )}
                        </div>
                        <div>
                            <h4 style={{
                                margin: '0 0 4px 0',
                                fontSize: '1.125rem',
                                fontWeight: '600',
                                color: '#111827'
                            }}>
                                Design a Card
                            </h4>
                            <p style={{
                                margin: '0',
                                fontSize: '0.875rem',
                                color: '#6b7280'
                            }}>
                                Create a personalized digital card with images and text
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Show message input if simple message is selected */}
            {formData.messageType === 'simple' && (
                <div style={{ marginBottom: '24px' }}>
                    <label style={{
                        display: 'block',
                        marginBottom: '8px',
                        fontWeight: '500',
                        color: '#374151',
                        fontSize: '0.875rem'
                    }}>
                        Your Message
                    </label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        placeholder="Add a personal message..."
                        rows="4"
                        style={{
                            width: '100%',
                            padding: '12px 16px',
                            border: '1px solid #d1d5db',
                            borderRadius: '8px',
                            fontSize: '1rem',
                            fontFamily: 'inherit',
                            resize: 'vertical',
                            minHeight: '100px',
                            transition: 'all 0.2s',
                            boxSizing: 'border-box'
                        }}
                    />
                </div>
            )}

            {/* Show card builder if card is selected */}
            {formData.messageType === 'card' && (
                <div style={{ marginBottom: '24px' }}>
                    <PersonalForm
                        formData={formData}
                        setFormData={setFormData}
                        setExpandedView={() => {}}
                        isStepMode={true}
                    />
                </div>
            )}

            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: '16px',
                marginTop: '32px'
            }}>
                <button
                    onClick={handlePrevStep}
                    style={{
                        padding: '12px 24px',
                        borderRadius: '8px',
                        fontWeight: '500',
                        fontSize: '0.875rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        border: 'none',
                        minWidth: '120px',
                        background: '#f3f4f6',
                        color: '#374151',
                        border: '1px solid #d1d5db'
                    }}
                >
                    Back
                </button>
                <button
                    onClick={handleNextStep}
                    style={{
                        padding: '12px 24px',
                        borderRadius: '8px',
                        fontWeight: '500',
                        fontSize: '0.875rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        border: 'none',
                        minWidth: '120px',
                        background: '#3b82f6',
                        color: 'white'
                    }}
                >
                    Continue to Payment
                </button>
            </div>
        </div>
    );

    const renderStep3 = () => (
        <div style={{ padding: '32px' }}>
            <div style={{
                textAlign: 'center',
                marginBottom: '32px'
            }}>
                <h3 style={{
                    margin: '0 0 8px 0',
                    fontSize: '1.5rem',
                    fontWeight: '600',
                    color: '#111827'
                }}>
                    Complete Your Payment
                </h3>
                <p style={{
                    margin: '0',
                    color: '#6b7280',
                    fontSize: '0.875rem'
                }}>
                    Securely process your contribution
                </p>
            </div>
            
            <div style={{
                background: '#f9fafb',
                borderRadius: '8px',
                padding: '20px',
                marginBottom: '24px'
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 0',
                    borderBottom: '1px solid #e5e7eb'
                }}>
                    <span style={{
                        color: '#6b7280',
                        fontSize: '0.875rem'
                    }}>
                        Contribution to:
                    </span>
                    <span style={{
                        fontWeight: '500',
                        color: '#111827'
                    }}>
                        {thisWish.title}
                    </span>
                </div>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 0',
                    borderBottom: '1px solid #e5e7eb'
                }}>
                    <span style={{
                        color: '#6b7280',
                        fontSize: '0.875rem'
                    }}>
                        Amount:
                    </span>
                    <span style={{
                        fontWeight: '500',
                        color: '#111827'
                    }}>
                        {formData.amount} {formData.currency}
                    </span>
                </div>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 0'
                }}>
                    <span style={{
                        color: '#6b7280',
                        fontSize: '0.875rem'
                    }}>
                        From:
                    </span>
                    <span style={{
                        fontWeight: '500',
                        color: '#111827'
                    }}>
                        {formData.name}
                    </span>
                </div>
            </div>

            <div style={{ margin: '24px 0' }}>
                <GiftPaymentForm
                    recipientId={recipient.stripeAccountId}
                    giftAmount={formData.amount}
                    giftCurrency={formData.currency}
                    eventName={eventName}
                    giftId={thisWish._id}
                    eventId={event._id}
                    getPaymentsData={getPaymentsData}
                    senderName={formData.name}
                    description={formData.description}
                    cardHTML={formData.cardHTML}
                    cardText={formData.cardText}
                    backgroundImage={formData.backgroundImage}
                    overlayImages={formData.overlayImages}
                    idempotencyKey={intentKey}
                />
            </div>

            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: '16px',
                marginTop: '32px'
            }}>
                <button
                    onClick={handlePrevStep}
                    style={{
                        padding: '12px 24px',
                        borderRadius: '8px',
                        fontWeight: '500',
                        fontSize: '0.875rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        border: 'none',
                        minWidth: '120px',
                        background: '#f3f4f6',
                        color: '#374151',
                        border: '1px solid #d1d5db'
                    }}
                >
                    Back
                </button>
            </div>
        </div>
    );

    return (

        <div className="container">
            <div className="wrapper">
                <CoverImage
                    imageUrl={event.imageUrl}
                />
                <div style={{ padding: "8px" }}>
                    <h1>{event.name}</h1>
                    <h3>{event.description}</h3>
                    {!thisWish._id &&
                        <div className="cardspace">
                            {wishes.map((wish, idx) => {
                                const paidConvert = Math.ceil(wish.paid / wish.price * wish.amount)
                                const remainingVal = wish.price - wish.paid
                                const data = [
                                    { name: "PAID", value: wish.paid, color: "#143950" },
                                    { name: "REMAINING", value: remainingVal, color: "white" }
                                ]
                                return (
                                    <div
                                        key={idx}
                                        className='card'
                                        style={{ position: "relative", overflow: "hidden" }}
                                    >

                                        {wish.noteUrl && (
                                            <img
                                                src={wish.noteUrl}
                                                alt="note image"
                                                style={{
                                                    position: "absolute",
                                                    height: "100%",
                                                    zIndex: "-1",
                                                    objectFit: "cover",
                                                    left: "50%",
                                                    top: "50%",
                                                    transform: "translate(-50%, -50%)"
                                                }}
                                            />
                                        )}

                                        <div style={{ backgroundColor: "white", padding: "16px", opacity: "0.9" }}>
                                            <h3>{wish.title}</h3>
                                            <h4>
                                                {paidConvert ? paidConvert : wish.paid}
                                                {wish.currency ? wish.currency : 'USD'}
                                                {' of '}
                                                {wish.amount ? wish.amount : wish.price}
                                                {wish.currency ? wish.currency : 'USD'}
                                            </h4>
                                            <p>
                                                {wish.senders && wish.senders.length}
                                                {wish.senders ?
                                                    ` contributer${wish.senders.length < 2 ? '' : 's'}` :
                                                    "no contributions yet"}
                                            </p>
                                        </div>

                                        <div className='doublegapver' />

                                        <div style={{ opacity: "0.9" }}>
                                            <ResponsiveContainer
                                                width="100%"
                                                height={160}
                                            >
                                                <PieChart>
                                                    <Pie
                                                        data={data}
                                                        cx="50%"
                                                        cy="50%"
                                                        innerRadius={0}
                                                        outerRadius={80}
                                                        dataKey="value"
                                                        paddingAngle={0}
                                                    >
                                                        {data.map((entry, index) => (
                                                            <Cell
                                                                key={entry.name}
                                                                fill={entry.color}
                                                            />
                                                        ))}
                                                    </Pie>
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>

                                        <div className='doublegapver' />

                                        <button
                                            onClick={() => { setThisWish(wish); setIntentKey(`${wish._id}-${Date.now()}`); }}
                                            style={{ width: "100%" }}
                                        >
                                            {"Contribute"}
                                        </button>

                                    </div>
                                )

                            })}
                        </div>
                    }

                    {thisWish._id && event &&
                        <div style={{
                            background: 'white',
                            borderRadius: '12px',
                            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                            margin: '20px 0',
                            overflow: 'hidden'
                        }}>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '24px 32px',
                                borderBottom: '1px solid #e5e7eb',
                                background: '#f9fafb'
                            }}>
                                <div>
                                    <h3 style={{
                                        margin: '0',
                                        fontSize: '1.5rem',
                                        fontWeight: '600',
                                        color: '#111827'
                                    }}>
                                        Contribute to {thisWish.title}
                                    </h3>
                                    <p style={{
                                        margin: '4px 0 0 0',
                                        color: '#6b7280',
                                        fontSize: '0.875rem'
                                    }}>
                                        Complete your gift contribution
                                    </p>
                                </div>
                                <button
                                    onClick={handleClosePayment}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        fontSize: '24px',
                                        color: '#6b7280',
                                        cursor: 'pointer',
                                        padding: '8px',
                                        borderRadius: '6px',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    ×
                                </button>
                            </div>

                            {renderStepIndicator()}

                            {currentStep === 1 && renderStep1()}
                            {currentStep === 2 && renderStep2()}
                            {currentStep === 3 && renderStep3()}
                        </div>
                    }

                    <div className='doublegapver' />
                    <div className='doublegapver' />
                    <div className='doublegapver' />
                </div>
            </div>
        </div>

    )
}

export default Note;