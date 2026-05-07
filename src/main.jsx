import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import App from './App'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#1a2540',
            color: '#e2e8f0',
            border: '1px solid rgba(46,61,102,0.8)',
            fontFamily: 'DM Mono, monospace',
            fontSize: '13px',
          },
          success: { iconTheme: { primary: '#34d399', secondary: '#0a0e1a' } },
          error: { iconTheme: { primary: '#fb7185', secondary: '#0a0e1a' } },
        }}
      />
    </QueryClientProvider>
  </React.StrictMode>,
)
