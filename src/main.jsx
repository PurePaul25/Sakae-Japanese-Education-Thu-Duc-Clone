import { StrictMode } from 'react';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { ToastProvider } from './contexts/ToastContext';
import { UserProvider } from './contexts/UserContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <BrowserRouter>
            <ToastProvider>
                <UserProvider>
                    <App />
                </UserProvider>
            </ToastProvider>
        </BrowserRouter>
    </React.StrictMode>,
);
