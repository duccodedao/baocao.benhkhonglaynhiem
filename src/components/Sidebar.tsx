import React from 'react';
import {
  LayoutDashboard,
  Table,
  BarChart3,
  GitCompare,
  ListTree,
  History,
  Users,
  Database,
  Sliders,
  FileText,
  Heart,
  Activity,
  ShieldAlert,
  Stethoscope,
  Pill,
  Clock,
  FolderOpen
} from 'lucide-react';

export type TabType =
  | 'official_monthly_report'
  | 'old_report_template'
  | 'dashboard'
  | 'reports_list'
  | '2.1_hypertension'
  | '2.2_diabetes'
  | '2.3_cancer'
  | '2.4_copd'
  | '2.5_asthma'
  | '2.6_iod'
  | 'statistics'
  | 'comparison'
  | 'disease_catalog'
  | 'audit_logs'
  | 'users'
  | 'backup'
  | 'program_config'
  | 'report_cancer'
  | 'report_copd_asthma'
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
  const menuGroups = [
    {
      title: 'Quản lý báo cáo',
      items: [
        { id: 'dashboard' as TabType, label: 'Dashboard', icon: LayoutDashboard },
        { id: 'official_monthly_report' as TabType, label: 'Báo cáo (mẫu BYT)', icon: FileText },
        { id: 'report_cancer' as TabType, label: 'Báo cáo Ung thư', icon: ShieldAlert },
        { id: 'report_copd_asthma' as TabType, label: 'Báo cáo COPD và Hen', icon: Stethoscope },
        { id: 'report_iod' as TabType, label: 'Báo cáo IOD', icon: Clock },
        { id: 'report_tt23' as TabType, label: 'Báo cáo thông tư 23 BYT', icon: Table, badge: 'Chưa triển khai' }
      ]
    },
    {
      title: '2. Danh sách quản lý',
      items: [
        { id: '2.1_hypertension' as TabType, label: '2.1 Tăng huyết áp', icon: Heart },
        { id: '2.2_diabetes' as TabType, label: '2.2 Đái tháo đường', icon: Activity },
        { id: '2.3_cancer' as TabType, label: '2.3 Ung thư', icon: ShieldAlert },
        { id: '2.4_copd' as TabType, label: '2.4 COPD', icon: Stethoscope },
        { id: '2.5_asthma' as TabType, label: '2.5 Hen', icon: Pill },
        { id: '2.6_iod' as TabType, label: '2.6 IOD', icon: Clock }
      ]
    },
    {
      title: 'Hệ thống & Cấu hình',
      items: [
        { id: 'users' as TabType, label: 'Quản lý Tài khoản & Phân quyền', icon: Users, badge: 'Admin' },
        { id: 'program_config' as TabType, label: 'Cấu hình chương trình & Trạm', icon: Sliders },
        { id: 'audit_logs' as TabType, label: 'Nhật ký hệ thống', icon: History },
        { id: 'backup' as TabType, label: 'Sao lưu & Phục hồi', icon: Database }
      ]
    }
  ];


  const content = (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900/90 border-r border-slate-200 dark:border-slate-800 p-3 w-64 select-none">
      <div className="space-y-6 flex-1 overflow-y-auto pr-1">
        {menuGroups.map((group, gIdx) => (
          <div key={gIdx} className="space-y-1">
            <h3 className="px-3 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              {group.title}
            </h3>
            <div className="space-y-1 mt-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      window.location.hash = item.id;
                      if (onCloseMobile) onCloseMobile();
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                      isActive
                        ? 'bg-rose-600 text-white shadow-md shadow-rose-600/25 font-bold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded-md ${
                        isActive ? 'bg-white/20 text-white' : 'bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="pt-3 mt-auto border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-400 text-center">
        <p className="font-semibold text-slate-600 dark:text-slate-400">Trạm Y tế Chuyển đổi số</p>
        <p className="text-[10px]">Phiên bản 2026.1 • Chuẩn Bộ Y tế</p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block shrink-0 sticky top-16 h-[calc(100vh-4rem)]">
        {content}
      </aside>

      {/* Mobile Drawer */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onCloseMobile} />
          <div className="relative z-10 w-64 max-w-[80vw] h-full shadow-2xl">
            {content}
          </div>
        </div>
      )}
    </>
  );
};
