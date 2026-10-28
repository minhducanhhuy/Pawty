import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { partnerApi, partnerTokenStore, setPartnerUnauthorizedHandler } from '../api/partnerApi';
import type { PartnerProfile, PartnerRegisterPayload } from '../api/partnerTypes';

interface PartnerAuthContextValue {
  partner: PartnerProfile | null;
  isRestoring: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: PartnerRegisterPayload) => Promise<PartnerProfile>;
  refreshPartner: () => Promise<void>;
  logout: () => void;
}

const PartnerAuthContext = createContext<PartnerAuthContextValue | null>(null);

export function PartnerAuthProvider({ children }: { children: ReactNode }) {
  const [partner, setPartner] = useState<PartnerProfile | null>(null);
  const [isRestoring, setIsRestoring] = useState(true);

  const logout = useCallback(() => {
    partnerTokenStore.clear();
    setPartner(null);
  }, []);

  const refreshPartner = useCallback(async () => {
    const latest = await partnerApi.getMe();
    setPartner(latest);
  }, []);

  useEffect(() => {
    setPartnerUnauthorizedHandler(logout);
    const token = partnerTokenStore.read();
    if (!token) {
      setIsRestoring(false);
      return;
    }

    partnerApi
      .getMe()
      .then((profile) => setPartner(profile))
      .catch((restoreError) => {
        console.error('[PartnerAuth] Không khôi phục được phiên đối tác', restoreError);
        logout();
      })
      .finally(() => setIsRestoring(false));
  }, [logout]);

  const login = useCallback(async (email: string, password: string) => {
    const session = await partnerApi.login(email.trim(), password);
    setPartner(session.partner);
  }, []);

  const register = useCallback(async (payload: PartnerRegisterPayload) => {
    const registered = await partnerApi.register(payload);
    return registered;
  }, []);

  const value = useMemo<PartnerAuthContextValue>(
    () => ({ partner, isRestoring, login, register, refreshPartner, logout }),
    [partner, isRestoring, login, register, refreshPartner, logout],
  );

  return <PartnerAuthContext.Provider value={value}>{children}</PartnerAuthContext.Provider>;
}

export function usePartnerAuth(): PartnerAuthContextValue {
  const context = useContext(PartnerAuthContext);
  if (!context) throw new Error('usePartnerAuth phải được dùng trong <PartnerAuthProvider>');
  return context;
}
