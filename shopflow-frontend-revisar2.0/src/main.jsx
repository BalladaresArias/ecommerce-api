import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <App />
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#161616',
                color: '#f0ead6',
                border: '1px solid rgba(201, 168, 76, 0.3)',
                fontFamily: 'Montserrat, sans-serif',
                fontSize: '13px',
              },
              success: {
                iconTheme: { primary: '#c9a84c', secondary: '#0a0a0a' },
              },
              error: {
                iconTheme: { primary: '#e74c3c', secondary: '#f0ead6' },
              },
            }}
          />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
)