import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Toaster } from 'react-hot-toast'
import App from './App'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 5000,
          style: {
            background: '#1a1a1a',
            color: '#ffffff',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: '600',
            boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
            padding: '14px 18px',
          },
          success: {
            iconTheme: { primary: '#00ea64', secondary: '#000' },
            style: {
              background: '#0d1f14',
              color: '#ffffff',
              border: '1px solid rgba(0,234,100,0.4)',
            },
          },
          error: {
            iconTheme: { primary: '#f87171', secondary: '#fff' },
            style: {
              background: '#1f0d0d',
              color: '#ffffff',
              border: '1px solid rgba(248,113,113,0.5)',
              fontSize: '14px',
              fontWeight: '600',
            },
          },
        }}
      />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </React.StrictMode>,
)
