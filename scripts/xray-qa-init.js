/* global window, Request, URL */
// Browser-only QA: reject analytics writes, never seed counters or emulate an API response.
(() => {
  const nativeFetch = window.fetch.bind(window);
  window.__xrayQaBlocked = 0;
  window.fetch = (input, options) => {
    const url = new URL(typeof input === 'string' ? input : input.url, window.location.href);
    const method = (options?.method || (input instanceof Request ? input.method : 'GET')).toUpperCase();
    if (method === 'POST' && url.origin === window.location.origin && ['/api/site-stats', '/api/lab-stats', '/api/visitor-events'].includes(url.pathname)) {
      window.__xrayQaBlocked++;
      return Promise.reject(new Error('QA analytics write blocked'));
    }
    return nativeFetch(input, options);
  };
})();
