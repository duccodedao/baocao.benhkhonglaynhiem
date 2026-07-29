import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getHashByTab } from '../utils/navigation';
import {
  LayoutDashboard,
  FileText,
  ShieldAlert,
  Stethoscope,
  Activity,
  Heart,
  Pill,
  Clock,
  ChevronDown,
  ChevronRight,
  User,
  Bell,
  History,
  ShieldCheck,
  Wine,
  Cigarette,
  Search,
  Sliders,
  ArrowLeft,
  Building2,
  Eye,
  Database,
  Users,
  Github
} from 'lucide-react';

export type TabType =
  | 'dashboard'
  | 'official_monthly_report'
  | 'report_quarter'
  | 'report_copd_asthma'
  | 'report_buou_co'
  | 'report_ruou_bia'
  | 'report_thuoc_la'
  | 'report_cancer'
  | 'screening_tha_dtd'
  | 'screening_copd_asthma'
  | 'screening_cancer'
  | '2.1_hypertension'
  | '2.2_diabetes'
  | '2.3_cancer'
  | '2.4_copd'
  | '2.5_asthma'
  | '2.6_iod'
  | 'list_ruou_bia'
  | 'list_thuoc_la'
  | 'account_settings'
  | 'system_settings'
  | 'notifications'
  | 'documents'
  | 'audit_logs'
  | 'admin_panel'
  // Legacy or sub-admin aliases
  | 'users'
  | 'admin_notifications'
  | 'preview_passcode'
  | 'admin_github'
  | 'backup'
  | 'program_config'
  | 'report_iod'
  | 'report_tt23';

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isOpenMobile = false,
  onCloseMobile
}) => {
  const { user } = useAuth();

  // Collapsible Accordion States - DEFAULT COLLAPSED (false) per requirement
  const [openBaoCaoMenu, setOpenBaoCaoMenu] = useState(false);
  const [openKhamSangLocMenu, setOpenKhamSangLocMenu] = useState(false);

  const [openSectionI, setOpenSectionI] = useState(true);
  const [openSectionII, setOpenSectionII] = useState(false);
  const [openSectionIII, setOpenSectionIII] = useState(true);
  const [openSectionIV, setOpenSectionIV] = useState(true);

  const handleSelectTab = (tab: TabType) => {
    setActiveTab(tab);
    window.location.hash = getHashByTab(tab);
    if (onCloseMobile) onCloseMobile();
  };

  const isAdminTab = ['admin_panel', 'users', 'admin_notifications', 'program_config', 'preview_passcode', 'admin_github', 'backup'].includes(activeTab);

  // Dedicated Admin Sidebar Content with enhanced executive indigo/violet theme
  const adminContent = (
    <div className="flex flex-col h-full bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-950 text-slate-100 border-r border-indigo-900/60 p-3 w-64 select-none shadow-xl">
      <div className="space-y-4 flex-1 overflow-y-auto pr-1 text-xs">
        
        {/* Return Home Button */}
        <div className="pb-2 border-b border-indigo-900/60">
          <button
            onClick={() => handleSelectTab('official_monthly_report')}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-indigo-900/60 hover:bg-indigo-800/80 text-violet-200 font-bold transition-all border border-indigo-700/60 shadow-sm"
          >
            <ArrowLeft className="w-4 h-4 text-violet-300" />
            <span>Quay trở lại Trang chủ</span>
          </button>
        </div>

        {/* Admin Section Header */}
        <div className="px-2.5 py-1.5 rounded-xl bg-indigo-900/40 border border-indigo-800/60 flex items-center gap-2 text-violet-300 font-extrabold uppercase text-[11px] tracking-wider shadow-inner">
          <ShieldCheck className="w-4 h-4 text-violet-400 shrink-0" />
          <span>Quản Trị Hệ Thống Admin</span>
        </div>

        {/* Admin Navigation Menu */}
        <div className="space-y-1.5">
          <button
            onClick={() => handleSelectTab('users')}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-bold transition-all ${
              activeTab === 'admin_panel' || activeTab === 'users'
                ? 'bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/35 border border-violet-400/30'
                : 'text-indigo-200/90 hover:bg-indigo-900/50 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4 text-amber-300 shrink-0" />
            <span>Tài khoản & Phân quyền</span>
          </button>

          <button
            onClick={() => handleSelectTab('admin_notifications')}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-bold transition-all ${
              activeTab === 'admin_notifications'
                ? 'bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/35 border border-violet-400/30'
                : 'text-indigo-200/90 hover:bg-indigo-900/50 hover:text-white'
            }`}
          >
            <Bell className="w-4 h-4 text-sky-300 shrink-0" />
            <span>Quản lý Thông báo</span>
          </button>

          <button
            onClick={() => handleSelectTab('program_config')}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-bold transition-all ${
              activeTab === 'program_config'
                ? 'bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/35 border border-violet-400/30'
                : 'text-indigo-200/90 hover:bg-indigo-900/50 hover:text-white'
            }`}
          >
            <Building2 className="w-4 h-4 text-emerald-300 shrink-0" />
            <span>Cấu hình Đơn vị / Trạm</span>
          </button>

          <button
            onClick={() => handleSelectTab('preview_passcode')}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-bold transition-all ${
              activeTab === 'preview_passcode'
                ? 'bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/35 border border-violet-400/30'
                : 'text-indigo-200/90 hover:bg-indigo-900/50 hover:text-white'
            }`}
          >
            <Eye className="w-4 h-4 text-pink-300 shrink-0" />
            <span>Preview & Passcode</span>
          </button>

          <button
            onClick={() => handleSelectTab('admin_github')}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-bold transition-all ${
              activeTab === 'admin_github'
                ? 'bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/35 border border-violet-400/30'
                : 'text-indigo-200/90 hover:bg-indigo-900/50 hover:text-white'
            }`}
          >
            <Github className="w-4 h-4 text-purple-300 shrink-0" />
            <span>Cấu hình GitHub</span>
          </button>

          <button
            onClick={() => handleSelectTab('backup')}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-bold transition-all ${
              activeTab === 'backup'
                ? 'bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/35 border border-violet-400/30'
                : 'text-indigo-200/90 hover:bg-indigo-900/50 hover:text-white'
            }`}
          >
            <Database className="w-4 h-4 text-cyan-300 shrink-0" />
            <span>Sao lưu & Khôi phục</span>
          </button>
        </div>
      </div>

      <div className="pt-3 mt-auto border-t border-indigo-900/60 text-[11px] text-indigo-300/70 text-center">
        <p className="font-extrabold text-violet-200">Admin Control Panel</p>
        <p className="text-[10px]">Trạm Y tế Chuyển đổi số</p>
      </div>
    </div>
  );

  // Standard Main App Sidebar Content
  const mainContent = (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900/90 border-r border-slate-200 dark:border-slate-800 p-3 w-64 select-none">
      <div className="space-y-4 flex-1 overflow-y-auto pr-1 text-xs">
        
        {/* SECTION I: BÁO CÁO */}
        <div className="space-y-1">
          <button
            onClick={() => setOpenSectionI(!openSectionI)}
            className="w-full flex items-center justify-between px-2 py-1 text-[11px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider hover:opacity-80 transition-opacity"
          >
            <span>Báo cáo</span>
            {openSectionI ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>

          {openSectionI && (
            <div className="space-y-1 pl-1">
              {/* Dashboard */}
              <button
                onClick={() => handleSelectTab('dashboard')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-semibold transition-all ${
                  activeTab === 'dashboard'
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-600/25 font-bold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800/80'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 shrink-0" />
                <span>Dashboard</span>
              </button>

              {/* Báo cáo Accordion (Báo cáo tháng, Báo cáo quý, + COPD, Bướu cổ, Rượu bia, Thuốc lá, Phụ lục ung thư as sub-items) */}
              <div className="space-y-0.5">
                <button
                  onClick={() => setOpenBaoCaoMenu(!openBaoCaoMenu)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800/80"
                >
                  <div className="flex items-center gap-2.5">
                    <FileText className="w-4 h-4 text-slate-500 shrink-0" />
                    <span>Báo cáo</span>
                  </div>
                  {openBaoCaoMenu ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
                </button>

                {openBaoCaoMenu && (
                  <div className="pl-4 space-y-1 border-l-2 border-slate-200 dark:border-slate-800 ml-3 my-1">
                    <button
                      onClick={() => handleSelectTab('official_monthly_report')}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
                        activeTab === 'official_monthly_report'
                          ? 'bg-rose-600 text-white font-bold'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      Báo cáo tháng
                    </button>

                    <button
                      onClick={() => handleSelectTab('report_quarter')}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
                        activeTab === 'report_quarter'
                          ? 'bg-rose-600 text-white font-bold'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      Báo cáo quý
                    </button>

                    {/* Horizontal divider line between Báo cáo quý and COPD */}
                    <div className="my-1.5 border-t border-slate-200 dark:border-slate-800/80" />

                    <button
                      onClick={() => handleSelectTab('report_copd_asthma')}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
                        activeTab === 'report_copd_asthma'
                          ? 'bg-rose-600 text-white font-bold'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <Stethoscope className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                        <span>COPD và Hen</span>
                      </span>
                      <span className="px-1 py-0.2 text-[8px] font-bold rounded bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">soon</span>
                    </button>

                    <button
                      onClick={() => handleSelectTab('report_buou_co')}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
                        activeTab === 'report_buou_co'
                          ? 'bg-rose-600 text-white font-bold'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                        <span>Bướu cổ</span>
                      </span>
                      <span className="px-1 py-0.2 text-[8px] font-bold rounded bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">soon</span>
                    </button>

                    <button
                      onClick={() => handleSelectTab('report_ruou_bia')}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
                        activeTab === 'report_ruou_bia'
                          ? 'bg-rose-600 text-white font-bold'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <Wine className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                        <span>Rượu bia</span>
                      </span>
                      <span className="px-1 py-0.2 text-[8px] font-bold rounded bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">soon</span>
                    </button>

                    <button
                      onClick={() => handleSelectTab('report_thuoc_la')}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
                        activeTab === 'report_thuoc_la'
                          ? 'bg-rose-600 text-white font-bold'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <Cigarette className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                        <span>Thuốc lá</span>
                      </span>
                      <span className="px-1 py-0.2 text-[8px] font-bold rounded bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">soon</span>
                    </button>

                    <button
                      onClick={() => handleSelectTab('report_cancer')}
                      className={`w-full flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
                        activeTab === 'report_cancer'
                          ? 'bg-rose-600 text-white font-bold'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <ShieldAlert className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                      <span className="truncate">Phụ lục Ung thư</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Khám sàng lọc Accordion */}
              <div className="space-y-0.5">
                <button
                  onClick={() => setOpenKhamSangLocMenu(!openKhamSangLocMenu)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800/80"
                >
                  <div className="flex items-center gap-2.5">
                    <Search className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Khám sàng lọc</span>
                  </div>
                  {openKhamSangLocMenu ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
                </button>

                {openKhamSangLocMenu && (
                  <div className="pl-4 space-y-1 border-l-2 border-slate-200 dark:border-slate-800 ml-3 my-1">
                    <button
                      onClick={() => handleSelectTab('screening_tha_dtd')}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
                        activeTab === 'screening_tha_dtd'
                          ? 'bg-rose-600 text-white font-bold'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <span>THA & ĐTĐ</span>
                      <span className="px-1 py-0.2 text-[8px] font-bold rounded bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">soon</span>
                    </button>
                    <button
                      onClick={() => handleSelectTab('screening_copd_asthma')}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
                        activeTab === 'screening_copd_asthma'
                          ? 'bg-rose-600 text-white font-bold'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <span>COPD & Hen</span>
                      <span className="px-1 py-0.2 text-[8px] font-bold rounded bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">soon</span>
                    </button>
                    <button
                      onClick={() => handleSelectTab('screening_cancer')}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
                        activeTab === 'screening_cancer'
                          ? 'bg-rose-600 text-white font-bold'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <span>Ung thư</span>
                      <span className="px-1 py-0.2 text-[8px] font-bold rounded bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">soon</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* SECTION II: DANH SÁCH */}
        <div className="space-y-1 pt-2 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setOpenSectionII(!openSectionII)}
            className="w-full flex items-center justify-between px-2 py-1 text-[11px] font-bold text-slate-500 uppercase tracking-wider hover:opacity-80 transition-opacity"
          >
            <span>Danh sách</span>
            {openSectionII ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>

          {openSectionII && (
            <div className="space-y-1 pl-1">
              {[
                { id: '2.1_hypertension' as TabType, label: 'Tăng huyết áp', icon: Heart, color: 'text-rose-500' },
                { id: '2.2_diabetes' as TabType, label: 'Đái tháo đường', icon: Activity, color: 'text-emerald-500' },
                { id: '2.3_cancer' as TabType, label: 'Ung thư', icon: ShieldAlert, color: 'text-purple-500' },
                { id: '2.4_copd' as TabType, label: 'COPD', icon: Stethoscope, color: 'text-sky-500' },
                { id: '2.5_asthma' as TabType, label: 'Hen', icon: Pill, color: 'text-indigo-500' },
                { id: '2.6_iod' as TabType, label: 'IOD', icon: Clock, color: 'text-amber-500' },
                { id: 'list_ruou_bia' as TabType, label: 'Cơ sở sản xuất rượu bia', icon: Wine, color: 'text-purple-400' },
                { id: 'list_thuoc_la' as TabType, label: 'Thuốc lá', icon: Cigarette, color: 'text-orange-400' },
              ].map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectTab(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-semibold transition-all ${
                      isActive
                        ? 'bg-rose-600 text-white shadow-md shadow-rose-600/25 font-bold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800/80'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : item.color}`} />
                      <span className="truncate">{item.label}</span>
                    </div>
                    <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 shrink-0">soon</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* SECTION III: CẤU HÌNH */}
        <div className="space-y-1 pt-2 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setOpenSectionIII(!openSectionIII)}
            className="w-full flex items-center justify-between px-2 py-1 text-[11px] font-bold text-slate-500 uppercase tracking-wider hover:opacity-80 transition-opacity"
          >
            <span>Cấu hình</span>
            {openSectionIII ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>

          {openSectionIII && (
            <div className="space-y-1 pl-1">
              <button
                onClick={() => handleSelectTab('account_settings')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-semibold transition-all ${
                  activeTab === 'account_settings'
                    ? 'bg-rose-600 text-white shadow-md font-bold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800/80'
                }`}
              >
                <User className="w-4 h-4 text-slate-500" />
                <span>Cài đặt tài khoản</span>
              </button>

              <button
                onClick={() => handleSelectTab('documents')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-semibold transition-all ${
                  activeTab === 'documents'
                    ? 'bg-rose-600 text-white shadow-md font-bold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800/80'
                }`}
              >
                <FileText className="w-4 h-4 text-rose-500" />
                <span>Quản lý văn bản</span>
              </button>

              <button
                onClick={() => handleSelectTab('system_settings')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-semibold transition-all ${
                  activeTab === 'system_settings'
                    ? 'bg-rose-600 text-white shadow-md font-bold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800/80'
                }`}
              >
                <Sliders className="w-4 h-4 text-rose-500" />
                <span>Hệ thống</span>
              </button>

              <button
                onClick={() => handleSelectTab('notifications')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-semibold transition-all ${
                  activeTab === 'notifications'
                    ? 'bg-rose-600 text-white shadow-md font-bold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800/80'
                }`}
              >
                <Bell className="w-4 h-4 text-amber-500" />
                <span>Thông báo</span>
              </button>

              <button
                onClick={() => handleSelectTab('audit_logs')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-semibold transition-all ${
                  activeTab === 'audit_logs'
                    ? 'bg-rose-600 text-white shadow-md font-bold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800/80'
                }`}
              >
                <History className="w-4 h-4 text-slate-500" />
                <span>Nhật ký hoạt động</span>
              </button>
            </div>
          )}
        </div>

        {/* SECTION IV: ADMIN PANEL (ONLY FOR ADMIN) */}
        {user && user.role === 'ADMIN' && (
          <div className="space-y-1 pt-2 border-t border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setOpenSectionIV(!openSectionIV)}
              className="w-full flex items-center justify-between px-2 py-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider hover:opacity-80 transition-opacity"
            >
              <span>Admin Panel</span>
              {openSectionIV ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>

            {openSectionIV && (
              <div className="space-y-1 pl-1">
                <button
                  onClick={() => handleSelectTab('admin_panel')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-bold transition-all ${
                    activeTab === 'admin_panel' || activeTab === 'users' || activeTab === 'program_config' || activeTab === 'backup'
                      ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 text-white shadow-lg shadow-indigo-600/30'
                      : 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <ShieldCheck className="w-4 h-4 text-violet-500 shrink-0" />
                    <span className="truncate">Quản Trị Hệ Thống</span>
                  </div>
                  <span className="px-1.5 py-0.5 text-[9px] font-black rounded bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-xs">ADMIN</span>
                </button>
              </div>
            )}
          </div>
        )}

      </div>

      <div className="pt-3 mt-auto border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-400 text-center">
        <p className="font-semibold text-slate-600 dark:text-slate-400">Trạm Y tế Chuyển đổi số</p>
        <p className="text-[10px]">Phiên bản 2026.2 • Chuẩn Bộ Y tế</p>
      </div>
    </div>
  );

  const selectedContent = isAdminTab ? adminContent : mainContent;

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block shrink-0 sticky top-16 h-[calc(100vh-4rem)]">
        {selectedContent}
      </aside>

      {/* Mobile Drawer */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onCloseMobile} />
          <div className="relative z-10 w-64 max-w-[80vw] h-full shadow-2xl">
            {selectedContent}
          </div>
        </div>
      )}
    </>
  );
};
