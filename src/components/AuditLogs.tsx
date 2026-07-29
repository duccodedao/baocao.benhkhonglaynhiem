import React, { useState } from 'react';
import { getAuditLogs } from '../services/storage';
import { History, Search, KeyRound, Monitor, Shield, Smartphone } from 'lucide-react';

export const AuditLogs: React.FC = () => {
  const [logs] = useState(() => getAuditLogs());
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'LOGIN' | 'ALL'>('LOGIN');

  const filtered = logs
    .filter(l => {
      if (activeTab === 'LOGIN') {
        return l.action === 'LOGIN' || l.action === 'LOGOUT';
      }
      return true;
    })
    .filter(l =>
      l.description.toLowerCase().includes(search.toLowerCase()) ||
      l.userName.toLowerCase().includes(search.toLowerCase()) ||
      l.userEmail.toLowerCase().includes(search.toLowerCase()) ||
      (l.deviceInfo && l.deviceInfo.toLowerCase().includes(search.toLowerCase()))
    );

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <History className="w-6 h-6 text-rose-600 dark:text-rose-400" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Nhật ký Hoạt động Hệ thống
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Ghi nhận chính xác ngày giờ đăng nhập, địa chỉ IP, thiết bị và các thao tác cập nhật dữ liệu từ thực tế
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold shrink-0">
          <button
            onClick={() => setActiveTab('LOGIN')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'LOGIN'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Nhật ký đăng nhập</span>
          </button>
          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'ALL'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Tất cả thao tác</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo ngày giờ, tài khoản, thiết bị hoặc nội dung..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 outline-none"
          />
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Ngày giờ</th>
                <th className="py-3 px-4">Tài khoản</th>
                <th className="py-3 px-4">Hành động</th>
                <th className="py-3 px-4">IP / Thiết bị đăng nhập</th>
                <th className="py-3 px-4">Nội dung thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400 text-xs">
                    Chưa có nhật ký hoạt động nào ghi nhận.
                  </td>
                </tr>
              ) : (
                filtered.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4 text-slate-500 font-mono text-[11px] whitespace-nowrap font-semibold">
                      {new Date(item.timestamp).toLocaleString('vi-VN')}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-900 dark:text-white">{item.userName}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{item.userEmail}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] inline-flex items-center gap-1 ${
                        item.action === 'LOGIN' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                        item.action === 'CREATE' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' :
                        item.action === 'UPDATE' ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300' :
                        item.action === 'LOCK' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                        item.action === 'DELETE' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' :
                        'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}>
                        {item.action === 'LOGIN' ? 'ĐĂNG NHẬP' : item.action}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 font-mono text-[11px]">
                        {item.deviceInfo?.includes('Mobile') ? (
                          <Smartphone className="w-3.5 h-3.5 text-rose-500" />
                        ) : (
                          <Monitor className="w-3.5 h-3.5 text-emerald-500" />
                        )}
                        <span>{item.deviceInfo || 'Máy tính / Browser'}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                        IP: {item.ipAddress || '127.0.0.1 (Web App)'}
                      </p>
                    </td>
                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300 font-medium">
                      {item.description}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
