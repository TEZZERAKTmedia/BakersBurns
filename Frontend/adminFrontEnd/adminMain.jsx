import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './adminApp.jsx'
import './index.css'
import { NotificationProvider } from './Components/notification/notification.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <NotificationProvider>
    <App />
    </NotificationProvider>
  </React.StrictMode>,
)
