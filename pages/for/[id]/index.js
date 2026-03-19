import { useState, useEffect } from 'react';
import fetch from 'isomorphic-unfetch';
import { useRouter } from 'next/router';
import GiftPaymentForm from '../../../components/GiftPaymentForm';
import SimpleCardBuilder from '../../../components/SimpleCardBuilder';

const QUICK_AMOUNTS = [10, 25, 50, 100];

const Note = () => {
    const [recipient, setRecipient] = useState({});
    const [event, setEvent] = useState({});
    const [wishes, setWishes] = useState([]);
    const [thisWish, setThisWish] = useState({});
    const [intentKey, setIntentKey] = useState(null);
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        amount: '',
        currency: 'USD',
        messageType: 'none',
        cardHTML: '',
        cardText: '',
        backgroundImage: '',
        overlayImages: [],
    });

    const router = useRouter();
    const eventName = router.query.id;

    const organizePaymentsByGift = (payments, wishes) => {
        const updatedWishes = [...wishes];
        payments.forEach((payment) => {
            wishes.forEach((wish, idx) => {
                if (payment.giftId === wish._id) {
                    updatedWishes[idx] = { ...wish, paid: wish.paid + payment.amount };
                }
            });
        });
        setWishes(updatedWishes);
    };

    const getPaymentsData = async (eventId, wishes) => {
        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_REGISTRY_URL}/api/getStripePaymentsForEvent?eventId=${eventId}`,
                { method: 'GET', credentials: 'include', headers: { 'Content-Type': 'application/json' } }
            );
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            const { payments } = await res.json();
            organizePaymentsByGift(payments, wishes);
        } catch (error) {
            console.error('Error fetching payments:', error);
        }
    };

    const getRecipientAccount = async (sub) => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_REGISTRY_URL}/api/getAccountForThisUser/${sub}||"`);
            const { data } = await res.json();
            setRecipient(data);
        } catch (error) {
            console.error('Error getting recipient account id:', error);
        }
    };

    const getWishesData = async (eventId) => {
        const res = await fetch(`${process.env.NEXT_PUBLIC_REGISTRY_URL}/api/getNotesBy/${eventId}`);
        const { noteData } = await res.json();
        const withPaid = noteData.map((n) => ({ ...n, price: parseFloat(n.price), paid: 0 }));
        setWishes(withPaid);
        getPaymentsData(eventId, withPaid);
    };

    const getEventData = async (name) => {
        const res = await fetch(`${process.env.NEXT_PUBLIC_REGISTRY_URL}/api/getEventBy/${name}`);
        const { eventData } = await res.json();
        setEvent(eventData);
        getRecipientAccount(eventData.user);
        getWishesData(eventData._id);
    };

    useEffect(() => {
        if (!eventName) return;
        getEventData(eventName);
    }, [router]);

    const handleNextStep = () => setCurrentStep((s) => s + 1);
    const handlePrevStep = () => setCurrentStep((s) => s - 1);

    const handleClosePayment = () => {
        setThisWish({});
        setCurrentStep(1);
        setFormData({ name: '', description: '', amount: '', currency: 'USD', messageType: 'none', cardHTML: '', cardText: '', backgroundImage: '', overlayImages: [] });
    };

    const pct = (wish) => {
        if (!wish.price || wish.price === 0) return 0;
        return Math.min(100, Math.round((wish.paid / wish.price) * 100));
    };

    const fmtAmount = (wish) => {
        const cur = wish.currency || 'USD';
        const paid = wish.paid || 0;
        const total = wish.amount || wish.price;
        return `${paid} ${cur} of ${total} ${cur}`;
    };

    // ── Step dots ──────────────────────────────────────────────────
    const StepDots = ({ current, total }) => (
        <div className="sender-step-dots">
            {Array.from({ length: total }).map((_, i) => (
                <div key={i} className={`sender-step-dot${i < current ? ' active' : ''}`} />
            ))}
        </div>
    );

    // ── Step 1: Amount ─────────────────────────────────────────────
    const renderStep1 = () => (
        <>
            <div className="sender-flow-nav">
                <button className="sender-flow-nav-back" onClick={handleClosePayment}>
                    <span style={{ fontSize: 18, lineHeight: 1 }}>←</span> Back
                </button>
                <span className="sender-flow-nav-title">Your Contribution</span>
                <span className="sender-flow-nav-spacer" />
            </div>

            <StepDots current={1} total={3} />

            <div className="sender-flow-body">
                {/* Wish summary */}
                <div className="sender-wish-summary">
                    {thisWish.noteUrl
                        ? <img src={thisWish.noteUrl} alt={thisWish.title} className="sender-wish-summary-thumb" />
                        : <div className="sender-wish-summary-thumb" />}
                    <div>
                        <p className="sender-wish-summary-name">{thisWish.title}</p>
                        <p className="sender-wish-summary-raised">{fmtAmount(thisWish)} · {pct(thisWish)}%</p>
                    </div>
                </div>

                {/* Name */}
                <div className="sender-field">
                    <label className="sender-label">Your Name</label>
                    <input
                        className="sender-input"
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Sarah Johnson"
                    />
                </div>

                {/* Amount */}
                <div className="sender-field">
                    <label className="sender-label">Contribution Amount</label>
                    <div className="sender-amount-row">
                        <select
                            className="sender-currency-pill"
                            value={formData.currency}
                            onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                        >
                            {['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY'].map((c) => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                        <input
                            className="sender-amount-input"
                            type="number"
                            value={formData.amount}
                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                            placeholder="0"
                            min="0"
                            step="1"
                        />
                    </div>
                </div>

                {/* Quick select */}
                <div className="sender-field">
                    <label className="sender-label">Quick select</label>
                    <div className="sender-quick-chips">
                        {QUICK_AMOUNTS.map((amt) => (
                            <button
                                key={amt}
                                className={`sender-chip${Number(formData.amount) === amt ? ' selected' : ''}`}
                                onClick={() => setFormData({ ...formData, amount: String(amt) })}
                            >
                                ${amt}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="sender-flow-footer">
                <button className="sender-btn-secondary" onClick={handleClosePayment}>Cancel</button>
                <button
                    className="sender-btn-large"
                    onClick={handleNextStep}
                    disabled={!formData.name || !formData.amount}
                >
                    Continue to Message
                </button>
            </div>
        </>
    );

    // ── Step 2: Message ────────────────────────────────────────────
    const renderStep2 = () => (
        <>
            <div className="sender-flow-nav">
                <button className="sender-flow-nav-back" onClick={handlePrevStep}>
                    <span style={{ fontSize: 18, lineHeight: 1 }}>←</span> Back
                </button>
                <span className="sender-flow-nav-title">Add a Personal Touch</span>
                <span className="sender-flow-nav-spacer" />
            </div>

            <StepDots current={2} total={3} />

            <div className="sender-flow-body">
                <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>
                    How would you like to send your gift?
                </p>

                {/* Option: No message */}
                <div
                    className={`sender-msg-option${formData.messageType === 'none' ? ' selected' : ''}`}
                    onClick={() => setFormData({ ...formData, messageType: 'none' })}
                >
                    <div className="sender-msg-option-top">
                        <div className={`sender-radio${formData.messageType === 'none' ? ' checked' : ''}`} />
                        <div>
                            <p className="sender-msg-option-title">No Message</p>
                            <p className="sender-msg-option-sub">Send your contribution anonymously</p>
                        </div>
                    </div>
                </div>

                {/* Option: Simple message */}
                <div
                    className={`sender-msg-option${formData.messageType === 'simple' ? ' selected' : ''}`}
                    onClick={() => setFormData({ ...formData, messageType: 'simple' })}
                >
                    <div className="sender-msg-option-top">
                        <div className={`sender-radio${formData.messageType === 'simple' ? ' checked' : ''}`} />
                        <div>
                            <p className="sender-msg-option-title">Simple Message</p>
                            <p className="sender-msg-option-sub">Write a personal note to the recipient</p>
                        </div>
                    </div>
                    {formData.messageType === 'simple' && (
                        <textarea
                            className="sender-textarea"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Write something thoughtful..."
                        />
                    )}
                </div>

                {/* Option: Design a card */}
                <div
                    className={`sender-msg-option${formData.messageType === 'card' ? ' selected' : ''}`}
                    onClick={() => setFormData({ ...formData, messageType: 'card' })}
                >
                    <div className="sender-msg-option-top">
                        <div className={`sender-radio${formData.messageType === 'card' ? ' checked' : ''}`} />
                        <div>
                            <p className="sender-msg-option-title">Design a Card</p>
                            <p className="sender-msg-option-sub">Create a beautiful custom greeting card</p>
                        </div>
                        {formData.messageType !== 'card' && (
                            <span className="sender-msg-option-chev">›</span>
                        )}
                    </div>
                    {formData.messageType === 'card' && (
                        <div onClick={(e) => e.stopPropagation()}>
                            <SimpleCardBuilder
                                cardData={formData}
                                setCardData={setFormData}
                            />
                        </div>
                    )}
                </div>
            </div>

            <div className="sender-flow-footer">
                <button className="sender-btn-secondary" onClick={handlePrevStep}>Back</button>
                <button className="sender-btn-large" onClick={handleNextStep}>Continue to Payment</button>
            </div>
        </>
    );

    // ── Step 3: Payment ────────────────────────────────────────────
    const renderStep3 = () => (
        <>
            <div className="sender-flow-nav">
                <button className="sender-flow-nav-back" onClick={handlePrevStep}>
                    <span style={{ fontSize: 18, lineHeight: 1 }}>←</span> Back
                </button>
                <span className="sender-flow-nav-title">Complete Payment</span>
                <span className="sender-flow-nav-spacer" />
            </div>

            <StepDots current={3} total={3} />

            <div className="sender-flow-body">
                {/* Order summary */}
                <div className="sender-order-card">
                    <span className="sender-order-label">Order Summary</span>
                    <div className="sender-order-main-row">
                        <p className="sender-order-wish-name">{thisWish.title}</p>
                        <span className="sender-order-amount">{formData.amount} {formData.currency}</span>
                    </div>
                    <div className="sender-order-divider" />
                    <div className="sender-order-row">
                        <span className="sender-order-row-label">From</span>
                        <span className="sender-order-row-value">{formData.name}</span>
                    </div>
                    <div className="sender-order-row">
                        <span className="sender-order-row-label">Currency</span>
                        <span className="sender-order-row-value">{formData.currency}</span>
                    </div>
                </div>

                {/* Stripe payment form */}
                <div>
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

                <p className="sender-secure-note">
                    🔒 Secured by Stripe · payments are encrypted
                </p>
            </div>
        </>
    );

    // ── Wishlist page ──────────────────────────────────────────────
    return (
        <div className="sender-page">
            {/* Hero */}
            {event.imageUrl ? (
                <div className="sender-hero">
                    <img src={event.imageUrl} alt={event.name} />
                    <div className="sender-hero-overlay">
                        <h1 className="sender-hero-title">{event.name}</h1>
                        {event.description && <p className="sender-hero-sub">{event.description}</p>}
                    </div>
                </div>
            ) : (
                <div className="sender-hero-placeholder">
                    <h1 className="sender-hero-title" style={{ color: '#fff', margin: '0 0 4px' }}>{event.name}</h1>
                    {event.description && <p style={{ color: 'rgba(255,255,255,0.8)', margin: 0, fontSize: 13 }}>{event.description}</p>}
                </div>
            )}

            {/* Wishes grid */}
            {!thisWish._id && (
                <>
                    <div className="sender-section-hdr">
                        <h2 className="sender-section-title">Wishes</h2>
                        <span className="sender-section-meta">
                            {wishes.length} {wishes.length === 1 ? 'wish' : 'wishes'}
                            {wishes.reduce((sum, w) => sum + (w.senders?.length || 0), 0) > 0
                                ? ` · ${wishes.reduce((sum, w) => sum + (w.senders?.length || 0), 0)} contributors`
                                : ''}
                        </span>
                    </div>

                    <div className="sender-grid">
                        {wishes.map((wish, idx) => {
                            const progress = pct(wish);
                            const senderCount = wish.senders?.length || 0;
                            return (
                                <div key={idx} className="sender-wish-card">
                                    {wish.noteUrl
                                        ? <img src={wish.noteUrl} alt={wish.title} className="sender-wish-card-img" />
                                        : <div className="sender-wish-card-img-placeholder" />}

                                    <div className="sender-wish-card-body">
                                        <p className="sender-wish-title">{wish.title}</p>

                                        <div className="sender-progress-wrap">
                                            <div className="sender-progress-bar">
                                                <div className="sender-progress-fill" style={{ width: `${progress}%` }} />
                                            </div>
                                            <div className="sender-progress-meta">
                                                <span className="sender-progress-paid">{fmtAmount(wish)}</span>
                                                <span className="sender-progress-senders">
                                                    {senderCount} {senderCount === 1 ? 'contributor' : 'contributors'}
                                                </span>
                                            </div>
                                        </div>

                                        <button
                                            className="sender-btn-primary"
                                            onClick={() => {
                                                setThisWish(wish);
                                                setIntentKey(`${wish._id}-${Date.now()}`);
                                            }}
                                        >
                                            Contribute
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}

            {/* Contribution flow */}
            {thisWish._id && event._id && (
                <div className="sender-flow-wrap">
                    {currentStep === 1 && renderStep1()}
                    {currentStep === 2 && renderStep2()}
                    {currentStep === 3 && renderStep3()}
                </div>
            )}
        </div>
    );
};

export default Note;
