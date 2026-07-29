import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getUsersList, saveUsersList, deleteUserFromFirestore } from '../services/storage';
import { UserProfile } from '../types';
import {
  Users,
  UserPlus,
  Edit,
  Trash2,
  ShieldCheck,
  UserCheck,
  Eye,
  CheckCircle2,
  XCircle,
  X,
  Search,
  Briefcase
} from 'lucide-react';

export const AdminUsers: React.FC = () => {
  const { user, loginWithGoogleEmail } = useAuth();
  const { showToast, confirmModal } = useToast();
  const [usersList, setUsersList] = useState<UserProfile[]>(() => getUsersList());
  const [searchTerm, setSearchTerm] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);

  // Form Fields
  const [emailInput, setEmailInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [positionInput, setPositionInput] = useState('Cán bộ chuyên trách');
  const [unitInput, setUnitInput] = useState('Trạm Y tế phường Hiệp Thành');
  const [roleInput, setRoleInput] = useState<'ADMIN' | 'STAFF' | 'VIEWER'>('STAFF');
  const [activeInput, setActiveInput] = useState(true);

  // Sub-tabs State
  const [activeSubTab, setActiveSubTab] = useState<'active' | 'pending'>('active');

  const refreshUsers = (newList: UserProfile[]) => {
    setUsersList(newList);
    saveUsersList(newList, {
      email: user?.email || 'sonlyhongduc@gmail.com',
      name: user?.displayName || 'Admin (Sơn Lý Hồng Đức)'
    });
  };

  const handleOpenAdd = () => {
    setEditingUser(null);
    setEmailInput('');
    setNameInput('');
    setPositionInput('Cán bộ Y tế');
    setUnitInput('Trạm Y tế phường Hiệp Thành');
    setRoleInput('STAFF');
    setActiveInput(true);
    setShowModal(true);
  };

  const handleOpenEdit = (target: UserProfile) => {
    setEditingUser(target);
    setEmailInput(target.email);
    setNameInput(target.displayName);
    setPositionInput(target.position || 'Cán bộ Y tế');
    setUnitInput(target.unitName);
    setRoleInput(target.role);
    setActiveInput(target.active);
    setShowModal(true);
  };

  const handleSave = () => {
    if (!emailInput.trim() || !nameInput.trim()) {
      showToast('Vui lòng nhập đầy đủ Email và Họ tên!', 'error');
      return;
    }

    const cleanEmail = emailInput.trim().toLowerCase();
    const duplicate = usersList.find(u => u.email.toLowerCase() === cleanEmail && (!editingUser || u.uid !== editingUser.uid));
    if (duplicate) {
      showToast('Email này đã tồn tại trong hệ thống! Danh sách người dùng không được trùng email.', 'error');
      return;
    }

    if (editingUser) {
      const updated = usersList.map(u =>
        u.uid === editingUser.uid
          ? {
              ...u,
              email: emailInput.trim(),
              displayName: nameInput.trim(),
              position: positionInput.trim(),
              unitName: unitInput.trim(),
              role: roleInput,
              active: activeInput
            }
          : u
      );
      refreshUsers(updated);
      showToast(`Đã cập nhật thông tin tài khoản ${emailInput.trim()}`, 'success');
    } else {
      const newUser: UserProfile = {
        uid: `u_${Date.now()}`,
        email: emailInput.trim(),
        displayName: nameInput.trim(),
        position: positionInput.trim(),
        unitName: unitInput.trim(),
        role: roleInput,
        active: activeInput,
        createdAt: new Date().toISOString()
      };
      refreshUsers([...usersList, newUser]);
      showToast(`Đã thêm tài khoản phân quyền mới: ${emailInput.trim()}`, 'success');
    }

    setShowModal(false);
  };

  const handleDelete = async (uid: string, name: string, email: string) => {
    if (email === 'sonlyhongduc@gmail.com') {
      showToast('Không thể xóa tài khoản Admin hệ thống chính!', 'error');
      return;
    }

    const confirmed = await confirmModal({
      title: 'Xác nhận xóa tài khoản?',
      message: `Bạn có chắc chắn muốn xóa tài khoản người dùng "${name}" (${email}) khỏi hệ thống?`,
      confirmText: 'Xóa tài khoản',
      cancelText: 'Hủy bỏ',
      type: 'danger'
    });

    if (confirmed) {
      await deleteUserFromFirestore(uid);
      const filtered = usersList.filter(u => u.uid !== uid);
      refreshUsers(filtered);
      showToast(`Đã xóa tài khoản ${email}`, 'warning');
    }
  };

  const handleQuickApprove = (u: UserProfile) => {
    const updated = usersList.map(item =>
      item.uid === u.uid ? { ...item, active: true } : item
    );
    refreshUsers(updated);
    showToast(`Đã duyệt kích hoạt tài khoản ${u.email}`, 'success');
  };

  const activeCount = usersList.filter(u => u.active).length;
  const pendingCount = usersList.filter(u => !u.active).length;

  const filteredUsers = usersList.filter(u => {
    const matchesSearch = u.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.position && u.position.toLowerCase().includes(searchTerm.toLowerCase())) ||
      u.unitName.toLowerCase().includes(searchTerm.toLowerCase());

    if (activeSubTab === 'active') {
      return matchesSearch && u.active === true;
    } else {
      return matchesSearch && u.active === false;
    }
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6 text-rose-600 dark:text-rose-400" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Quản lý Tài khoản & Phân quyền Người dùng (Firebase Auth)
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Chỉ Admin hệ thống (<strong className="text-rose-600">sonlyhongduc@gmail.com</strong>) thêm Gmail phân quyền mới có thể truy cập.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-rose-600/30 transition-all self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Thêm Gmail Phân quyền</span>
        </button>
      </div>

      {/* Sub-tabs for Active vs Pending */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6">
        <button
          onClick={() => setActiveSubTab('active')}
          className={`pb-3 text-xs font-bold transition-all relative ${
            activeSubTab === 'active'
              ? 'text-rose-600 dark:text-rose-400 border-b-2 border-rose-600 dark:border-rose-400'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <span>Đã kích hoạt</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              activeSubTab === 'active'
                ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
            }`}>
              {activeCount}
            </span>
          </div>
        </button>
        <button
          onClick={() => setActiveSubTab('pending')}
          className={`pb-3 text-xs font-bold transition-all relative ${
            activeSubTab === 'pending'
              ? 'text-rose-600 dark:text-rose-400 border-b-2 border-rose-600 dark:border-rose-400'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <span>Chờ duyệt</span>
            {pendingCount > 0 && (
              <span className="animate-pulse bg-amber-500 text-white px-2 py-0.5 rounded-full text-[10px] font-bold">
                {pendingCount}
              </span>
            )}
            {pendingCount === 0 && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                activeSubTab === 'pending'
                  ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
              }`}>
                0
              </span>
            )}
          </div>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo họ tên, email, chức vụ hoặc đơn vị..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white"
          />
        </div>

        <div className="text-xs font-semibold text-slate-500">
          Tổng cộng: <strong className="text-rose-600">{usersList.length}</strong> tài khoản thực sự
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Họ và Tên</th>
                <th className="py-3.5 px-4">Chức vụ công tác</th>
                <th className="py-3.5 px-4">Email Đăng nhập</th>
                <th className="py-3.5 px-4">Quyền hạn (Role)</th>
                <th className="py-3.5 px-4 text-center">Trạng thái</th>
                <th className="py-3.5 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredUsers.map(u => (
                <tr key={u.uid} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 font-extrabold flex items-center justify-center text-xs">
                        {u.displayName.charAt(0)}
                      </div>
                      <div>
                        <p>{u.displayName}</p>
                        <p className="text-[10px] text-slate-400 font-normal">{u.unitName}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 font-semibold">
                    <div className="flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{u.position || 'Cán bộ Y tế'}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 font-mono">
                    <div className="font-semibold">{u.email}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      u.role === 'ADMIN' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                      u.role === 'STAFF' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' :
                      'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}>
                      {u.role === 'ADMIN' && <ShieldCheck className="w-3 h-3 text-amber-600" />}
                      {u.role === 'STAFF' && <UserCheck className="w-3 h-3 text-blue-600" />}
                      {u.role === 'VIEWER' && <Eye className="w-3 h-3 text-slate-500" />}
                      <span>{u.role === 'ADMIN' ? 'Admin (Quản trị)' : u.role === 'STAFF' ? 'Cán bộ Y tế (Nhập liệu)' : 'Xem báo cáo (Viewer)'}</span>
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    {u.active ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Kích hoạt</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px] font-bold">
                        <XCircle className="w-3 h-3" />
                        <span>Khóa</span>
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {!u.active && (
                        <button
                          onClick={() => handleQuickApprove(u)}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-all"
                          title="Duyệt nhanh kích hoạt tài khoản"
                        >
                          Duyệt kích hoạt
                        </button>
                      )}

                      <button
                        onClick={() => loginWithGoogleEmail(u.email, u.displayName)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                          user?.email === u.email
                            ? 'bg-rose-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300'
                        }`}
                        title="Đăng nhập thử với tài khoản này"
                      >
                        {user?.email === u.email ? 'Đang kích hoạt' : 'Chuyển dùng'}
                      </button>

                      <button
                        onClick={() => handleOpenEdit(u)}
                        className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                        title="Chỉnh sửa tài khoản & phân quyền"
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDelete(u.uid, u.displayName, u.email)}
                        disabled={u.email === 'sonlyhongduc@gmail.com'}
                        className="p-1.5 rounded-lg bg-red-50 dark:bg-red-950/50 text-red-600 hover:bg-red-100 disabled:opacity-20"
                        title="Xóa tài khoản"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit User Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingUser ? 'Chỉnh sửa Phân quyền Tài khoản' : 'Thêm Gmail Phân quyền Mới'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Địa chỉ Email Google / Gmail
                </label>
                <input
                  type="email"
                  value={emailInput}
                  onChange={e => setEmailInput(e.target.value)}
                  disabled={editingUser?.email === 'sonlyhongduc@gmail.com'}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white disabled:opacity-60"
                  placeholder="canbo.hiepthanh@gmail.com"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Họ và Tên Cán bộ
                </label>
                <input
                  type="text"
                  value={nameInput}
                  onChange={e => setNameInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white"
                  placeholder="Nguyễn Văn A"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Chức vụ công tác
                </label>
                <input
                  type="text"
                  value={positionInput}
                  onChange={e => setPositionInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white"
                  placeholder="Trưởng trạm, Phó trạm, Y sĩ, Cán bộ chuyên trách..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Đơn vị công tác
                </label>
                <input
                  type="text"
                  value={unitInput}
                  onChange={e => setUnitInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Quyền hạn Vai trò (Role)
                </label>
                <select
                  value={roleInput}
                  onChange={e => setRoleInput(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white"
                >
                  <option value="ADMIN">ADMIN - Admin Hệ thống (Toàn quyền quản trị & phân quyền)</option>
                  <option value="STAFF">STAFF - Cán bộ Y tế (Lập báo cáo, quản lý bệnh nhân)</option>
                  <option value="VIEWER">VIEWER - Khách xem / Lãnh đạo (Chỉ xem tổng hợp số liệu)</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="activeCheck"
                  checked={activeInput}
                  onChange={e => setActiveInput(e.target.checked)}
                  className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500"
                />
                <label htmlFor="activeCheck" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Tài khoản đang hoạt động
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Hủy
              </button>
              <button
                onClick={handleSave}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md shadow-rose-600/30"
              >
                Lưu Thay đổi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

