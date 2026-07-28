import React from 'react';
import { History, AlertCircle, FileText, ArrowRight } from 'lucide-react';

interface OldReportTemplateProps {
  onGoToCurrentReport?: () => void;
}

export const OldReportTemplate: React.FC<OldReportTemplateProps> = ({ onGoToCurrentReport }) => {
  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Mẫu Báo cáo Cũ (Chưa triển khai)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Lưu trữ các biểu mẫu báo cáo tổng hợp cũ trước khi áp dụng mẫu chuẩn mới
              </p>
            </div>
          </div>
        </div>

        {onGoToCurrentReport && (
          <button
            onClick={onGoToCurrentReport}
            className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-rose-600/30 transition-all self-start md:self-auto"
          >
            <FileText className="w-4 h-4" />
            <span>Mẫu Báo Cáo Tháng NCD Mới</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Main Notice Box */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 shadow-sm text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-amber-50 dark:bg-amber-950/80 border border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto shadow-inner">
          <AlertCircle className="w-8 h-8" />
        </div>

        <div className="max-w-lg mx-auto space-y-2">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Mẫu Báo Cáo Cũ - Chưa triển khai
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Mẫu báo cáo cũ trước đây hiện tại chưa được triển khai trên hệ thống. 
            Trạm Y tế đang tập trung triển khai và nhập liệu trên <strong>Mẫu Báo cáo Tháng Phòng chống Bệnh Không Lây Nhiễm (NCD)</strong> chính thức theo đúng quy định mới của Bộ Y tế.
          </p>
        </div>

        {onGoToCurrentReport && (
          <div className="pt-2">
            <button
              onClick={onGoToCurrentReport}
              className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all inline-flex items-center gap-2"
            >
              <span>Chuyển sang Báo cáo Tháng NCD Mới</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
