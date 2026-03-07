import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App as AntApp } from 'antd'
import App from './App'
import 'antd/dist/reset.css';
import './index.css'
import './i18n'
import AOS from 'aos'
import 'aos/dist/aos.css'

// Initialize AOS once before app render
AOS.init({
  duration: 600,
  easing: 'ease-out-cubic',
  once: true,
  offset: 40,
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AntApp>
      <App />
    </AntApp>
  </StrictMode>,
)
