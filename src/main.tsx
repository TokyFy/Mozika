import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './samples/node-api'
import './index.css'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <App />
)

postMessage({ payload: 'removeLoading' }, '*')
