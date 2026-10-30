// "How can they thank you?" Optional. The giftee sends thank-yous from their own WhatsApp
// or email, so the number/address is only ever shown to them.

// Common country codes first; the sender can also type their own code
export const COUNTRY_CODES = [
  { code: '44', label: '🇬🇧 +44' },
  { code: '1', label: '🇺🇸 +1' },
  { code: '353', label: '🇮🇪 +353' },
  { code: '33', label: '🇫🇷 +33' },
  { code: '49', label: '🇩🇪 +49' },
  { code: '34', label: '🇪🇸 +34' },
  { code: '39', label: '🇮🇹 +39' },
  { code: '31', label: '🇳🇱 +31' },
  { code: '32', label: '🇧🇪 +32' },
  { code: '41', label: '🇨🇭 +41' },
  { code: '351', label: '🇵🇹 +351' },
  { code: '61', label: '🇦🇺 +61' },
  { code: '64', label: '🇳🇿 +64' },
  { code: '81', label: '🇯🇵 +81' },
  { code: '86', label: '🇨🇳 +86' },
  { code: '91', label: '🇮🇳 +91' },
  { code: '27', label: '🇿🇦 +27' },
  { code: '971', label: '🇦🇪 +971' },
];

// International format, digits only (e.g. 447700900123): a leading 0 on the local number is dropped
export const whatsappDigits = (countryCode, number) => {
  const local = String(number || '').replace(/\D/g, '').replace(/^0+/, '');
  return local ? `${countryCode}${local}` : '';
};

export const isValidContact = (contact) => {
  if (contact.method === 'whatsapp') {
    const digits = whatsappDigits(contact.countryCode, contact.phone);
    return digits.length >= 7 && digits.length <= 15;
  }
  if (contact.method === 'email') return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email.trim());
  return true; // no contact details is fine
};

export const contactPayload = (contact) => {
  if (contact.method === 'whatsapp') return { contactMethod: 'whatsapp', contactValue: whatsappDigits(contact.countryCode, contact.phone) };
  if (contact.method === 'email') return { contactMethod: 'email', contactValue: contact.email.trim() };
  return {};
};

const OPTIONS = [
  { value: '', label: 'No thanks' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'email', label: 'Email' },
];

const ContactField = ({ contact, setContact }) => {
  const showError = contact.touched && !isValidContact(contact);
  return (
    <div className="sender-field">
      <label className="sender-label">How can they thank you? <span className="sender-optional">Optional</span></label>
      <div className="sender-segmented" role="radiogroup">
        {OPTIONS.map((o) => (
          <button
            key={o.value || 'none'}
            type="button"
            role="radio"
            aria-checked={contact.method === o.value}
            className={`sender-segment${contact.method === o.value ? ' selected' : ''}`}
            onClick={() => setContact({ ...contact, method: o.value, touched: false })}
          >
            {o.label}
          </button>
        ))}
      </div>

      {contact.method === 'whatsapp' && (
        <div className="sender-phone-row">
          <select
            className="sender-currency-pill"
            value={contact.countryCode}
            onChange={(e) => setContact({ ...contact, countryCode: e.target.value })}
            aria-label="Country code"
          >
            {COUNTRY_CODES.map((c) => (
              <option key={c.code} value={c.code}>{c.label}</option>
            ))}
          </select>
          <input
            className="sender-input"
            type="tel"
            inputMode="tel"
            autoComplete="tel-national"
            placeholder="7700 900123"
            value={contact.phone}
            onChange={(e) => setContact({ ...contact, phone: e.target.value })}
            onBlur={() => setContact({ ...contact, touched: true })}
            aria-label="WhatsApp number"
          />
        </div>
      )}

      {contact.method === 'email' && (
        <input
          className="sender-input"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={contact.email}
          onChange={(e) => setContact({ ...contact, email: e.target.value })}
          onBlur={() => setContact({ ...contact, touched: true })}
          aria-label="Email address"
        />
      )}

      {showError && (
        <span className="sender-hint error">
          {contact.method === 'whatsapp' ? 'Please check the number' : 'Please check the email address'}
        </span>
      )}
      {contact.method && (
        <span className="sender-hint">Only shared with the person you're giving to, so they can say thank you.</span>
      )}
    </div>
  );
};

export default ContactField;
