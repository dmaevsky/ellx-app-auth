import { whenFinished } from 'conclure';
import { call, cps } from 'conclure/effects';

function loadFirebase(cb) {
  // The core Firebase JS SDK is always required and must be listed first
  const firebaseScripts = [
    'https://www.gstatic.com/firebasejs/8.2.1/firebase-app.js',
    'https://www.gstatic.com/firebasejs/8.2.1/firebase-auth.js',
    'https://www.gstatic.com/firebasejs/8.2.1/firebase-firestore.js'
  ];

  let count = 0;

  const onload = () => {
    if (++count === firebaseScripts.length) cb();
  }

  const scripts = firebaseScripts.map(src => {
    const script = document.createElement('script');

    script.onload = onload;
    script.onerror = e => (cancel(), cb(e))
    script.src = src;
    script.async = false;
    script.defer = true;

    document.body.appendChild(script);
    return script;
  });

  const cancel = () => {
    scripts.forEach(script => {
      script.onload = script.onerror = null;
      document.body.removeChild(script);
    });
    window.firebase = undefined;
  }

  return cancel;
}

let firebaseLoading = null;

export function initFirebase(config) {
  if (!firebaseLoading) {
    firebaseLoading = call(function* init() {
      yield cps(loadFirebase);

      firebase.initializeApp(config);
      console.debug('Firebase initialized');
    });

    whenFinished(firebaseLoading, ({ cancelled, error }) => {
      if (cancelled || error) {
        firebaseLoading = null;
      }
    });
  }
  return firebaseLoading;
}
