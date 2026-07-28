import React, { useState } from 'react';
import { exportDatabaseJson, restoreDatabaseJson } from '../services/storage';
import { useAuth } from '../context/AuthContext';
import { Database, Download, Upload, CheckCircle2, AlertTriangle } from 'lucide-react';

export const BackupRestore: React.FC = () => {
  const { user } = useAuth();
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleExport = () => {
    const jsonStr = exportDatabaseJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `Backup_SoLieu_UngThu_TrameYTe_${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const ok = restoreDatabaseJson(content, {
          email: user?.email || 'admin@tramyte.gov.vn',
          name: user?.displayName || 'Quản trị viên'
        });
        if (ok) {
          setSuccessMsg('Đã phục hồi dữ liệu thành công! Tải lại trang để áp dụng.');
          setTimeout(() => window.location.reload(), 1500);
        } else {
          alert('File sao lưu JSON không hợp lệ!');
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Database className="w-6 h-6 text-rose-600 dark:text-rose-400" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Sao lưu & Phục hồi Cơ sở Dữ liệu
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Xuất file sao lưu dự phòng toàn bộ báo cáo, danh mục và cấu hình trạm Y tế
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 font-bold text-xs flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Export Card */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950 flex items-center justify-center text-rose-600 dark:text-rose-400">
              <Download className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Xuất File Sao lưu (.JSON)</h3>
              <p className="text-xs text-slate-500">Tải xuống toàn bộ dữ liệu hiện tại để lưu trữ an toàn</p>
            </div>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            File sao lưu chứa toàn bộ thông tin các báo cáo tháng, danh mục 49 bệnh ung thư, nhật ký chỉnh sửa và cấu hình đơn vị Trạm Y tế.
          </p>

          <button
            onClick={handleExport}
            className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-rose-600/30 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>TẢI FILE SAO LƯU NGAY</span>
          </button>
        </div>

        {/* Restore Card */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Phục hồi Dữ liệu từ File</h3>
              <p className="text-xs text-slate-500">Ghi đè hoặc phôi phục dữ liệu từ file JSON đã xuất trước đó</p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 text-amber-800 dark:text-amber-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Lưu ý: Phục hồi sẽ ghi đè dữ liệu hiện tại bằng nội dung trong file sao lưu.</span>
          </div>

          <label className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg cursor-pointer transition-all">
            <Upload className="w-4 h-4" />
            <span>CHỌN FILE .JSON ĐỂ PHỤC HỒI</span>
            <input type="file" accept=".json" onChange={handleImport} className="hidden" />
          </label>
        </div>

      </div>
    </div>
  );
};
