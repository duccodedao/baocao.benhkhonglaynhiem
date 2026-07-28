import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { getUsersList, saveUsersList, getPreviewMode, setPreviewMode as savePreviewModeState } from '../services/storage';
import { auth, loginWithFirebaseGoogle, logoutFirebase } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';

interface AuthContextType {
  user: UserProfile | null;
  accessDeniedEmail: string | null;
  loadingAuth: boolean;
  previewMode: boolean;
  loginWithGooglePopup: () => Promise<void>;
  loginWithPassword: (email: string, pass: string) => { success: boolean; message?: string };
  setupAccount: (data: { email: string; password?: string; displayName: string; position?: string; unitName?: string }) => void;
  logout: () => void;
  clearAccessDenied: () => void;
  togglePreviewMode: (enabled: boolean) => void;
  enterPreviewAsGuest: () => void;
  requestAppPermissions: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [previewMode, setPreviewModeState] = useState<boolean>(() => getPreviewMode());
  
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

  const loginWithPassword = (email: string, pass: string) => {
    requestAppPermissions();
    const cleanEmail = email.toLowerCase().trim();
    const existingUsers = getUsersList();

    // Check superadmin bypass or matched user with password
    const isSuperAdmin = cleanEmail === 'sonlyhongduc@gmail.com';
    const matched = existingUsers.find(u => u.email.toLowerCase() === cleanEmail);

    if (matched) {
      if (matched.password && matched.password !== pass) {
        return { success: false, message: 'Mật khẩu đăng nhập không chính xác!' };
      }
      if (!matched.active && !isSuperAdmin) {
        setAccessDeniedEmail(cleanEmail);
        setUser(null);
        return { success: false, message: 'Tài khoản chưa được duyệt phân quyền!' };
      }
      const loggedUser: UserProfile = {
        ...matched,
        lastLoginAt: new Date().toISOString()
      };
      setUser(loggedUser);
      setAccessDeniedEmail(null);
      return { success: true };
    } else if (isSuperAdmin) {
      const adminProfile: UserProfile = {
        uid: 'u_admin_sonlyhongduc',
        email: 'sonlyhongduc@gmail.com',
        displayName: 'ThS.BS. Sơn Lý Hồng Đức (Trưởng trạm / Admin)',
        role: 'ADMIN',
        unitName: 'Trạm Y tế phường Hiệp Thành',
        active: true,
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString()
      };
      setUser(adminProfile);
      setAccessDeniedEmail(null);
      return { success: true };
    } else {
      setAccessDeniedEmail(cleanEmail);
      setUser(null);
      return { success: false, message: 'Tài khoản chưa đăng ký hoặc chưa phân quyền truy cập!' };
    }
  };

  const setupAccount = (data: { email: string; password?: string; displayName: string; position?: string; unitName?: string }) => {
    const cleanEmail = data.email.toLowerCase().trim();
    const existingUsers = getUsersList();
    const existingIndex = existingUsers.findIndex(u => u.email.toLowerCase() === cleanEmail);

    const newUser: UserProfile = {
      uid: existingIndex >= 0 ? existingUsers[existingIndex].uid : `u_usr_${Date.now()}`,
      email: cleanEmail,
      displayName: data.displayName.trim(),
      password: data.password || '123456',
      role: 'STAFF',
      position: data.position || 'Cán bộ Y tế',
      unitName: data.unitName || 'Trạm Y tế phường Hiệp Thành',
      active: false, // Wait for Admin approval
      createdAt: new Date().toISOString()
    };

    if (existingIndex >= 0) {
      existingUsers[existingIndex] = newUser;
    } else {
      existingUsers.push(newUser);
    }
    saveUsersList(existingUsers);

    setAccessDeniedEmail(cleanEmail);
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
    setPreviewModeState(enabled);
    savePreviewModeState(enabled, user ? { email: user.email, name: user.displayName } : undefined);
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
        loginWithGooglePopup,
        loginWithPassword,
        setupAccount,
        logout,
        clearAccessDenied,
        togglePreviewMode,
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
