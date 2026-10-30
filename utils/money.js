// Money helpers for the sender app. gift-ease enforces all of this server-side; these
// mirror it so the page can show the right numbers (the two repos share no code).

export const API = process.env.NEXT_PUBLIC_REGISTRY_URL;

export const CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY'];
// Mirrors MIN_GIFT in gift-ease's utils/fees.js
export const MIN_GIFT = { USD: 5, EUR: 5, GBP: 5, JPY: 500, CAD: 5, AUD: 5, CHF: 5, CNY: 30 };
const QUICK_AMOUNTS = { JPY: [1000, 2500, 5000, 10000], CNY: [50, 100, 250, 500] };
export const quickAmounts = (currency) => QUICK_AMOUNTS[currency] || [10, 25, 50, 100];

// Mirrors gift-ease's utils/wishGoal.js: a wish's goal is `amount` in its own `currency`;
// older wishes only have `price`, in USD
export const wishCurrency = (wish) => (wish.amount && wish.currency ? wish.currency : 'USD').toUpperCase();
export const wishGoal = (wish) => parseFloat(wish.amount || wish.price) || 0;
export const roundMoney = (value) => Math.round(value * 100) / 100;

export const formatMoney = (amount, currency = 'USD', options = {}) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: currency.toUpperCase(), ...options }).format(amount || 0);

// Whole units unless there are cents ("€120", "€12.50")
export const formatShort = (amount, currency = 'USD') => {
  const n = roundMoney(parseFloat(amount) || 0);
  return formatMoney(n, currency, Number.isInteger(n) ? { minimumFractionDigits: 0, maximumFractionDigits: 0 } : {});
};

// Approximate amounts are rounded to whole units: they're estimates
export const formatApprox = (amount, currency) =>
  `≈ ${formatMoney(amount, currency, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

// rates: units per 1 USD, from gift-ease's /api/rates. null when a rate is missing
export const convert = (amount, from, to, rates) => {
  if (from === to) return amount;
  if (!rates?.[from] || !rates?.[to]) return null;
  return (amount / rates[from]) * rates[to];
};
