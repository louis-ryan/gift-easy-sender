import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import GiftPaymentForm from '../../../components/GiftPaymentForm';
import MessageComposer from '../../../components/MessageComposer';
import ContactField, { isValidContact, contactPayload } from '../../../components/ContactField';
import {
    API, CURRENCIES, MIN_GIFT, quickAmounts, wishCurrency, wishGoal, roundMoney,
    formatMoney, formatShort, formatApprox, convert,
} from '../../../utils/money';

const EMPTY_MESSAGE = { message: '', photoUrls: [], gifUrl: '' };
const EMPTY_CONTACT = { method: '', countryCode: '44', phone: '', email: '', touched: false };
const VIEW_CURRENCY_KEY = 'wishlistagogo:viewCurrency';

const Note = () => {
    const [event, setEvent] = useState({});
    const [wishes, setWishes] = useState([]);
    const [rates, setRates] = useState(null);
    // The currency the sender sees everything in. Starts as the giftee's default; wishes
    // in other currencies show approximate conversions
    const [viewCurrency, setViewCurrency] = useState(null);
    const [thisWish, setThisWish] = useState({});
    const [intentKey, setIntentKey] = useState(null);
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({ name: '', amount: '', currency: 'USD' });
    const [contact, setContact] = useState(EMPTY_CONTACT);
    const [messageData, setMessageData] = useState(EMPTY_MESSAGE);
    const [uploading, setUploading] = useState(false);

    const router = useRouter();
    const eventName = router.query.id;
    // Set by the success page: the wish they just gave to and how much, for a brief highlight
    const { gave, gaveAmount, gaveCurrency } = router.query;

    const organizePaymentsByGift = (payments, wishes) => {
        const updatedWishes = wishes.map((w) => ({ ...w, paid: 0, contributors: 0 }));
        payments.forEach((payment) => {
            const wish = updatedWishes.find((w) => w._id === payment.giftId);
            if (!wish) return;
            // wishAmount is the contribution in the wish's own currency
            wish.paid += payment.wishAmount;
            wish.contributors += 1;
        });
        setWishes(updatedWishes);
    };

    const getPaymentsData = async (eventId, wishes) => {
        try {
            const res = await fetch(`${API}/api/getStripePaymentsForEvent?eventId=${eventId}`);
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            const { payments } = await res.json();
            organizePaymentsByGift(payments, wishes);
        } catch (error) {
            console.error('Error fetching payments:', error);
        }
    };

    const getWishesData = async (eventId) => {
        const res = await fetch(`${API}/api/getNotesBy/${eventId}`);
        const { noteData } = await res.json();
        const withPaid = noteData.map((n) => ({ ...n, price: parseFloat(n.price), paid: 0, contributors: 0 }));
        setWishes(withPaid);
        getPaymentsData(eventId, withPaid);
    };

    const getEventData = async (uri) => {
        const res = await fetch(`${API}/api/getEventBy/${uri}`);
        const { eventData, gifteeCurrency } = await res.json();
        setEvent(eventData);
        const saved = typeof window !== 'undefined' && window.localStorage.getItem(VIEW_CURRENCY_KEY);
        const initial = CURRENCIES.includes(saved) ? saved : (gifteeCurrency || 'USD').toUpperCase();
        setViewCurrency(CURRENCIES.includes(initial) ? initial : 'USD');
        getWishesData(eventData._id);
    };

    useEffect(() => {
        if (!eventName) return;
        getEventData(eventName);
        fetch(`${API}/api/rates`).then((r) => r.json()).then((d) => setRates(d.rates)).catch(() => setRates(null));
    }, [eventName]);

    const changeViewCurrency = (cur) => {
        setViewCurrency(cur);
        try { window.localStorage.setItem(VIEW_CURRENCY_KEY, cur); } catch {}
    };

    const handleNextStep = () => {
        // A fresh key each time the sender reaches payment: they may have gone back and
        // changed the amount or currency, and Stripe rejects a reused key with new details
        if (currentStep === 2) setIntentKey(`${thisWish._id}-${Date.now()}`);
        setCurrentStep((s) => s + 1);
        if (typeof window !== 'undefined') window.scrollTo({ top: 0 });
    };
    const handlePrevStep = () => setCurrentStep((s) => s - 1);

    const startContribution = (wish) => {
        setThisWish(wish);
        setFormData((f) => ({ ...f, amount: '', currency: viewCurrency || wishCurrency(wish) }));
        if (typeof window !== 'undefined') window.scrollTo({ top: 0 });
    };

    const handleClosePayment = () => {
        setThisWish({});
        setCurrentStep(1);
        setFormData({ name: '', amount: '', currency: viewCurrency || 'USD' });
        setContact(EMPTY_CONTACT);
        setMessageData(EMPTY_MESSAGE);
    };

    const pct = (wish) => {
        const goal = wishGoal(wish);
        if (goal === 0) return 0;
        return Math.min(100, Math.round(((wish.paid || 0) / goal) * 100));
    };

    // "€40 of €120" in the wish's currency, or "≈ $43 of $130" converted into the
    // sender's chosen currency
    const fmtProgress = (wish) => {
        const cur = wishCurrency(wish);
        const view = viewCurrency || cur;
        if (view !== cur) {
            const paid = convert(wish.paid || 0, cur, view, rates);
            const goal = convert(wishGoal(wish), cur, view, rates);
            if (paid !== null && goal !== null) {
                return `${paid > 0 ? formatApprox(paid, view) : formatShort(0, view)} of ${formatApprox(goal, view)}`;
            }
        }
        return `${formatShort(roundMoney(wish.paid || 0), cur)} of ${formatShort(wishGoal(wish), cur)}`;
    };

    // ── Step dots ──────────────────────────────────────────────────
    const StepDots = ({ current, total }) => (
        <div className="sender-step-dots">
            {Array.from({ length: total }).map((_, i) => (
                <div key={i} className={`sender-step-dot${i < current ? ' active' : ''}`} />
            ))}
        </div>
    );

    // Only flag the minimum once they've typed something
    const belowMinimum = formData.amount !== '' && !(parseFloat(formData.amount) >= MIN_GIFT[formData.currency]);
    const step1Valid = formData.name.trim() && parseFloat(formData.amount) >= MIN_GIFT[formData.currency] && isValidContact(contact);

    // What their gift adds towards the wish, when they pay in a different currency
    const towardsWish = () => {
        const amount = parseFloat(formData.amount);
        const cur = wishCurrency(thisWish);
        if (!(amount > 0) || formData.currency === cur) return null;
        const converted = convert(amount, formData.currency, cur, rates);
        return converted === null ? null : `${formatApprox(converted, cur)} towards this wish`;
    };

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
                        <p className="sender-wish-summary-raised">{fmtProgress(thisWish)} · {pct(thisWish)}%</p>
                    </div>
                </div>

                {/* Name */}
                <div className="sender-field">
                    <label className="sender-label" htmlFor="sender-name">Your Name</label>
                    <input
                        id="sender-name"
                        className="sender-input"
                        type="text"
                        autoComplete="name"
                        value={formData.name}
                        maxLength={100}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Sarah Johnson"
                    />
                </div>

                {/* Amount */}
                <div className="sender-field">
                    <label className="sender-label" htmlFor="sender-amount">Contribution Amount</label>
                    <div className="sender-amount-row">
                        <select
                            className="sender-currency-pill"
                            value={formData.currency}
                            onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                            aria-label="Currency"
                        >
                            {CURRENCIES.map((c) => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                        <input
                            id="sender-amount"
                            className="sender-amount-input"
                            type="number"
                            inputMode="decimal"
                            value={formData.amount}
                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                            placeholder="0"
                            min={MIN_GIFT[formData.currency]}
                            step="1"
                        />
                    </div>
                    <span className={`sender-hint${belowMinimum ? ' error' : ''}`}>
                        Minimum gift {formatShort(MIN_GIFT[formData.currency], formData.currency)}
                        {towardsWish() ? ` · ${towardsWish()}` : ''}
                    </span>
                </div>

                {/* Quick select */}
                <div className="sender-field">
                    <label className="sender-label">Quick select</label>
                    <div className="sender-quick-chips">
                        {quickAmounts(formData.currency).map((amt) => (
                            <button
                                key={amt}
                                type="button"
                                className={`sender-chip${Number(formData.amount) === amt ? ' selected' : ''}`}
                                onClick={() => setFormData({ ...formData, amount: String(amt) })}
                            >
                                {formatShort(amt, formData.currency)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Contact for thank-yous */}
                <ContactField contact={contact} setContact={setContact} />
            </div>

            <div className="sender-flow-footer">
                <button className="sender-btn-secondary" onClick={handleClosePayment}>Cancel</button>
                <button
                    className="sender-btn-large"
                    onClick={() => {
                        if (!isValidContact(contact)) { setContact({ ...contact, touched: true }); return; }
                        handleNextStep();
                    }}
                    disabled={!step1Valid}
                >
                    Continue
                </button>
            </div>
        </>
    );

    // ── Step 2: Message, photos, GIF ───────────────────────────────
    const hasPersonalTouch = messageData.message.trim() || messageData.photoUrls.length || messageData.gifUrl;
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
                <p className="sender-step-intro">All optional. Add a few words, some photos or a GIF.</p>
                <MessageComposer
                    value={messageData}
                    onChange={setMessageData}
                   
                    onBusyChange={setUploading}
                />
            </div>

            <div className="sender-flow-footer">
                <button className="sender-btn-secondary" onClick={handleNextStep} disabled={uploading}>Skip</button>
                <button className="sender-btn-large" onClick={handleNextStep} disabled={uploading}>
                    {uploading ? 'Uploading…' : 'Continue'}
                </button>
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
                        <span className="sender-order-amount">{formatMoney(parseFloat(formData.amount) || 0, formData.currency)}</span>
                    </div>
                    <div className="sender-order-divider" />
                    <div className="sender-order-row">
                        <span className="sender-order-row-label">From</span>
                        <span className="sender-order-row-value">{formData.name}</span>
                    </div>
                    {hasPersonalTouch && (
                        <div className="sender-order-row">
                            <span className="sender-order-row-label">With</span>
                            <span className="sender-order-row-value">
                                {[
                                    messageData.message.trim() && 'a message',
                                    messageData.photoUrls.length && `${messageData.photoUrls.length} photo${messageData.photoUrls.length > 1 ? 's' : ''}`,
                                    messageData.gifUrl && 'a GIF',
                                ].filter(Boolean).join(', ')}
                            </span>
                        </div>
                    )}
                </div>

                {/* Stripe payment form */}
                <div>
                    <GiftPaymentForm
                        giftAmount={formData.amount}
                        giftCurrency={formData.currency}
                        eventName={eventName}
                        giftId={thisWish._id}
                        senderName={formData.name.trim()}
                        message={messageData.message.trim()}
                        photoUrls={messageData.photoUrls}
                        gifUrl={messageData.gifUrl}
                        contact={contactPayload(contact)}
                        idempotencyKey={intentKey}
                    />
                </div>

                <p className="sender-secure-note">
                    🔒 Secured by Stripe · payments are encrypted
                </p>
            </div>
        </>
    );

    const totalContributors = wishes.reduce((sum, w) => sum + (w.contributors || 0), 0);

    // ── Wishlist page ──────────────────────────────────────────────
    return (
        <div className="sender-page">
            <Head>
                <title>{event.name ? `${event.name} · Wishlistagogo` : 'Wishlistagogo'}</title>
            </Head>

            {/* Hero: the same cover the giftee sees (or the same placeholder) */}
            <div className="sender-hero">
                <img src={event.imageUrl || '/header_placeholder.webp'} alt="" />
                <div className="sender-hero-overlay">
                    <h1 className="sender-hero-title">{event.name}</h1>
                    {event.description && <p className="sender-hero-sub">{event.description}</p>}
                </div>
            </div>

            {/* Wishes grid */}
            {!thisWish._id && (
                <>
                    <div className="sender-section-hdr">
                        <div>
                            <h2 className="sender-section-title">Wishes</h2>
                            <span className="sender-section-meta">
                                {wishes.length} {wishes.length === 1 ? 'wish' : 'wishes'}
                                {totalContributors > 0 ? ` · ${totalContributors} contributions` : ''}
                            </span>
                        </div>
                        {viewCurrency && (
                            <label className="sender-view-currency">
                                <span>Show in</span>
                                <select
                                    className="sender-currency-pill"
                                    value={viewCurrency}
                                    onChange={(e) => changeViewCurrency(e.target.value)}
                                    aria-label="Show amounts in"
                                >
                                    {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </label>
                        )}
                    </div>

                    <div className="sender-grid">
                        {wishes.map((wish) => {
                            const progress = pct(wish);
                            const justGave = gave === wish._id && gaveAmount && CURRENCIES.includes(String(gaveCurrency || '').toUpperCase());
                            return (
                                <div key={wish._id} className={`sender-wish-card${justGave ? ' just-gave' : ''}`}>
                                    {wish.noteUrl
                                        ? <img src={wish.noteUrl} alt={wish.title} className="sender-wish-card-img" />
                                        : <div className="sender-wish-card-img-placeholder" />}

                                    <div className="sender-wish-card-body">
                                        {justGave && (
                                            <span className="sender-gave-badge">
                                                +{formatShort(parseFloat(gaveAmount), String(gaveCurrency).toUpperCase())} from you
                                            </span>
                                        )}
                                        <p className="sender-wish-title">{wish.title}</p>

                                        <div className="sender-progress-wrap">
                                            <div className="sender-progress-bar">
                                                <div className="sender-progress-fill" style={{ width: `${progress}%` }} />
                                            </div>
                                            <div className="sender-progress-meta">
                                                <span className="sender-progress-paid">{fmtProgress(wish)}</span>
                                                <span className="sender-progress-senders">
                                                    {wish.contributors} {wish.contributors === 1 ? 'contributor' : 'contributors'}
                                                </span>
                                            </div>
                                        </div>

                                        <button className="sender-btn-primary" onClick={() => startContribution(wish)}>
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
