import React from 'react';
import { BookOpen, AlertCircle } from 'lucide-react';

export const DiseaseCatalog: React.FC = () => {
  return (
    <div className="space-y-6 pb-12">
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-rose-600 dark:text-rose-400" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Danh mục Bệnh Mãn tính
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Danh mục các nhóm bệnh mãn tính và mã nhóm phân loại
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 shadow-sm text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div className="max-w-md mx-auto space-y-1">
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            Danh mục bệnh mãn tính
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Danh mục bệnh mãn tính hiện tại xóa tất cả dòng nội dung, vì chưa triển khai.
          </p>
        </div>
      </div>
    </div>
  );
};
