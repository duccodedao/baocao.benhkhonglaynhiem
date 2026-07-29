import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../types';
import {
  getUsersList,
  saveUsersList,
  getPreviewConfig,
  setPreviewConfig as savePreviewConfigState,
  addAuditLog,
  PreviewConfig
} from '../services/storage';
import { auth, loginWithFirebaseGoogle, logoutFirebase } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';

interface AuthContextType {
  user: UserProfile | null;
  accessDeniedEmail: string | null;
  loadingAuth: boolean;
  previewMode: boolean;
  previewConfig: PreviewConfig;
  loginWithGooglePopup: () => Promise<void>;
  loginWithGoogleEmail: (email: string, displayName?: string) => void;
  loginWithPasscode: (passcode: string) => { success: boolean; message?: string };
  logout: () => void;
  clearAccessDenied: () => void;
  togglePreviewMode: (enabled: boolean) => void;
  updatePreviewConfig: (config: Partial<PreviewConfig>) => void;
  enterPreviewAsGuest: () => void;
  requestAppPermissions: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [previewConfig, setPreviewConfigState] = useState<PreviewConfig>(() => getPreviewConfig());
  const previewMode = previewConfig.enabled;
  
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('app_auth_user');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return null;
  });

  const [accessDeniedEmail, setAccessDeniedEmail] = useState<string | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem('app_auth_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('app_auth_user');
    }
  }, [user]);

  // Request Notification & Location permissions
  const requestAppPermissions = () => {
    try {
      if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
        Notification.requestPermission().catch(() => {});
      }
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          () => {},
          () => {},
          { timeout: 5000 }
        );
      }
    } catch (e) {
      console.warn('Permission request notice:', e);
    }
  };

  // Firebase Auth State Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser && firebaseUser.email) {
        verifyAndAuthenticateUser(
          firebaseUser.email,
          firebaseUser.displayName || firebaseUser.email.split('@')[0],
          firebaseUser.photoURL || undefined
        );
      }
    });
    return () => unsubscribe();
  }, []);

  const verifyAndAuthenticateUser = (email: string, displayName?: string, photoURL?: string) => {
    requestAppPermissions();
    const cleanEmail = email.toLowerCase().trim();
    const existingUsers = getUsersList();
    const isSuperAdmin = cleanEmail === 'sonlyhongduc@gmail.com';

    const matchedIndex = existingUsers.findIndex(u => u.email.toLowerCase() === cleanEmail);

    if (matchedIndex >= 0) {
      const matched = existingUsers[matchedIndex];
      // Update missing fields but keep setup data
      const updatedUser: UserProfile = {
        ...matched,
        uid: (matched.uid && !matched.uid.startsWith('u_pending_') && !matched.uid.startsWith('u_usr_')) 
          ? matched.uid 
          : (auth.currentUser?.uid || matched.uid || `u_usr_${Date.now()}`),
        displayName: displayName || matched.displayName || cleanEmail.split('@')[0],
        photoURL: photoURL || matched.photoURL,
        lastLoginAt: new Date().toISOString()
      };
      
      // Save updated list
      existingUsers[matchedIndex] = updatedUser;
      saveUsersList(existingUsers);

      if (!updatedUser.active && !isSuperAdmin) {
        setAccessDeniedEmail(cleanEmail);
        setUser(null);
        return;
      }
      setUser(updatedUser);
      setAccessDeniedEmail(null);

      // Record Login Audit Log
      const device = navigator.userAgent.includes('Mobile') ? 'Thiết bị Di động (Mobile)' : 'Máy tính / Trình duyệt Desktop';
      addAuditLog({
        action: 'LOGIN',
        targetType: 'USER',
        targetId: updatedUser.uid,
        description: `Đăng nhập hệ thống (Google Auth)`,
        userEmail: updatedUser.email,
        userName: updatedUser.displayName,
        ipAddress: '127.0.0.1 (Kế thừa Trạm Y tế)',
        deviceInfo: device
      });
    } else if (isSuperAdmin) {
      // Super Admin is always auto-granted ADMIN access
      const adminProfile: UserProfile = {
        uid: auth.currentUser?.uid || 'u_admin_sonlyhongduc',
        email: 'sonlyhongduc@gmail.com',
        displayName: displayName || 'ThS.BS. Sơn Lý Hồng Đức (Trưởng trạm / Admin)',
        photoURL: photoURL,
        role: 'ADMIN',
        unitName: 'Trạm Y tế phường Hiệp Thành',
        active: true,
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString()
      };
      // Make sure the super admin is also added/updated in the users list
      const adminIndex = existingUsers.findIndex(u => u.email.toLowerCase() === 'sonlyhongduc@gmail.com');
      if (adminIndex >= 0) {
        existingUsers[adminIndex] = { ...existingUsers[adminIndex], ...adminProfile };
      } else {
        existingUsers.push(adminProfile);
      }
      saveUsersList(existingUsers);
      
      setUser(adminProfile);
      setAccessDeniedEmail(null);
    } else {
      // Deny access completely as self-registration is disabled. All accounts must be pre-created by Admin.
      setUser(null);
      setAccessDeniedEmail(cleanEmail);
    }
  };

  const loginWithGooglePopup = async () => {
    setLoadingAuth(true);
    try {
      const fbUser = await loginWithFirebaseGoogle();
      if (fbUser && fbUser.email) {
        verifyAndAuthenticateUser(
          fbUser.email,
          fbUser.displayName || undefined,
          fbUser.photoURL || undefined
        );
      }
    } catch (err: any) {
      console.warn('Firebase Sign-In notice or popup closed:', err);
    } finally {
      setLoadingAuth(false);
    }
  };

  const loginWithGoogleEmail = (email: string, displayName?: string) => {
    verifyAndAuthenticateUser(email, displayName);
  };

  const loginWithPasscode = (inputPasscode: string): { success: boolean; message?: string } => {
    if (!previewConfig.enabled) {
      return { success: false, message: 'Chế độ xem Báo cáo (Preview) hiện đang TẮT!' };
    }
    if (previewConfig.requirePasscode && inputPasscode.trim() !== previewConfig.passcode) {
      return { success: false, message: 'Mã Passcode không chính xác!' };
    }
    enterPreviewAsGuest();
    return { success: true };
  };

  const logout = async () => {
    try {
      await logoutFirebase();
    } catch (e) {
      console.error(e);
    }
    setUser(null);
    setAccessDeniedEmail(null);
  };

  const clearAccessDenied = () => {
    setAccessDeniedEmail(null);
  };

  const togglePreviewMode = (enabled: boolean) => {
    const updated = savePreviewConfigState({ enabled }, user ? { email: user.email, name: user.displayName } : undefined);
    setPreviewConfigState(updated);
  };

  const updatePreviewConfig = (config: Partial<PreviewConfig>) => {
    const updated = savePreviewConfigState(config, user ? { email: user.email, name: user.displayName } : undefined);
    setPreviewConfigState(updated);
  };

  const enterPreviewAsGuest = () => {
    setUser({
      uid: 'guest_preview_user',
      email: 'guest.preview@yt.gov.vn',
      displayName: 'Khách xem Báo cáo (Chế độ Preview)',
      role: 'VIEWER',
      unitName: 'Trạm Y tế phường Hiệp Thành',
      active: true,
      createdAt: new Date().toISOString()
    });
    setAccessDeniedEmail(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessDeniedEmail,
        loadingAuth,
        previewMode,
        previewConfig,
        loginWithGooglePopup,
        loginWithGoogleEmail,
        loginWithPasscode,
        logout,
        clearAccessDenied,
        togglePreviewMode,
        updatePreviewConfig,
        enterPreviewAsGuest,
        requestAppPermissions
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
