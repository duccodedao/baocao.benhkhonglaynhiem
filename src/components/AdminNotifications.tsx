import React, { useState, useEffect } from 'react';
import {
  Bell,
  Plus,
  Edit2,
  Trash2,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Info,
  ShieldAlert,
  Search,
  History,
  Trash,
  Clock,
  X,
  Save,
  Send
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  getAllNotificationsForAdmin,
  createNotification,
  updateNotification,
  deleteNotification,
  restoreNotification,
  permanentlyDeleteNotification,
  subscribeNotifications,
  SystemNotification
} from '../services/notificationStorage';

export const AdminNotifications: React.FC = () => {
  const { user } = useAuth();
  const { showToast, confirmModal } = useToast();

  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [tabView, setTabView] = useState<'active' | 'trash'>('active');
  const [searchQuery, setSearchQuery] = useState('');

  // Form Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formType, setFormType] = useState<SystemNotification['type']>('info');

  const reloadData = () => {
    setNotifications(getAllNotificationsForAdmin());
  };

  useEffect(() => {
    reloadData();
    const unsubscribe = subscribeNotifications(() => {
      reloadData();
    });
    return () => unsubscribe();
  }, []);

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormTitle('');
    setFormContent('');
    setFormType('info');
    setShowModal(true);
  };

  const handleOpenEdit = (n: SystemNotification) => {
    setEditingId(n.id);
    setFormTitle(n.title);
    setFormContent(n.content);
    setFormType(n.type);
    setShowModal(true);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formContent.trim()) {
      showToast('Vui lòng điền đầy đủ tiêu đề và nội dung thông báo', 'warning');
      return;
    }

    if (editingId) {
      updateNotification(editingId, {
        title: formTitle,
        content: formContent,
        type: formType
      });
      showToast('Đã cập nhật thông báo thành công', 'success');
    } else {
      createNotification(
        formTitle,
        formContent,
        formType,
        user?.email,
        user?.displayName
      );
      showToast('Đã đăng thông báo mới lên hệ thống', 'success');
    }

    setShowModal(false);
    reloadData();
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirmModal({
      title: 'Chuyển thông báo vào Thùng rác?',
      message: 'Thông báo sẽ bị ẩn khỏi giao diện người dùng nhưng vẫn có thể khôi phục trong Thùng rác.',
      confirmText: 'Bỏ vào thùng rác',
      type: 'warning'
    });
    if (confirmed) {
      deleteNotification(id);
      showToast('Đã chuyển thông báo vào Thùng rác', 'info');
      reloadData();
    }
  };

  const handleRestore = (id: string) => {
    restoreNotification(id);
    showToast('Đã khôi phục thông báo thành công', 'success');
    reloadData();
  };

  const handlePermanentDelete = async (id: string) => {
    const confirmed = await confirmModal({
      title: 'Xóa vĩnh viễn thông báo?',
      message: 'Hành động này KHÔNG THỂ KHÔI PHỤC. Thông báo sẽ bị xóa hoàn toàn khỏi cơ sở dữ liệu.',
      confirmText: 'Xóa vĩnh viễn',
      type: 'danger'
    });
    if (confirmed) {
      permanentlyDeleteNotification(id);
      showToast('Đã xóa vĩnh viễn thông báo', 'danger');
      reloadData();
    }
  };

  const activeList = notifications.filter(n => !n.isDeleted);
  const trashList = notifications.filter(n => n.isDeleted);

  const currentList = (tabView === 'active' ? activeList : trashList).filter(
    n =>
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header & Actions */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <Bell className="w-6 h-6 text-rose-600 dark:text-rose-400" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Quản Lý Thông Báo Hệ Thống (Admin)
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Đăng thông báo mới, chỉnh sửa chỉ đạo, quản lý lịch sử và thùng rác
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-5 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30 flex items-center gap-2 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Đăng Thông Báo Mới</span>
        </button>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setTabView('active')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              tabView === 'active'
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>Thông báo Đang phát ({activeList.length})</span>
          </button>

          <button
            onClick={() => setTabView('trash')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              tabView === 'trash'
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Trash className="w-4 h-4" />
            <span>Thùng Rác & Lịch Sử ({trashList.length})</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Tìm thông báo..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white"
          />
        </div>
      </div>

      {/* Notifications Table List */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {currentList.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <History className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-xs font-semibold">
              {tabView === 'active' ? 'Chưa có thông báo nào đang phát.' : 'Thùng rác trống.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {currentList.map(n => (
              <div
                key={n.id}
                className="p-5 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3.5 min-w-0 flex-1">
                  <div className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 shrink-0">
                    {n.type === 'info' && <Info className="w-5 h-5 text-blue-500" />}
                    {n.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-500" />}
                    {n.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                    {n.type === 'danger' && <ShieldAlert className="w-5 h-5 text-rose-500" />}
                  </div>

                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {n.title}
                      </h4>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase shrink-0 ${
                        n.type === 'info' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' :
                        n.type === 'warning' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                        n.type === 'success' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                        'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      }`}>
                        {n.type}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                      {n.content}
                    </p>

                    <div className="flex items-center gap-3 text-[10px] text-slate-400 pt-0.5 font-mono">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(n.createdAt).toLocaleString('vi-VN')}
                      </span>
                      <span>• Tác giả: {n.authorName || n.authorEmail}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                  {tabView === 'active' ? (
                    <>
                      <button
                        onClick={() => handleOpenEdit(n)}
                        className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                        title="Chỉnh sửa"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(n.id)}
                        className="p-2 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                        title="Chuyển vào thùng rác"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleRestore(n.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 font-bold text-xs border border-emerald-500/30"
                        title="Khôi phục"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Khôi phục</span>
                      </button>
                      <button
                        onClick={() => handlePermanentDelete(n.id)}
                        className="p-2 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors"
                        title="Xóa vĩnh viễn"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Form for Create / Edit */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Bell className="w-5 h-5 text-rose-600" />
                <span>{editingId ? 'Chỉnh Sửa Thông Báo' : 'Đăng Thông Báo Mới'}</span>
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Mức độ / Phân loại thông báo
                </label>
                <select
                  value={formType}
                  onChange={e => setFormType(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white"
                >
                  <option value="info">Tin tức & Hướng dẫn (Màu xanh dương)</option>
                  <option value="warning">Nhắc nhở thời hạn (Màu vàng)</option>
                  <option value="success">Thành công & Khuyến khích (Màu xanh lá)</option>
                  <option value="danger">Khẩn cấp & Cảnh báo (Màu đỏ)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Tiêu đề thông báo
                </label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                  placeholder="VD: Nhắc nhở chốt số liệu báo cáo NCD tháng 07/2026"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nội dung chi tiết thông báo
                </label>
                <textarea
                  rows={4}
                  value={formContent}
                  onChange={e => setFormContent(e.target.value)}
                  placeholder="Nhập nội dung chi tiết thông báo chỉ đạo hoặc nhắc nhở..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md shadow-rose-600/30 flex items-center gap-1.5"
                >
                  <Send className="w-4 h-4" />
                  <span>{editingId ? 'Cập Nhật' : 'Đăng Thông Báo'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
