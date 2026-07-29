import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { AdminUsers } from './AdminUsers';
import { ProgramConfig } from './ProgramConfig';
import { BackupRestore } from './BackupRestore';
import { AdminNotifications } from './AdminNotifications';
import { AdminGitHubConfig } from './AdminGitHubConfig';
import { getHashByTab } from '../utils/navigation';
import {
  ShieldCheck,
  Users,
  Building2,
  Eye,
  Database,
  KeyRound,
  Save,
  Lock,
  ArrowLeft,
  Bell
} from 'lucide-react';

interface AdminPanelProps {
  activeTab?: string;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ activeTab = 'admin_panel' }) => {
  const { user, previewConfig, updatePreviewConfig } = useAuth();
  const { showToast } = useToast();

  // Map activeTab from props/navigation to active sub-view
  let currentSubTab: 'users' | 'notifications' | 'unit_config' | 'preview_passcode' | 'github' | 'backup' = 'users';
  if (activeTab === 'admin_notifications') currentSubTab = 'notifications';
  else if (activeTab === 'program_config') currentSubTab = 'unit_config';
  else if (activeTab === 'preview_passcode') currentSubTab = 'preview_passcode';
  else if (activeTab === 'admin_github') currentSubTab = 'github';
  else if (activeTab === 'backup') currentSubTab = 'backup';

  // Preview Mode Form State
  const [enabled, setEnabled] = useState(previewConfig.enabled);
  const [requirePasscode, setRequirePasscode] = useState(previewConfig.requirePasscode);
  const [passcode, setPasscode] = useState(previewConfig.passcode);

  const handleReturnHome = () => {
    window.location.hash = getHashByTab('official_monthly_report');
  };

  const handleSavePreviewConfig = () => {
    updatePreviewConfig({
      enabled,
      requirePasscode,
      passcode: passcode.trim() || '123456'
    });
    showToast('Đã lưu cấu hình Chế độ xem Preview & Passcode thành công!', 'success');
  };

  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 max-w-lg mx-auto my-12">
        <Lock className="w-12 h-12 text-rose-500 mx-auto" />
        <h3 className="text-base font-bold text-slate-900 dark:text-white">Quyền truy cập bị từ chối</h3>
        <p className="text-xs text-slate-500">Khu vực này chỉ dành cho Quản trị viên (Admin) hệ thống.</p>
        <div className="pt-2">
          <button
            onClick={handleReturnHome}
            className="px-5 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs"
          >
            Quay trở lại Trang chủ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Title Header with Return Home Button */}
      <div className="bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 text-white p-6 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 border border-rose-900/40">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-rose-400" />
            <h2 className="text-xl font-black tracking-tight">Admin Panel - Trung Tâm Quản Trị Hệ Thống</h2>
          </div>
          <p className="text-xs text-rose-200/80 mt-1">
            Quản lý tài khoản, thông báo hệ thống, cấu hình trạm Y tế & sao lưu dữ liệu toàn diện
          </p>
        </div>

        <button
          onClick={handleReturnHome}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-xs transition-all shrink-0 backdrop-blur-sm"
        >
          <ArrowLeft className="w-4 h-4 text-rose-300" />
          <span>Quay trở lại Trang chủ</span>
        </button>
      </div>

      {/* Main SubTab Contents - Vertical Side Navigation is driven by Sidebar */}
      {currentSubTab === 'users' && <AdminUsers />}

      {currentSubTab === 'notifications' && <AdminNotifications />}

      {currentSubTab === 'unit_config' && <ProgramConfig />}

      {currentSubTab === 'preview_passcode' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-2">
              <Eye className="w-6 h-6 text-emerald-500" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Cấu hình Chế độ Xem Báo cáo (Preview) & Passcode Báo mật
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Bật tính năng cho phép cán bộ bên ngoài hoặc ban lãnh đạo xem báo cáo mà không cần đăng nhập Google, hoặc yêu cầu nhập Passcode.
            </p>
          </div>

          <div className="max-w-xl space-y-5">
            {/* Toggle Enable Preview */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div>
                <label className="text-xs font-bold text-slate-900 dark:text-white block">
                  Kích hoạt Chế độ Preview (Chế độ xem báo cáo)
                </label>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Cho phép truy cập giao diện xem báo cáo chỉ đọc
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEnabled(!enabled)}
                className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                  enabled ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
                    enabled ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Toggle Passcode Requirement */}
            {enabled && (
              <div className="space-y-4 p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-amber-900 dark:text-amber-200 flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-amber-500" />
                    <span>Yêu cầu Passcode khi vào chế độ Xem báo cáo</span>
                  </label>
                  <input
                    type="checkbox"
                    checked={requirePasscode}
                    onChange={e => setRequirePasscode(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                  />
                </div>

                {requirePasscode ? (
                  <div className="space-y-2 pt-2">
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                      Đặt mã Passcode truy cập:
                    </label>
                    <input
                      type="text"
                      value={passcode}
                      onChange={e => setPasscode(e.target.value)}
                      placeholder="VD: 123456"
                      className="w-full px-4 py-2.5 rounded-xl border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-800 text-sm font-mono font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none"
                    />
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Người xem truy cập đường dẫn web sẽ cần nhập mã này trước khi nhìn thấy dữ liệu.
                    </p>
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">
                    Bất kỳ ai truy cập đường dẫn web đều có thể xem ngay báo cáo mà không cần nhập Passcode.
                  </p>
                )}
              </div>
            )}

            <button
              onClick={handleSavePreviewConfig}
              className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 flex items-center gap-2 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Lưu Cấu Hình Preview & Passcode</span>
            </button>
          </div>
        </div>
      )}

      {currentSubTab === 'github' && <AdminGitHubConfig />}

      {currentSubTab === 'backup' && <BackupRestore />}
    </div>
  );
};
