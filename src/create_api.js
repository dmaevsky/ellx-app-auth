import { xhr } from './xhr.js';
import { signInWithGoogle } from './googleAuth.js';

export const API_URL_PROD = 'https://api.ellx.io';
export const API_URL_STAGING = 'https://test-api.ellx.io';

export const createAPI = ({ appId, apiUrl }) => {

  const api = xhr(apiUrl, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const environment = apiUrl === API_URL_PROD ? 'production' : 'staging';

  return {
    appLoginSendOTP({
      email,
      phone,
      password = '',
      language = 'en',
      redirectUrl
    }) {
      console.log('[Ellx auth]: Sending an OTP to', phone || email);
      return api.post(`/app-login/${appId}/otp`, { email, phone, password, language, redirectUrl });
    },

    *appLogin({ email, password, phone, code, pollingCode = '', withGoogle }) {
      if (withGoogle) {
        withGoogle = yield signInWithGoogle(environment);
      }
      return api.post(`/app-login/${appId}`, { email, phone, code, password, pollingCode, withGoogle });
    },

    appLogout() {
      return api.post(`/app-login/${appId}/logout`);
    },

    appSetPassword({ newPassword }) {
      return api.post(`/app-login/${appId}/set-password`, { newPassword });
    }
  };
}
