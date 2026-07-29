import React from 'react';
import { Construction, ArrowLeft, Clock } from 'lucide-react';

interface UnderDevelopmentProps {
  programName: string;
  onGoBack?: () => void;
}

export const UnderDevelopment: React.FC<UnderDevelopmentProps> = ({
  programName,
  onGoBack
}) => {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl p-8 sm:p-12 text-center space-y-6 animate-fade-in">
        
        {/* Animated Icon */}
        <div className="inline-flex p-5 rounded-3xl bg-gradient-to-tr from-amber-500/10 to-orange-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 shadow-inner">
          <Construction className="w-12 h-12 animate-pulse" />
        </div>

        {/* Status Badge */}
        <div className="flex items-center justify-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30">
            <Clock className="w-3.5 h-3.5" />
            <span>Đang phát triển</span>
          </span>
        </div>

        {/* Main Title & Description */}
        <div className="space-y-2 max-w-xl mx-auto">
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Chương trình {programName} đang phát triển
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            Hệ thống đang được nâng cấp tính năng thu thập & báo cáo chuẩn cho chương trình <strong className="text-slate-700 dark:text-slate-300">{programName}</strong>. Vui lòng quay lại sau.
          </p>
        </div>

        {/* Action Button */}
        {onGoBack && (
          <div className="pt-4">
            <button
              onClick={onGoBack}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-bold transition-all shadow-md"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Quay lại Báo cáo tháng</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
