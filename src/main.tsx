import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { SiteAnalyticsProvider } from './features/site-analytics/SiteAnalyticsProvider';
import './styles.css';

// The separately loaded demo canvas never reports simulated shopping actions
// or duplicate iframe visits to the real site's analytics.
const isGroceryCanvas = /^\/preview\/grocery\/[1-5]\/?$/.test(window.location.pathname)
  && new URLSearchParams(window.location.search).get('canvas') === '1';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      {isGroceryCanvas ? <App /> : <SiteAnalyticsProvider><App /></SiteAnalyticsProvider>}
    </BrowserRouter>
  </React.StrictMode>,
);
