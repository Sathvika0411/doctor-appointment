import React from 'react';
import ReactDOM from 'react-dom/client'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import AppContextProvider from './context/AppContext.jsx';

// createRoot(document.getElementById('root')).render(
//   <BrowserRouter>
//     <AppContextProvider>
//       <App />
//     </AppContextProvider>
//   </BrowserRouter>,
// )


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppContextProvider>       {/* ✅ Wrapping here */}
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AppContextProvider>
  </React.StrictMode>,
)
