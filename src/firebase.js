import { whenFinished } from 'conclure';
import { cps } from 'conclure/effects';

// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const firebaseConfig = {
  staging: {
    apiKey: "AIzaSyCK2U42tWruOdUT7URPgjKOiKO52tC4YQY",
    authDomain: "ellx-staging.firebaseapp.com",
    projectId: "ellx-staging",
    storageBucket: "ellx-staging.appspot.com",
    messagingSenderId: "21869695324",
    appId: "1:21869695324:web:51962725a5255be5fb3199",
    measurementId: "G-SFXW51EX9E"
  },

  production: {
    apiKey: "AIzaSyCPdKFv0MJB3XafZIKZRSrJDsIzoCdWA_E",
    authDomain: "ellx-prod.firebaseapp.com",
    projectId: "ellx-prod",
    storageBucket: "ellx-prod.appspot.com",
    messagingSenderId: "1065952316536",
    appId: "1:1065952316536:web:e4c1461dce1ba2d50b718d",
    measurementId: "G-BM2JSG20KZ"
  }
};

const defaultEnvironment = (typeof window === 'object' && window.location.hostname !== 'localhost' ? 'production' : 'staging');

function loadFirebase(cb) {
  // The core Firebase JS SDK is always required and must be listed first
  const firebaseScripts = [
    'https://www.gstatic.com/firebasejs/8.2.1/firebase-app.js',
    'https://www.gstatic.com/firebasejs/8.2.1/firebase-auth.js',
    'https://www.gstatic.com/firebasejs/8.2.1/firebase-firestore.js'
  ];

  let count = 0;

  const onload = () => {
    if (++count === scripts.length) {
      console.debug('Firebase loaded');
      cb();
    }
  }

  const scripts = firebaseScripts.map(src => {
    if (document.getElementById(src)) return false;

    const script = document.createElement('script');

    script.onload = onload;
    script.onerror = e => (cancel(), cb(e))
    script.id = script.src = src;
    script.async = false;
    script.defer = true;

    document.body.appendChild(script);
    return script;
  })
  .filter(Boolean);

  const cancel = () => {
    scripts.forEach(script => {
      script.onload = script.onerror = null;
      document.body.removeChild(script);
    });
  }

  return cancel;
}

let firebaseLoading = null;

export function* initFirebase(environment = defaultEnvironment) {
  if (!firebaseLoading) {
    firebaseLoading = cps(loadFirebase);

    whenFinished(firebaseLoading, ({ cancelled, error }) => {
      if (cancelled || error) {
        firebaseLoading = null;
      }
    });
  }
  yield firebaseLoading;

  try {
    return firebase.app(environment);
  }
  catch {
    const config = firebaseConfig[environment] || firebaseConfig.staging;
    return firebase.initializeApp(config, environment);
  }
}
