import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Building2, Lock, Loader2, Eye, AlertTriangle, X } from 'lucide-react';
import { getUnitConfig, getPreviewMode } from '../services/storage';

export const LoginForm: React.FC = () => {
  const {
    accessDeniedEmail,
    loadingAuth,
    previewMode,
    loginWithGooglePopup,
    clearAccessDenied,
    enterPreviewAsGuest
  } = useAuth();

  const unitConfig = getUnitConfig();
  const isPreviewOn = previewMode || getPreviewMode();

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background Decorative Blurs */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-rose-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-red-600/20 rounded-full blur-3xl pointer-events-none"></div>

      {/* POPUP MODAL: Unauthorized / Unassigned Account Notice */}
      {accessDeniedEmail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border-2 border-amber-500/80 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5 relative text-slate-100 animate-scale-up">
            <button
              onClick={clearAccessDenied}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-full bg-slate-800 hover:bg-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 text-amber-400">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <h3 className="text-base font-black text-amber-300">
                  Tài khoản Chưa được Phân quyền!
                </h3>
                <p className="text-xs text-slate-400">
                  Thông báo quản lý quyền truy cập hệ thống
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/30 text-xs space-y-2.5">
              <p className="leading-relaxed">
                Tài khoản <strong className="text-amber-200 font-mono bg-amber-900/60 px-2 py-0.5 rounded">{accessDeniedEmail}</strong> chưa được Admin cấp quyền truy cập hệ thống.
              </p>
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-[11px] text-slate-300 space-y-1.5">
                <p>💡 <strong className="text-amber-300">Hệ thống không cho phép tự đăng ký tài khoản</strong>.</p>
                <p>Tất cả tài khoản phải được Admin trực tiếp khởi tạo và cấu hình thông tin trước mới có thể đăng nhập.</p>
                <p>Vui lòng liên hệ Trưởng trạm qua Email: <strong className="text-amber-200">sonlyhongduc@gmail.com</strong> để được cấp tài khoản.</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5 pt-2">
              <button
                onClick={clearAccessDenied}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-all"
              >
                Đóng thông báo
              </button>
              {isPreviewOn && (
                <button
                  onClick={() => {
                    clearAccessDenied();
                    enterPreviewAsGuest();
                  }}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/30 transition-all flex items-center justify-center gap-1.5"
                >
                  <Eye className="w-4 h-4" />
                  <span>Xem ở Chế độ Preview</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="w-full max-w-md relative z-10 space-y-6">
        
        {/* Branding Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-500 to-red-600 items-center justify-center text-white shadow-xl shadow-rose-500/30">
            <Building2 className="w-9 h-9" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {unitConfig.unitName}
            </h1>
            <p className="text-xs font-semibold text-rose-400 mt-1">
              Hệ thống Báo cáo NCD & Quản lý Bệnh Mạn tính
            </p>
          </div>
        </div>

        {/* Auth Card */}
        <div className="bg-slate-800/90 backdrop-blur-xl border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          
          <div className="space-y-5 text-center">
            <div className="space-y-1">
              <h2 className="text-sm font-bold text-white flex items-center justify-center gap-2">
                <Lock className="w-4 h-4 text-rose-500" />
                <span>Đăng nhập Xác thực Google</span>
              </h2>
              <p className="text-xs text-slate-400">
                Hệ thống tự động đồng bộ ảnh đại diện, họ tên và địa chỉ Gmail của bạn.
              </p>
            </div>

            <button
              onClick={loginWithGooglePopup}
              disabled={loadingAuth}
              className="w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm flex items-center justify-center gap-3 shadow-lg transition-all transform active:scale-95 disabled:opacity-50"
            >
              {loadingAuth ? (
                <Loader2 className="w-5 h-5 animate-spin text-rose-600" />
              ) : (
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
              )}
              <span>Đăng nhập bằng tài khoản Google</span>
            </button>
          </div>

          {/* Public Preview Access Mode */}
          <div className="pt-2 border-t border-slate-700/60 text-center">
            {isPreviewOn ? (
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-[11px] font-bold">
                  <Eye className="w-3.5 h-3.5" />
                  <span>Admin đã BẬT Chế độ Xem Báo cáo Công khai (Preview)</span>
                </div>
                <button
                  onClick={enterPreviewAsGuest}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-700/80 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all border border-slate-600"
                >
                  <Eye className="w-4 h-4 text-emerald-400" />
                  <span>Truy cập Xem Toàn bộ Web (Chỉ Xem)</span>
                </button>
              </div>
            ) : (
              <p className="text-[11px] text-slate-400">
                Chế độ xem Preview công khai đang TẮT. Liên hệ Admin để kích hoạt.
              </p>
            )}
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center text-[11px] text-slate-500 font-medium">
          Trạm Y tế phường Hiệp Thành • Cà Mau
        </p>

      </div>
    </div>
  );
};


