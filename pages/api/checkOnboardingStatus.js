export default async function handler(req, res) {
    if (req.method !== 'GET') {
      return res.status(405).json({ message: 'Method not allowed' });
    }
  
    try {
      const { accountId } = req.query;
      const account = await stripe.accounts.retrieve(accountId);
  
      res.status(200).json({
        isEnabled: account.charges_enabled,
        isDetailsSubmitted: account.details_submitted,
        payoutsEnabled: account.payouts_enabled,
      });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ message: 'Error checking onboarding status' });
    }
  }