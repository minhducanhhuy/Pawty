import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { ApiError } from '../../shared/api/apiError';
import { adminApi, adminTokenStore, setAdminUnauthorizedHandler } from '../api/adminApi';
import type { AdminProfile } from '../api/adminTypes';

interface AdminAuthContextValue {
  profile: AdminProfile | null;
  isRestoring: boolean;
  requestOtp: (phone: string) => Promise<void>;
  verifyOtpAndLogin: (phone: string, otpCode: string) => Promise<void>;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

function isAuthorizedStaffRole(role: AdminProfile['role']): boolean {
  return role === 'admin' || role === 'moderator';
}

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [isRestoring, setIsRestoring] = useState(true);

  const logout = useCallback(() => {
    adminTokenStore.clear();
    setProfile(null);
  }, []);

  useEffect(() => {
    setAdminUnauthorizedHandler(logout);
    const existingToken = adminTokenStore.read();
    if (!existingToken) {
      setIsRestoring(false);
      return;
    }

    adminApi
      .restoreProfile()
      .then((restoredProfile) => {
        if (!isAuthorizedStaffRole(restoredProfile.role)) {
          logout();
          return;
        }
        setProfile(restoredProfile);
      })
      .catch((restoreError) => {
        console.error('[AdminAuth] Không khôi phục được phiên đăng nhập', restoreError);
        logout();
      })
      .finally(() => setIsRestoring(false));
  }, [logout]);

  const requestOtp = useCallback(async (phone: string) => {
    await adminApi.requestOtp(phone.trim());
  }, []);

  const verifyOtpAndLogin = useCallback(
    async (phone: string, otpCode: string) => {
      const session = await adminApi.verifyOtp(phone.trim(), otpCode.trim());
      if (!isAuthorizedStaffRole(session.profile.role)) {
        logout();
        throw new ApiError(
          'Tài khoản không có quyền truy cập Cổng quản trị (chỉ dành cho Admin hoặc Moderator).',
          403,
          'FORBIDDEN_ROLE',
        );
      }
      setProfile(session.profile);
    },
    [logout],
  );

  const contextValue = useMemo<AdminAuthContextValue>(
    () => ({ profile, isRestoring, requestOtp, verifyOtpAndLogin, logout }),
    [profile, isRestoring, requestOtp, verifyOtpAndLogin, logout],
  );

  return <AdminAuthContext.Provider value={contextValue}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth(): AdminAuthContextValue {
  const context = useContext(AdminAuthContext);
  if (!context) throw new Error('useAdminAuth phải được dùng trong <AdminAuthProvider>');
  return context;
}
