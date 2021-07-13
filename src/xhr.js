import { whenFinished } from 'conclure';

export function* abortableFetch(url, options) {
  const controller = new AbortController();

  const promise = fetch(url, { ...options, signal: controller.signal });
  whenFinished(promise, ({ cancelled }) => cancelled && controller.abort());

  const res = yield promise;
  const contentType = res.headers.get('Content-Type');

  const body = contentType && contentType.indexOf('application/json') !== -1
    ? yield res.json()
    : yield res.text();

  if (!res.ok) {
    throw new Error(body.error || res.statusText);
  }
  return body;
}

export const xhr = (baseUrl, commonOptions) => Object.fromEntries(['get', 'put', 'post', 'delete']
  .map(verb => [
    verb,
    (url, body, options) => abortableFetch(baseUrl + url, {
      method: verb.toUpperCase(),
      ...commonOptions,
      ...options,
      body: body && JSON.stringify(body),
    })
  ])
);
