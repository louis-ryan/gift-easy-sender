import { handleAuth, handleCallback, handleLogin } from '@auth0/nextjs-auth0';

export default handleAuth({
  async callback(req, res) {
    try {
      console.log('Callback initiated');
      console.log('AUTH0_BASE_URL:', process.env.AUTH0_BASE_URL);
      console.log('Redirect URI:', `${process.env.AUTH0_BASE_URL}/api/auth/callback`);
      
      await handleCallback(req, res, {
        redirectUri: `${process.env.AUTH0_BASE_URL}/api/auth/callback`,
        postLoginRedirect: '/'
      });
      
      console.log('Callback completed successfully');
      console.log('Redirecting to:', '/');
    } catch (error) {
      console.error('Auth0 callback error:', error);
      res.status(error.status || 500).end(error.message);
    }
  },
  async login(req, res) {
    try {
      console.log('Login initiated');
      await handleLogin(req, res, {
        authorizationParams: {
          redirect_uri: `${process.env.AUTH0_BASE_URL}/api/auth/callback`,
        },
      });
      console.log('Login handled successfully');
    } catch (error) {
      console.error('Auth0 login error:', error);
      res.status(error.status || 500).end(error.message);
    }
  }
});