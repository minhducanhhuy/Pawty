import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../shared/styles/portal.css';
import { ToastProvider } from '../shared/ui/Toast';
import { PartnerAuthProvider } from './auth/PartnerAuthContext';
import { PartnerApp } from './PartnerApp';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Không tìm thấy phần tử #root trong partner.html');

createRoot(rootElement).render(
  <StrictMode>
    <ToastProvider>
      <PartnerAuthProvider>
        <PartnerApp />
      </PartnerAuthProvider>
    </ToastProvider>
  </StrictMode>,
);
