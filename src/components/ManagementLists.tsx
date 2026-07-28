import React, { useState } from 'react';
import {
  Heart,
  Activity,
  ShieldAlert,
  Stethoscope,
  Pill,
  Clock,
  Search,
  Filter,
  FileSpreadsheet,
  Plus,
  AlertCircle,
  FileText
} from 'lucide-react';
import { exportPatientsToExcel } from '../services/excelExporter';
import { useToast } from '../context/ToastContext';

export type DiseaseCategoryKey =
  | '2.1_hypertension'
  | '2.2_diabetes'
  | '2.3_cancer'
  | '2.4_copd'
  | '2.5_asthma'
  | '2.6_iod';

interface ManagementListsProps {
  initialSubTab?: DiseaseCategoryKey;
}

export const ManagementLists: React.FC<ManagementListsProps> = ({ initialSubTab = '2.1_hypertension' }) => {
  const { showToast } = useToast();
  const [activeSubTab, setActiveSubTab] = useState<DiseaseCategoryKey>(initialSubTab);
  const [searchTerm, setSearchTerm] = useState('');

  const tabsConfig: { key: DiseaseCategoryKey; title: string; subtitle: string; icon: any; color: string }[] = [
    {
      key: '2.1_hypertension',
      title: '2.1 Tăng huyết áp',
      subtitle: 'Quản lý danh sách bệnh nhân Tăng huyết áp địa bàn',
      icon: Heart,
      color: 'rose'
    },
    {
      key: '2.2_diabetes',
      title: '2.2 Đái tháo đường',
      subtitle: 'Quản lý danh sách bệnh nhân Đái tháo đường (Tuýp 1, Tuýp 2)',
      icon: Activity,
      color: 'blue'
    },
    {
      key: '2.3_cancer',
      title: '2.3 Ung thư',
      subtitle: 'Theo dõi danh sách bệnh nhân Ung thư (49 loại bệnh K)',
      icon: ShieldAlert,
      color: 'purple'
    },
    {
      key: '2.4_copd',
      title: '2.4 COPD',
      subtitle: 'Danh sách quản lý bệnh Bệnh phổi tắc nghẽn mạn tính',
      icon: Stethoscope,
      color: 'amber'
    },
    {
      key: '2.5_asthma',
      title: '2.5 Hen',
      subtitle: 'Danh sách quản lý bệnh nhân Hen phế quản',
      icon: Pill,
      color: 'emerald'
    },
    {
      key: '2.6_iod',
      title: '2.6 IOD',
      subtitle: 'Theo dõi quản lý bệnh nhân Các rối loạn do thiếu Iốt',
      icon: Clock,
      color: 'cyan'
    }
  ];

  const currentTab = tabsConfig.find(t => t.key === activeSubTab) || tabsConfig[0];
  const Icon = currentTab.icon;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                2. Danh sách quản lý bệnh nhân Mãn tính
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Trạm Y tế phường Hiệp Thành • Quản lý hồ sơ bệnh nhân theo chương trình
              </p>
            </div>
          </div>
        </div>

        {/* Temporary Notice Badge */}
        <div className="px-3.5 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900/60 text-amber-800 dark:text-amber-300 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
          <span>Mẫu danh sách sẽ được triển khai sau khi Trạm Y tế gửi mẫu chuẩn</span>
        </div>
      </div>

      {/* Disease Subtabs Navigation */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {tabsConfig.map(tab => {
          const TabIcon = tab.icon;
          const isActive = activeSubTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveSubTab(tab.key)}
              className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between gap-2 ${
                isActive
                  ? 'bg-rose-600 text-white border-rose-600 shadow-md shadow-rose-600/25 font-bold'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <TabIcon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${isActive ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                  {tab.key.split('_')[0]}
                </span>
              </div>
              <span className="text-xs font-bold leading-tight truncate">{tab.title.replace(/^\d+\.\d+\s*/, '')}</span>
            </button>
          );
        })}
      </div>

      {/* Selected Disease Category View Panel */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
        
        {/* Title & Actions Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold">
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {currentTab.title}
              </h3>
              <p className="text-xs text-slate-500">
                {currentTab.subtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const samplePatients = [
                  { id: '1', patientCode: 'BN_001', fullName: 'Nguyễn Văn A', birthYear: 1958, gender: 'NAM', programType: currentTab.title, phone: '0918123456', address: 'Khóm 1, Phường Hiệp Thành', status: 'DANG_QUAN_LY' },
                  { id: '2', patientCode: 'BN_002', fullName: 'Trần Thị B', birthYear: 1965, gender: 'NỮ', programType: currentTab.title, phone: '0945987654', address: 'Khóm 2, Phường Hiệp Thành', status: 'DANG_QUAN_LY' },
                  { id: '3', patientCode: 'BN_003', fullName: 'Lê Văn C', birthYear: 1952, gender: 'NAM', programType: currentTab.title, phone: '0903112233', address: 'Khóm 3, Phường Hiệp Thành', status: 'DIEU_TRI_ON_DINH' }
                ];
                exportPatientsToExcel(samplePatients);
                showToast(`Đã xuất tập tin Excel Danh sách ${currentTab.title}`, 'success');
              }}
              className="px-3.5 py-2 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 text-emerald-800 dark:text-emerald-300 font-bold text-xs flex items-center gap-2 shadow-sm transition-all"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Tải Excel Danh Sách</span>
            </button>
          </div>
        </div>

        {/* Search & Filter placeholders */}
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              disabled
              placeholder="Tìm kiếm bệnh nhân (Tạm thời chưa triển khai)..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs font-semibold text-slate-400 cursor-not-allowed"
            />
          </div>
        </div>

        {/* Unimplemented Notice Box */}
        <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">
              Danh sách quản lý: {currentTab.title}
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Mẫu danh sách tôi sẽ gửi sau, tạm thời chưa triển khai mẫu danh sách. Khung quản lý đã được thiết lập sẵn sàng để tiếp nhận cấu trúc dữ liệu chính thức.
            </p>
          </div>
        </div>

        {/* Placeholder Table Shell for Visual Consistency */}
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 opacity-60 pointer-events-none select-none">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-slate-800 font-bold text-slate-600 dark:text-slate-400">
              <tr>
                <th className="py-3 px-4">STT</th>
                <th className="py-3 px-4">Mã hồ sơ</th>
                <th className="py-3 px-4">Họ và Tên bệnh nhân</th>
                <th className="py-3 px-4">Năm sinh</th>
                <th className="py-3 px-4">Giới tính</th>
                <th className="py-3 px-4">Địa chỉ (Khu phố/Tổ)</th>
                <th className="py-3 px-4">Ngày quản lý</th>
                <th className="py-3 px-4 text-center">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-400 italic text-xs">
                  (Đang chờ mẫu danh sách quản lý {currentTab.title.replace(/^\d+\.\d+\s*/, '')} từ Trạm Y tế)
                </td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
};
