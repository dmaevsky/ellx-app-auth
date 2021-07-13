import { xhr } from './xhr.js';
import { signInWithGoogle } from './googleAuth.js';

export default ({ appId, apiUrl }) => {

  const api = xhr(apiUrl, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return {
    appLoginSendOTP({
      email,
      phone,
      password = '',
      language = 'en',
      redirectUrl
    }) {
      console.log('[Ellx auth]: Sending an OTP to', phone || email);
      return api.put(`/app-login/${appId}`, { email, phone, password, language, redirectUrl });
    },

    *appLogin({ email, password, phone, code, pollingCode = '', withGoogle }) {
      if (withGoogle) {
        withGoogle = yield signInWithGoogle();
      }
      return api.post(`/app-login/${appId}`, { email, phone, code, password, pollingCode, withGoogle });
    },

    appLogout() {
      return api.delete(`/app-login/${appId}`);
    },

    appSetPassword({ newPassword }) {
      return api.post(`/app-login/${appId}/set-password`, { newPassword });
    }
  };
}
