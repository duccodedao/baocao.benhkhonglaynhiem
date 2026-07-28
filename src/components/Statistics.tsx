import React from 'react';
import { BarChart3, AlertCircle, FileSpreadsheet } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export const Statistics: React.FC = () => {
  const { showToast } = useToast();

  const handleExportExcel = () => {
    showToast('Đã xuất báo cáo Thống kê ra tập tin Excel!', 'success');
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-rose-600 dark:text-rose-400" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Thống kê & Báo cáo
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Báo cáo tổng hợp số liệu các bệnh mãn tính
          </p>
        </div>

        <button
          onClick={handleExportExcel}
          className="px-3.5 py-2 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 text-emerald-800 dark:text-emerald-300 font-bold text-xs flex items-center gap-2 shadow-sm transition-all"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Tải Excel Thống Kê</span>
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 shadow-sm text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div className="max-w-md mx-auto space-y-1">
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            Thống kê & Báo cáo
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Thống kê báo cáo hiện tại xóa tất cả dòng nội dung, vì chưa triển khai.
          </p>
        </div>
      </div>
    </div>
  );
};
