import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { MotionConfig } from 'framer-motion'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <MotionConfig reducedMotion="user">
        <App />
      </MotionConfig>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#fdfaf5',
            color: '#3b2416',
            border: '1px solid #e6d8c7',
            borderRadius: '12px',
            fontSize: '14px',
          },
          success: { iconTheme: { primary: '#059669', secondary: '#ecfdf5' } },
          error: { iconTheme: { primary: '#dc2626', secondary: '#fdfaf5' } },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
)
