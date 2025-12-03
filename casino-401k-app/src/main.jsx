/*
Prologue Comments:
- main: This is the entry point of the application. It renders the root component and sets up the providers.
- Inputs: None.
- Outputs: Renders the application.
- External sources: None.
- Author: John Tran, Creation date: 2025-11-09
*/

// Import core React library
import React from 'react';
// Import the modern root API from ReactDOM (for createRoot)
import ReactDOM from 'react-dom/client';
// Import React Router's BrowserRouter for client-side routing
import { BrowserRouter } from 'react-router-dom';
// Import the root application component
import App from './App.jsx';
// Import global stylesheet (compiled by Vite)
import './styles.css';
// Import providers that supply authentication context to the app
import { SupabaseAuthProvider } from './context/SupabaseAuthContext.jsx';
// Import provider that supplies account/ledger context to the app
import { SupabaseAccountProvider } from './context/SupabaseAccountContext.jsx';

// Application entrypoint: mount the React tree and wrap with routing and
// contextual providers for auth and account data (ledger). The providers
// expose hooks used across the app to access authentication and balance info.

// Create and mount the root React rendering context. We use the BrowserRouter
// at the top level so all routing hooks (Link, Routes) work in the tree.
// Mount a new React root into the DOM element with id="root"
ReactDOM.createRoot(document.getElementById('root')).render(
  // StrictMode enables extra checks and warnings in development
  <React.StrictMode>
    {/* BrowserRouter provides HTML5 history-based routing */}
    <BrowserRouter>
      {/* Auth provider exposes login/register/isAuthenticated hooks */}
      <SupabaseAuthProvider>
        {/* Account provider exposes balance and transactions for the wallet */}
        <SupabaseAccountProvider>
          {/* App contains the route configuration and main layout */}
          <App />
        </SupabaseAccountProvider>
      </SupabaseAuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
