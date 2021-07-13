import { writable } from 'tinyx';
import { allSettled } from 'conclure/combinators';
import createAPI from './create_api.js';
import { initFirebase } from './firebase.js';

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const staging = {
  apiKey: "AIzaSyCK2U42tWruOdUT7URPgjKOiKO52tC4YQY",
  authDomain: "ellx-staging.firebaseapp.com",
  projectId: "ellx-staging",
  storageBucket: "ellx-staging.appspot.com",
  messagingSenderId: "21869695324",
  appId: "1:21869695324:web:51962725a5255be5fb3199",
  measurementId: "G-SFXW51EX9E"
};

const production = {
  apiKey: "AIzaSyCPdKFv0MJB3XafZIKZRSrJDsIzoCdWA_E",
  authDomain: "ellx-prod.firebaseapp.com",
  projectId: "ellx-prod",
  storageBucket: "ellx-prod.appspot.com",
  messagingSenderId: "1065952316536",
  appId: "1:1065952316536:web:e4c1461dce1ba2d50b718d",
  measurementId: "G-BM2JSG20KZ"
};

export default function initializeAuth({
  appId,
  apiUrl = 'https://api.ellx.io'
}) {

  const firebaseConfigs = {
    'https://api.ellx.io': production,
    'https://test-api.ellx.io': staging,
    'http://localhost:8080': staging
  };

  if (!appId) {
    throw new Error('appId is missing');
  }

  const config = firebaseConfigs[apiUrl];

  if (!config) {
    throw new Error(`apiUrl should be one of [${Object.keys(firebaseConfigs).join(', ')}]`);
  }

  const {
    appLoginSendOTP,
    appLogin,
    appLogout,
    appSetPassword
  } = createAPI({ appId, apiUrl });

  const auth = writable(null);

  function* signIn(options) {
    // Using allSettled here because we want Firebase regardless of whether the signIn succeeds or not

    const results = yield allSettled([
      appLogin(options || {}),
      initFirebase(config)
    ]);

    const failed = results.find(r => r.error);
    if (failed) throw failed.error;

    const { email, phone, appId, authToken, name, picture } = results[0].result || {};
    if (!authToken) return null;

    const { user } = yield firebase.auth().signInWithCustomToken(authToken);

    return { email, phone, appId, userId: user.uid, name, picture };
  }

  const login = options => auth.set(signIn(options));
  login.withOTP = appLoginSendOTP;
  login.setPassword = appSetPassword;

  function logout() {
    if (!auth.get()) return;

    appLogout();
    firebase.auth().signOut();
    auth.set(null);
  }

  return { auth, login, logout };
}
