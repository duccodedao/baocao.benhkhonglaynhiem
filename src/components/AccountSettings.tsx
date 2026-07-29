import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { saveUsersList, getUsersList } from '../services/storage';
import { User, Save, Building, Shield, Mail, Briefcase } from 'lucide-react';

export const AccountSettings: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [position, setPosition] = useState(user?.position || 'Cán bộ Y tế');
  const [unitName, setUnitName] = useState(user?.unitName || 'Trạm Y tế phường Hiệp Thành');

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const users = getUsersList();
    const idx = users.findIndex(u => u.email.toLowerCase() === user.email.toLowerCase());
    if (idx >= 0) {
      users[idx] = {
        ...users[idx],
        displayName: displayName.trim(),
        position: position.trim(),
        unitName: unitName.trim()
      };
      saveUsersList(users, { email: user.email, name: user.displayName });
      showToast('Đã cập nhật thông tin cá nhân thành công!', 'success');
      setTimeout(() => window.location.reload(), 1000);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12 animate-fade-in">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <User className="w-6 h-6 text-rose-600 dark:text-rose-400" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Cài Đặt Tài Khoản
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Quản lý thông tin hồ sơ cá nhân và quyền hạn công tác
          </p>
        </div>
      </div>

      {/* Personal Profile Settings */}
      <form onSubmit={handleSaveProfile} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
          <User className="w-4 h-4 text-rose-500" />
          <span>Thông Tin Cá Nhân</span>
        </h3>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-slate-400" />
            <span>Email Đăng Nhập (Google Auth)</span>
          </label>
          <input
            type="text"
            value={user?.email || ''}
            disabled
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/50 text-xs font-mono font-bold text-slate-500 cursor-not-allowed"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-rose-500" />
            <span>Họ và Tên Cán Bộ</span>
          </label>
          <input
            type="text"
            value={displayName}
            onChange={e => setDisplayName(e.target.value)}
            required
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
            <Briefcase className="w-3.5 h-3.5 text-amber-500" />
            <span>Chức Vụ Công Tác</span>
          </label>
          <input
            type="text"
            value={position}
            onChange={e => setPosition(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
            <Building className="w-3.5 h-3.5 text-emerald-500" />
            <span>Đơn Vị Công Tác</span>
          </label>
          <input
            type="text"
            value={unitName}
            onChange={e => setUnitName(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-indigo-500" />
            <span>Vai Trò Hệ Thống</span>
          </label>
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300">
            {user?.role === 'ADMIN' ? 'Quản trị viên (Admin)' : user?.role === 'STAFF' ? 'Cán bộ Y tế' : 'Xem báo cáo'}
          </span>
        </div>

        <button
          type="submit"
          className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-rose-600/30 transition-all pt-2"
        >
          <Save className="w-4 h-4" />
          <span>LƯU THÔNG TIN CÁ NHÂN</span>
        </button>
      </form>
    </div>
  );
};
