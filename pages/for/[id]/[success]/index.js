import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { API, formatMoney } from '../../../../utils/money';

// Bundled confetti (no GIF service), so the celebration always loads
const CONFETTI_COLOURS = ['#B4532A', '#E9C46A', '#5E7A4E', '#A9744F', '#F3EADD', '#C9733F'];
const Confetti = () => (
    <div className="sender-confetti" aria-hidden="true">
        {Array.from({ length: 36 }).map((_, i) => (
            <span
                key={i}
                style={{
                    left: `${(i * 37) % 100}%`,
                    background: CONFETTI_COLOURS[i % CONFETTI_COLOURS.length],
                    animationDelay: `${(i % 12) * 0.12}s`,
                    animationDuration: `${2.4 + (i % 5) * 0.35}s`,
                    transform: `rotate(${i * 29}deg)`,
                }}
            />
        ))}
    </div>
);

const Success = () => {
    const router = useRouter();
    // Stripe adds payment_intent + redirect_status when a sender comes back from a
    // redirect-based method; CheckoutForm adds the same for card payments
    const { id, payment_intent: paymentIntentId, redirect_status: redirectStatus } = router.query;
    const [payment, setPayment] = useState(null); // { status, giftId, amount, currency }
    const [eventName, setEventName] = useState('');
    const [wishTitle, setWishTitle] = useState('');
    const [copied, setCopied] = useState(false);
    const [origin, setOrigin] = useState('');
    useEffect(() => setOrigin(window.location.origin), []);

    useEffect(() => {
        if (!router.isReady || !id) return;
        // Confirming with gift-ease also records the payment straight away, so it's counted
        // on the wishlist as soon as they go back (without waiting for Stripe's webhook)
        if (paymentIntentId) {
            fetch(`${API}/api/confirmPayment?paymentIntentId=${encodeURIComponent(paymentIntentId)}`)
                .then((r) => (r.ok ? r.json() : null))
                .then((p) => p && setPayment((prev) => ({ ...prev, ...p })))
                .catch(() => {});
        }
        fetch(`${API}/api/getEventBy/${id}`)
            .then((r) => r.json())
            .then(({ eventData }) => {
                if (!eventData) return;
                setEventName(eventData.name);
                return fetch(`${API}/api/getNotesBy/${eventData._id}`).then((r) => r.json());
            })
            .then((notes) => {
                if (notes?.noteData) setPayment((p) => (p ? { ...p, wishes: notes.noteData } : { wishes: notes.noteData }));
            })
            .catch(() => {});
    }, [router.isReady, id, paymentIntentId]);

    useEffect(() => {
        if (payment?.giftId && payment.wishes) {
            setWishTitle(payment.wishes.find((w) => w._id === payment.giftId)?.title || '');
        }
    }, [payment]);

    const status = payment?.status || redirectStatus;
    const failed = status === 'failed' || status === 'requires_payment_method' || status === 'canceled';
    const processing = status === 'processing';
    const succeeded = !failed && !processing;

    const wishlistPath = `/for/${id}`;
    const backHref = succeeded && payment?.giftId && payment.amount
        ? { pathname: wishlistPath, query: { gave: payment.giftId, gaveAmount: payment.amount, gaveCurrency: payment.currency } }
        : wishlistPath;

    const amountText = payment?.amount ? formatMoney(payment.amount, payment.currency) : '';

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(`${window.location.origin}${wishlistPath}`);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {}
    };

    return (
        <div className="sender-success-page">
            <Head><title>{succeeded ? 'Thank you!' : 'Payment'} · Wishlistagogo</title></Head>
            {succeeded && <Confetti />}

            <div className="sender-success-body">
                <div className={`sender-success-icon${failed ? ' failed' : processing ? ' processing' : ''}`}>
                    {failed ? '!' : processing ? '…' : '🎁'}
                </div>

                <h1 className="sender-success-title">
                    {failed ? 'Payment failed' : processing ? 'Payment processing' : 'Thank you!'}
                </h1>
                <p className="sender-success-sub">
                    {failed
                        ? "Your payment didn't go through and you haven't been charged. Please go back and try again."
                        : processing
                            ? "Your bank is still confirming the payment. It will show on the wishlist once it's complete."
                            : <>
                                Your gift{amountText ? <> of <strong>{amountText}</strong></> : ''}
                                {wishTitle ? <> towards <strong>{wishTitle}</strong></> : ''}
                                {eventName ? <> for {eventName}</> : ''} is on its way. It&apos;ll mean a lot.
                            </>}
                </p>

                <Link href={backHref} className="sender-btn-large full">
                    Back to the wishlist
                </Link>

                {succeeded && (
                    <div className="sender-share-section">
                        <p className="sender-share-title">Know someone else who&apos;d like to chip in?</p>
                        <div className="sender-share-row">
                            <a
                                className="sender-share-btn whatsapp"
                                href={`https://wa.me/?text=${encodeURIComponent(`I just chipped in to a gift${eventName ? ` for ${eventName}` : ''}! ${origin}${wishlistPath}`)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                WhatsApp
                            </a>
                            <button type="button" className="sender-share-btn copy" onClick={handleCopyLink}>
                                {copied ? 'Copied!' : 'Copy link'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Success;
