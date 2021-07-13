import { whenFinished } from 'conclure';
import { cps } from 'conclure/effects';

const IFRAME_SOURCE = {
  production: 'https://ellx.io/module/GoogleAuth.e5b91ed3.html',
  staging: 'https://test.ellx.io/module/GoogleAuth.c3f90347.html'
};

function loadGoogleAuthFrame(environment, cb) {
  const iframe = document.createElement('iframe');

  iframe.id = "google-auth";
  iframe.src = IFRAME_SOURCE[environment];
  iframe.title = "";
  iframe.style = "position:absolute;width:0;height:0;border:0;";
  iframe.onload = () => cb(null);
  iframe.onerror = e => {
    document.body.removeChild(iframe);
    cb(e);
  };

  document.body.appendChild(iframe);

  return () => {
    iframe.onload = iframe.onerror = null;
    document.body.removeChild(iframe);
  }
}

function sendAuthRequest(cb) {
  const iframe = document.getElementById('google-auth');
  const iframeOrigin = new URL(iframe.src).origin;

  const authWindow = iframe.contentWindow;
  const id = String(Math.random());

  const listen = ({ data: { type, reqId, error, googleToken }, origin, source }) => {
    if (source !== authWindow || origin !== iframeOrigin || type !== 'google-auth' || reqId !== id) return;

    if (error) cb(new Error(error));
    else cb(null, googleToken);
  }

  window.addEventListener('message', listen, { once: true });
  authWindow.postMessage({ type: 'login', reqId: id }, iframeOrigin);

  return () => window.removeEventListener('message', listen);
}

let googleAuthFrameLoading = null;

export function* signInWithGoogle(environment) {
  if (!googleAuthFrameLoading) {
    googleAuthFrameLoading = cps(loadGoogleAuthFrame, environment);

    whenFinished(googleAuthFrameLoading, ({ cancelled, error }) => {
      if (cancelled || error) {
        googleAuthFrameLoading = null;
      }
    });
  }
  yield googleAuthFrameLoading;

  return cps(sendAuthRequest);
}
