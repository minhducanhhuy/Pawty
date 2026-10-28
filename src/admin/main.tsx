import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../shared/styles/portal.css';
import { ToastProvider } from '../shared/ui/Toast';
import { AdminApp } from './AdminApp';
import { AdminAuthProvider } from './auth/AdminAuthContext';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Không tìm thấy phần tử #root trong admin.html');

createRoot(rootElement).render(
  <StrictMode>
    <ToastProvider>
      <AdminAuthProvider>
        <AdminApp />
      </AdminAuthProvider>
    </ToastProvider>
  </StrictMode>,
);
