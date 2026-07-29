import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle2, Info, AlertTriangle, ShieldAlert, CheckCheck, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import {
  getActiveNotifications,
  getReadNotificationIds,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  subscribeNotifications,
  SystemNotification
} from '../services/notificationStorage';

export const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [readIds, setReadIds] = useState<string[]>([]);
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});

  const reloadData = () => {
    setNotifications(getActiveNotifications());
    setReadIds(getReadNotificationIds());
  };

  useEffect(() => {
    reloadData();
    const unsubscribe = subscribeNotifications(() => {
      reloadData();
    });
    return () => unsubscribe();
  }, []);

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCardClick = (id: string) => {
    markNotificationAsRead(id);
    setReadIds(getReadNotificationIds());
  };

  const unreadCount = notifications.filter(n => !readIds.includes(n.id)).length;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12 animate-fade-in">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
              <Bell className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Thông Báo Hệ Thống & Nhắc Nhở
                {unreadCount > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-rose-600 text-white animate-pulse">
                    {unreadCount} mới
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Cập nhật chỉ đạo, nhắc nhở thời hạn nộp báo cáo NCD và thông báo từ Ban quản trị
              </p>
            </div>
          </div>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={() => {
              markAllNotificationsAsRead();
              setReadIds(getReadNotificationIds());
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 transition-all border border-slate-200 dark:border-slate-700 shrink-0"
          >
            <CheckCheck className="w-4 h-4 text-emerald-500" />
            <span>Đánh dấu tất cả đã xem</span>
          </button>
        )}
      </div>

      {/* Notifications Grid with Equal Height Cards */}
      {notifications.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-12 text-center text-slate-400">
          <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm font-semibold">Chưa có thông báo mới nào từ hệ thống</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {notifications.map(n => {
            const isRead = readIds.includes(n.id);
            const isExpanded = !!expandedIds[n.id];
            const isLongText = n.content.length > 130;

            return (
              <div
                key={n.id}
                onClick={() => handleCardClick(n.id)}
                className={`p-5 rounded-3xl bg-white dark:bg-slate-900 border transition-all duration-200 flex flex-col justify-between cursor-pointer min-h-[170px] relative ${
                  isRead
                    ? 'border-slate-200 dark:border-slate-800/80 opacity-60 hover:opacity-100'
                    : 'border-rose-300 dark:border-rose-900/80 shadow-md shadow-rose-500/5 ring-1 ring-rose-500/20'
                }`}
              >
                {/* Top Section */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0">
                        {n.type === 'info' && <Info className="w-4 h-4 text-blue-500" />}
                        {n.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-500" />}
                        {n.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                        {n.type === 'danger' && <ShieldAlert className="w-4 h-4 text-rose-500" />}
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug line-clamp-2">
                        {n.title}
                      </h4>
                    </div>

                    {!isRead && (
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0 mt-1" title="Chưa đọc" />
                    )}
                  </div>

                  {/* Body Content */}
                  <p className={`text-xs text-slate-600 dark:text-slate-300 leading-relaxed ${!isExpanded && isLongText ? 'line-clamp-3' : ''}`}>
                    {n.content}
                  </p>
                </div>

                {/* Bottom Section */}
                <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 dark:text-slate-500 font-mono flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(n.createdAt).toLocaleDateString('vi-VN', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>

                  {isLongText && (
                    <button
                      onClick={e => toggleExpand(n.id, e)}
                      className="flex items-center gap-1 font-bold text-rose-600 dark:text-rose-400 hover:underline"
                    >
                      <span>{isExpanded ? 'Thu gọn' : 'Xem thêm'}</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
