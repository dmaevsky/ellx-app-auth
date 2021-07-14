import { writable } from 'tinyx';
import { conclude } from 'conclure';
import { API_URL_PROD, createAPI } from './create_api.js';

const run = it => new Promise((resolve, reject) => conclude(it, (error, result) => error ? reject(error) : resolve(result)));
const promisify = g => (...args) => run(g(...args));

export default function initializeAuth({
  appId,
  apiUrl = API_URL_PROD
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

  function* login(options) {
    const userInfo = yield appLogin(options || {});
    auth.set(userInfo);

    return `Logged in as [${[phone, email].filter(Boolean).join(', ')}]`;
  };

  function* logout() {
    yield appLogout();
    auth.set(null);

    return 'Logged out';
  };

  const Auth = { login, logout, loginOTP, setPassword };

  Auth.promises = Object.keys(Auth)
    .reduce((acc, method) => Object.assign(acc,
      { [method]: promisify(Auth[method]) }
    ), {});

  Auth.auth = auth;
  return Auth;
}

export { initFirebase } from './firebase.js';
