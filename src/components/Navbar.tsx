import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { getUnitConfig } from '../services/storage';
import {
  Sun,
  Moon,
  Building2,
  LogOut,
  ChevronDown,
  Eye,
  EyeOff,
  KeyRound,
  Settings,
  X,
  Save,
  Loader2
} from 'lucide-react';

export const Navbar: React.FC<{ onOpenMobileMenu?: () => void }> = ({ onOpenMobileMenu }) => {
  const { user, previewConfig, updatePreviewConfig, loginWithGooglePopup, loginWithGoogleEmail, logout, loadingAuth, previewMode, togglePreviewMode } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { showToast, confirmModal } = useToast();
  const unitConfig = getUnitConfig();
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleEmailInput, setGoogleEmailInput] = useState('');

  // Preview Config Modal State
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [modalEnabled, setModalEnabled] = useState(previewConfig.enabled);
  const [modalRequirePasscode, setModalRequirePasscode] = useState(previewConfig.requirePasscode);
  const [modalPasscode, setModalPasscode] = useState(previewConfig.passcode);

  const handleOpenPreviewModal = () => {
    setModalEnabled(previewConfig.enabled);
    setModalRequirePasscode(previewConfig.requirePasscode);
    setModalPasscode(previewConfig.passcode);
    setShowPreviewModal(true);
    setShowUserDropdown(false);
  };

  const handleSavePreviewConfig = () => {
    updatePreviewConfig({
      enabled: modalEnabled,
      requirePasscode: modalRequirePasscode,
      passcode: modalPasscode.trim() || '123456'
    });
    showToast('Đã lưu cấu hình Chế độ Xem Báo cáo (Preview Mode)', 'success');
    setShowPreviewModal(false);
  };

  const handleGoogleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (googleEmailInput.trim()) {
      loginWithGoogleEmail(googleEmailInput.trim());
      setShowGoogleModal(false);
      showToast('Đã đăng nhập email Google', 'success');
    }
  };

  const handleTogglePreviewMode = async () => {
    const nextState = !previewMode;
    const confirmed = await confirmModal({
      title: nextState ? 'Bật Chế độ Xem Báo cáo (Preview Mode)?' : 'Tắt Chế độ Preview?',
      message: nextState
        ? 'Khi bật tính năng này, bất kỳ ai truy cập trang web đều có thể XEM TOÀN BỘ dữ liệu báo cáo nhưng KHÔNG thể chỉnh sửa hay thay đổi bất kỳ thứ gì.'
        : 'Khi tắt Preview Mode, chỉ những người dùng đã đăng nhập và phân quyền mới xem được trang web.',
      confirmText: nextState ? 'Bật Preview' : 'Tắt Preview',
      type: 'info'
    });

    if (confirmed) {
      togglePreviewMode(nextState);
      showToast(
        nextState ? 'Đã BẬT Chế độ Xem Báo cáo Công khai (Preview Mode)' : 'Đã TẮT Chế độ Preview Mode',
        nextState ? 'info' : 'warning'
      );
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
      <div className="w-full px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        
        {/* Left: Branding & Mobile Menu Trigger */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 shrink-0 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Mở menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center text-white shadow-md shadow-rose-500/20 shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h1 className="text-xs sm:text-base font-bold text-slate-900 dark:text-white leading-tight truncate max-w-[130px] xs:max-w-[180px] sm:max-w-none">
                  {unitConfig.unitName}
                </h1>
                {previewMode && (
                  <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-[10px] font-bold shrink-0">
                    <Eye className="w-3 h-3" />
                    <span>Preview Mode ON</span>
                  </span>
                )}
              </div>
              <p className="text-[11px] sm:text-xs text-rose-600 dark:text-rose-400 font-medium truncate max-w-[130px] xs:max-w-[200px] sm:max-w-none">
                {unitConfig.districtName} • {unitConfig.provinceName}
              </p>
            </div>
          </div>
        </div>

        {/* Right: Actions, Theme Toggle, Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          


          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={theme === 'light' ? 'Chuyển sang Giao diện Tối' : 'Chuyển sang Giao diện Sáng'}
          >
            {theme === 'light' ? <Moon className="w-5 h-5 text-slate-700" /> : <Sun className="w-5 h-5 text-amber-400" />}
          </button>

          {/* Google Login Button if logged out */}
          {!user ? (
            <button
              onClick={() => setShowGoogleModal(true)}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 shadow-sm text-xs font-bold text-slate-800 dark:text-slate-100 hover:bg-slate-50 transition-all"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Đăng nhập Google</span>
            </button>
          ) : (
            <div className="relative">
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-left"
              >
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName}
                    referrerPolicy="no-referrer"
                    className="w-8 h-8 rounded-lg object-cover border border-rose-200 dark:border-rose-900"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-rose-600 dark:text-rose-400 font-bold flex items-center justify-center text-sm border border-rose-200 dark:border-rose-900 animate-fade-in">
                    {user.displayName.charAt(0)}
                  </div>
                )}
                <div className="hidden md:block">
                  <div className="text-xs font-bold text-slate-900 dark:text-white max-w-[160px] truncate">
                    {user.displayName}
                  </div>
                  <div className="flex items-center gap-1 text-[10px]">
                    <span className={`px-1.5 py-0.2 rounded font-semibold ${
                      user.role === 'ADMIN'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        : user.role === 'STAFF'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                        : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}>
                      {user.role === 'ADMIN' ? 'Quản trị viên (Admin)' : user.role === 'STAFF' ? 'Cán bộ Y tế' : 'Khách xem'}
                    </span>
                  </div>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>

              {/* User Dropdown Menu */}
              {showUserDropdown && (
                <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-2 z-50">
                  <div className="p-3 border-b border-slate-100 dark:border-slate-800 mb-1">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Đang đăng nhập với tài khoản</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{user.displayName}</p>
                    <p className="text-xs text-rose-600 dark:text-rose-400 font-mono font-bold truncate">{user.email}</p>
                  </div>

                  {user.role === 'ADMIN' && (
                    <div className="p-2 border-b border-slate-100 dark:border-slate-800 space-y-1">
                      <button
                        onClick={handleTogglePreviewMode}
                        className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <div className="flex items-center gap-2">
                          <Eye className="w-4 h-4 text-emerald-500" />
                          <span>Chế độ Xem Preview</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] ${previewMode ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                          {previewMode ? 'BẬT' : 'TẮT'}
                        </span>
                      </button>
                    </div>
                  )}

                  <div className="pt-1">
                    <button
                      onClick={() => { logout(); setShowUserDropdown(false); showToast('Đã đăng xuất hệ thống', 'info'); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Đăng xuất khỏi hệ thống</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Google Login Modal */}
      {showGoogleModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Đăng nhập Google Firebase
                </h3>
              </div>
              <button onClick={() => setShowGoogleModal(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Tài khoản Google đăng nhập cần nằm trong danh sách phân quyền của Admin để có quyền chỉnh sửa.
            </p>

            {/* Direct Google Popup Sign-in Button */}
            <div className="pt-2">
              <button
                onClick={async () => {
                  await loginWithGooglePopup();
                  setShowGoogleModal(false);
                }}
                disabled={loadingAuth}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 hover:border-rose-500 shadow-md font-bold text-sm text-slate-800 dark:text-slate-100 transition-all hover:bg-slate-50 disabled:opacity-50"
              >
                {loadingAuth ? (
                  <Loader2 className="w-5 h-5 animate-spin text-rose-600" />
                ) : (
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                )}
                <span>Mở Cửa sổ Google Sign-In</span>
              </button>
            </div>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
              <span className="flex-shrink mx-3 text-[11px] font-bold text-slate-400 uppercase">Hoặc nhập email Google</span>
              <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
            </div>

            <form onSubmit={handleGoogleSignIn} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Địa chỉ Gmail / Google Account
                </label>
                <input
                  type="email"
                  value={googleEmailInput}
                  onChange={e => setGoogleEmailInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white"
                  placeholder="nhap.email@gmail.com"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowGoogleModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md shadow-rose-600/30"
                >
                  Xác nhận Email
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Preview Mode & Passcode Settings Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-emerald-500" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Cấu hình Chế độ Xem Báo cáo (Preview)
                </h3>
              </div>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Toggle Enable */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <label className="text-xs font-bold text-slate-900 dark:text-white block">
                    Kích hoạt Chế độ Preview
                  </label>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Cho phép xem báo cáo không cần đăng nhập Google
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setModalEnabled(!modalEnabled)}
                  className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                    modalEnabled ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
                      modalEnabled ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Toggle Passcode Requirement */}
              {modalEnabled && (
                <div className="space-y-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                      <KeyRound className="w-4 h-4 text-amber-500" />
                      <span>Chỉ định người xem (Yêu cầu Passcode)</span>
                    </label>
                    <input
                      type="checkbox"
                      checked={modalRequirePasscode}
                      onChange={e => setModalRequirePasscode(e.target.checked)}
                      className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                    />
                  </div>

                  {modalRequirePasscode ? (
                    <div className="space-y-1.5 pt-2">
                      <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
                        Thiết lập Mã Passcode bảo vệ:
                      </label>
                      <input
                        type="text"
                        value={modalPasscode}
                        onChange={e => setModalPasscode(e.target.value)}
                        placeholder="VD: 123456"
                        className="w-full px-3 py-2 rounded-xl border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none"
                      />
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">
                        Người xem truy cập web sẽ cần nhập mã passcode này để vào xem dữ liệu.
                      </p>
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-600 dark:text-slate-400">
                      Bất kỳ ai truy cập web đều có thể xem báo cáo ngay mà không cần nhập Passcode.
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSavePreviewConfig}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/30 flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                <span>Lưu Cấu Hình</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
