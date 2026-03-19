import { useRouter } from 'next/router';
import Link from 'next/link';

const Success = () => {
    const router = useRouter();
    const { id } = router.query;

    const handleCopyLink = () => {
        if (typeof window !== 'undefined') {
            navigator.clipboard.writeText(window.location.origin + `/for/${id}`);
        }
    };

    return (
        <div className="sender-success-page">
            {/* Hero with fade */}
            <div className="sender-success-hero">
                <div style={{
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
                }} />
                <div className="sender-success-hero-fade" />
                <div className="sender-success-icon">✓</div>
            </div>

            {/* Body */}
            <div className="sender-success-body">
                <h1 className="sender-success-title">Gift Sent!</h1>
                <p className="sender-success-sub">
                    Your contribution was sent successfully. The recipient will love it!
                </p>

                {/* Receipt card */}
                <div className="sender-receipt-card">
                    <p className="sender-receipt-title">Payment Receipt</p>
                    <div className="sender-receipt-divider" />
                    <div className="sender-receipt-row">
                        <span className="sender-receipt-key">Status</span>
                        <span className="sender-paid-badge">Paid</span>
                    </div>
                </div>

                {/* Share */}
                <div className="sender-share-section">
                    <p className="sender-share-title">Share the love</p>
                    <div className="sender-share-row">
                        <button
                            className="sender-share-btn whatsapp"
                            onClick={() => {
                                if (typeof window !== 'undefined') {
                                    window.open(`https://wa.me/?text=I just contributed to a gift! ${encodeURIComponent(window.location.origin + '/for/' + id)}`);
                                }
                            }}
                        >
                            💬 WhatsApp
                        </button>
                        <button className="sender-share-btn copy" onClick={handleCopyLink}>
                            🔗 Copy Link
                        </button>
                    </div>
                </div>

                {/* Back button */}
                {id && (
                    <Link href={`/for/${id}`} className="sender-back-btn">
                        Back to Wishlist
                    </Link>
                )}
            </div>
        </div>
    );
};

export default Success;
