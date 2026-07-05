import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

if (import.meta.env.DEV) {
  import('./store/catalogStore').then(({ useCatalogStore }) => {
    ;(window as any).__catalogStore = useCatalogStore
  })
  import('./store/orderFormStore').then(({ useOrderFormStore }) => {
    ;(window as any).__orderFormStore = useOrderFormStore
  })
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
