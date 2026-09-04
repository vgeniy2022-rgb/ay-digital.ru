import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { SiteAnalyticsProvider } from './features/site-analytics/SiteAnalyticsProvider';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <SiteAnalyticsProvider>
        <App />
      </SiteAnalyticsProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
