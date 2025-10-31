import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './styles.css';
import { SupabaseAuthProvider } from './context/SupabaseAuthContext.jsx';
import { SupabaseAccountProvider } from './context/SupabaseAccountContext.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <SupabaseAuthProvider>
        <SupabaseAccountProvider>
          <App />
        </SupabaseAccountProvider>
      </SupabaseAuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
