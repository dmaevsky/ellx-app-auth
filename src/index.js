import { writable } from 'tinyx';
import { conclude } from 'conclure';
import { API_URL_PROD, API_URL_STAGING, createAPI } from './create_api.js';

const defaultApiUrl = (typeof window === 'object' && window.location.hostname !== 'localhost' ? API_URL_PROD : API_URL_STAGING);

const run = it => new Promise((resolve, reject) => conclude(it, (error, result) => error ? reject(error) : resolve(result)));
const promisify = g => (...args) => run(g(...args));

export default function initializeAuth({
  appId,
  apiUrl = defaultApiUrl
}) {

  if (!appId) {
    throw new Error('appId is missing');
  }

  const {
    appLoginSendOTP: loginOTP,
    appLogin,
    appLogout,
    appSetPassword: setPassword
  } = createAPI({ appId, apiUrl });

  const auth = writable(null);

  function login(options) {
    auth.set(appLogin(options || {}));
    return auth;
  };

  function* logout() {
    yield appLogout();
    auth.set(null);

    return 'Logged out';
  };

  const Auth = { login, logout, loginOTP, setPassword, auth };

  Auth.promises = ['logout', 'loginOTP', 'setPassword']
    .reduce((acc, method) => Object.assign(acc,
      { [method]: promisify(Auth[method]) }
    ), {});

  return Auth;
}

export { initFirebase } from './firebase.js';
