import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { getDiseases, getReportByPeriod, saveReport, getUnitConfig } from '../services/storage';
import { ReportWithDetails, ReportDetail } from '../types';
import {
  FileSpreadsheet,
  Save,
  AlertCircle,
  Calendar,
  Building,
  CheckCircle2,
  RefreshCw,
  Lock
} from 'lucide-react';

interface ManualEntryProps {
  onSaved?: () => void;
  editingReportId?: string;
}

export const ManualEntry: React.FC<ManualEntryProps> = ({ onSaved }) => {
  const { user } = useAuth();
  const unitConfig = getUnitConfig();
  const diseases = useMemo(() => getDiseases(), []);

  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [unitName, setUnitName] = useState<string>(unitConfig.unitName);
  const [note, setNote] = useState<string>('');
  const [details, setDetails] = useState<Partial<ReportDetail>[]>([]);
  
  const [existingReport, setExistingReport] = useState<ReportWithDetails | undefined>(undefined);
  const [showOverwriteModal, setShowOverwriteModal] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Initialize table rows based on diseases or existing report
  useEffect(() => {
    const existing = getReportByPeriod(month, year);
    setExistingReport(existing);

    if (existing) {
      setNote(existing.note || '');
      setUnitName(existing.unitName || unitConfig.unitName);
      // Map existing details with disease catalog order
      const mapped = diseases.map(dis => {
        const found = existing.details.find(d => d.diseaseId === dis.id || d.diseaseName === dis.name);
        if (found) {
          return { ...found };
        }
        return {
          diseaseId: dis.id,
          diseaseName: dis.name,
          newCase: 0,
          totalCase: 0,
          death: 0,
          totalDeath: 0,
          stopTreatment: 0,
          currentManagement: 0,
          note: ''
        };
      });
      setDetails(mapped);
    } else {
      // Create fresh blank matrix
      const fresh = diseases.map(dis => ({
        diseaseId: dis.id,
        diseaseName: dis.name,
        newCase: 0,
        totalCase: 0,
        death: 0,
        totalDeath: 0,
        stopTreatment: 0,
        currentManagement: 0,
        note: ''
      }));
      setDetails(fresh);
    }
  }, [month, year, diseases]);

  // Field change handler
  const handleCellChange = (index: number, field: keyof ReportDetail, value: any) => {
    if (existingReport?.isLocked) return;

    setDetails(prev => {
      const updated = [...prev];
      const item = { ...updated[index] };

      if (field === 'note') {
        item.note = String(value);
      } else {
        const num = Math.max(0, parseInt(value || '0', 10));
        (item as any)[field] = isNaN(num) ? 0 : num;
      }

      updated[index] = item;
      return updated;
    });
  };

  // Auto-calculate Totals
  const totals = useMemo(() => {
    return details.reduce(
      (acc, d) => ({
        newCase: acc.newCase + (d.newCase || 0),
        totalCase: acc.totalCase + (d.totalCase || 0),
        death: acc.death + (d.death || 0),
        totalDeath: acc.totalDeath + (d.totalDeath || 0),
        stopTreatment: acc.stopTreatment + (d.stopTreatment || 0),
        currentManagement: acc.currentManagement + (d.currentManagement || 0),
      }),
      { newCase: 0, totalCase: 0, death: 0, totalDeath: 0, stopTreatment: 0, currentManagement: 0 }
    );
  }, [details]);

  // Execute Save
  const executeSave = (mode: 'CREATE' | 'UPDATE' | 'OVERWRITE') => {
    const reportId = existingReport ? existingReport.id : `rep_${year}_${month.toString().padStart(2, '0')}`;

    const formattedDetails: ReportDetail[] = details.map((d, idx) => ({
      id: d.id || `det_${reportId}_${d.diseaseId || idx}`,
      reportId: reportId,
      diseaseId: d.diseaseId || `dis_${idx}`,
      diseaseName: d.diseaseName || '',
      newCase: d.newCase || 0,
      totalCase: d.totalCase || 0,
      death: d.death || 0,
      totalDeath: d.totalDeath || 0,
      stopTreatment: d.stopTreatment || 0,
      currentManagement: d.currentManagement || 0,
      note: d.note || ''
    }));

    const reportObj: ReportWithDetails = {
      id: reportId,
      unitName: unitName || unitConfig.unitName,
      month,
      year,
      createdDate: existingReport ? existingReport.createdDate : new Date().toISOString(),
      createdBy: existingReport ? existingReport.createdBy : user?.displayName || 'Cán bộ Y tế',
      updatedAt: new Date().toISOString(),
      updatedBy: user?.displayName || 'Cán bộ Y tế',
      isLocked: existingReport ? existingReport.isLocked : false,
      programCode: 'UNG_THU',
      note,
      details: formattedDetails
    };

    saveReport(reportObj, mode, {
      email: user?.email || 'user@tramyte.gov.vn',
      name: user?.displayName || 'Cán bộ Y tế'
    });

    setShowOverwriteModal(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);

    if (onSaved) onSaved();
  };

  const handleSaveClick = () => {
    if (existingReport) {
      setShowOverwriteModal(true);
    } else {
      executeSave('CREATE');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-rose-600 dark:text-rose-400" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Nhập tay Số liệu Báo cáo Tháng
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Giao diện giống Excel, hỗ trợ phím Tab/Enter di chuyển giữa các ô dữ liệu
          </p>
        </div>

        {/* Save Button */}
        <div className="flex items-center gap-3">
          {saveSuccess && (
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Lưu thành công!</span>
            </span>
          )}

          <button
            onClick={handleSaveClick}
            disabled={existingReport?.isLocked || user?.role === 'VIEWER'}
            className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-rose-600/30 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Lưu Báo cáo</span>
          </button>
        </div>
      </div>

      {/* Select Period & Info */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Month Picker */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
            Tháng Báo cáo
          </label>
          <div className="relative">
            <select
              value={month}
              onChange={e => setMonth(parseInt(e.target.value, 10))}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold focus:ring-2 focus:ring-rose-500"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                <option key={m} value={m}>Tháng {m.toString().padStart(2, '0')}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Year Picker */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
            Năm Báo cáo
          </label>
          <select
            value={year}
            onChange={e => setYear(parseInt(e.target.value, 10))}
            className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold focus:ring-2 focus:ring-rose-500"
          >
            {[2024, 2025, 2026, 2027, 2028].map(y => (
              <option key={y} value={y}>Năm {y}</option>
            ))}
          </select>
        </div>

        {/* Unit Name */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
            Đơn vị Báo cáo
          </label>
          <input
            type="text"
            value={unitName}
            onChange={e => setUnitName(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-rose-500"
          />
        </div>

        {/* Status Notice */}
        <div className="flex flex-col justify-center">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
            Trạng thái Hồ sơ
          </label>
          {existingReport ? (
            existingReport.isLocked ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold text-xs">
                <Lock className="w-4 h-4 text-amber-500" />
                <span>Đã khóa (Không thể chỉnh sửa)</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold text-xs">
                <AlertCircle className="w-4 h-4" />
                <span>Đã có báo cáo (Chế độ chỉnh sửa)</span>
              </span>
            )
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold text-xs">
              <CheckCircle2 className="w-4 h-4" />
              <span>Chưa tạo (Báo cáo mới)</span>
            </span>
          )}
        </div>

      </div>

      {/* Main Excel Grid Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <p className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            BẢNG SỐ LIỆU QUẢN LÝ BỆNH MÃN TÍNH THÁNG {month.toString().padStart(2, '0')}/{year} ({diseases.length} LOẠI BỆNH)
          </p>
          <p className="text-[11px] text-slate-500 italic">
            Dùng phím Tab để chuyển ô tiếp theo
          </p>
        </div>

        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="sticky top-0 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold z-10 shadow-sm">
              <tr className="border-b border-slate-300 dark:border-slate-700">
                <th className="py-2.5 px-3 text-center w-12 border-r border-slate-200 dark:border-slate-700">STT</th>
                <th className="py-2.5 px-3 min-w-[220px] border-r border-slate-200 dark:border-slate-700">Tên bệnh</th>
                <th className="py-2.5 px-3 text-right w-24 border-r border-slate-200 dark:border-slate-700">Số mắc</th>
                <th className="py-2.5 px-3 text-right w-28 border-r border-slate-200 dark:border-slate-700">Mắc tích lũy</th>
                <th className="py-2.5 px-3 text-right w-24 border-r border-slate-200 dark:border-slate-700">Số chết</th>
                <th className="py-2.5 px-3 text-right w-28 border-r border-slate-200 dark:border-slate-700">Chết tích lũy</th>
                <th className="py-2.5 px-3 text-right w-36 border-r border-slate-200 dark:border-slate-700">Không tiếp tục điều trị</th>
                <th className="py-2.5 px-3 text-right w-32 border-r border-slate-200 dark:border-slate-700">Quản lý hiện tại</th>
                <th className="py-2.5 px-3 min-w-[180px]">Ghi chú</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {details.map((item, idx) => (
                <tr key={idx} className="hover:bg-rose-50/40 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="py-1.5 px-3 text-center text-slate-500 font-semibold border-r border-slate-200 dark:border-slate-800">
                    {idx + 1}
                  </td>
                  <td className="py-1.5 px-3 font-bold text-slate-900 dark:text-white border-r border-slate-200 dark:border-slate-800">
                    {item.diseaseName}
                  </td>
                  <td className="p-1 border-r border-slate-200 dark:border-slate-800">
                    <input
                      type="number"
                      min="0"
                      value={item.newCase || ''}
                      onChange={e => handleCellChange(idx, 'newCase', e.target.value)}
                      disabled={existingReport?.isLocked}
                      className="w-full text-right px-2 py-1 rounded bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-xs focus:bg-white focus:ring-2 focus:ring-rose-500 border border-transparent hover:border-slate-300 dark:hover:border-slate-700"
                    />
                  </td>
                  <td className="p-1 border-r border-slate-200 dark:border-slate-800">
                    <input
                      type="number"
                      min="0"
                      value={item.totalCase || ''}
                      onChange={e => handleCellChange(idx, 'totalCase', e.target.value)}
                      disabled={existingReport?.isLocked}
                      className="w-full text-right px-2 py-1 rounded bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold text-xs focus:bg-white focus:ring-2 focus:ring-rose-500 border border-transparent hover:border-slate-300 dark:hover:border-slate-700"
                    />
                  </td>
                  <td className="p-1 border-r border-slate-200 dark:border-slate-800">
                    <input
                      type="number"
                      min="0"
                      value={item.death || ''}
                      onChange={e => handleCellChange(idx, 'death', e.target.value)}
                      disabled={existingReport?.isLocked}
                      className="w-full text-right px-2 py-1 rounded bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold text-xs focus:bg-white focus:ring-2 focus:ring-rose-500 border border-transparent hover:border-slate-300 dark:hover:border-slate-700"
                    />
                  </td>
                  <td className="p-1 border-r border-slate-200 dark:border-slate-800">
                    <input
                      type="number"
                      min="0"
                      value={item.totalDeath || ''}
                      onChange={e => handleCellChange(idx, 'totalDeath', e.target.value)}
                      disabled={existingReport?.isLocked}
                      className="w-full text-right px-2 py-1 rounded bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold text-xs focus:bg-white focus:ring-2 focus:ring-rose-500 border border-transparent hover:border-slate-300 dark:hover:border-slate-700"
                    />
                  </td>
                  <td className="p-1 border-r border-slate-200 dark:border-slate-800">
                    <input
                      type="number"
                      min="0"
                      value={item.stopTreatment || ''}
                      onChange={e => handleCellChange(idx, 'stopTreatment', e.target.value)}
                      disabled={existingReport?.isLocked}
                      className="w-full text-right px-2 py-1 rounded bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold text-xs focus:bg-white focus:ring-2 focus:ring-rose-500 border border-transparent hover:border-slate-300 dark:hover:border-slate-700"
                    />
                  </td>
                  <td className="p-1 border-r border-slate-200 dark:border-slate-800">
                    <input
                      type="number"
                      min="0"
                      value={item.currentManagement || ''}
                      onChange={e => handleCellChange(idx, 'currentManagement', e.target.value)}
                      disabled={existingReport?.isLocked}
                      className="w-full text-right px-2 py-1 rounded bg-rose-50/70 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 font-bold text-xs focus:bg-white focus:ring-2 focus:ring-rose-500 border border-transparent hover:border-slate-300 dark:hover:border-slate-700"
                    />
                  </td>
                  <td className="p-1">
                    <input
                      type="text"
                      value={item.note || ''}
                      onChange={e => handleCellChange(idx, 'note', e.target.value)}
                      disabled={existingReport?.isLocked}
                      placeholder="Ghi chú thêm..."
                      className="w-full px-2 py-1 rounded bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:bg-white focus:ring-2 focus:ring-rose-500 border border-transparent hover:border-slate-300 dark:hover:border-slate-700"
                    />
                  </td>
                </tr>
              ))}
            </tbody>

            {/* TOTALS FOOTER */}
            <tfoot className="sticky bottom-0 bg-slate-100 dark:bg-slate-800 font-bold border-t-2 border-slate-300 dark:border-slate-700 z-10 shadow-inner">
              <tr className="text-slate-900 dark:text-white">
                <td colSpan={2} className="py-3 px-4 text-center text-xs uppercase tracking-wider border-r border-slate-300 dark:border-slate-700">
                  TỔNG CỘNG ({details.length} loại bệnh)
                </td>
                <td className="py-3 px-3 text-right text-rose-600 dark:text-rose-400 font-extrabold text-sm border-r border-slate-300 dark:border-slate-700">
                  {totals.newCase}
                </td>
                <td className="py-3 px-3 text-right font-extrabold text-slate-900 dark:text-white border-r border-slate-300 dark:border-slate-700">
                  {totals.totalCase}
                </td>
                <td className="py-3 px-3 text-right text-slate-700 dark:text-slate-300 font-bold border-r border-slate-300 dark:border-slate-700">
                  {totals.death}
                </td>
                <td className="py-3 px-3 text-right font-bold text-slate-900 dark:text-white border-r border-slate-300 dark:border-slate-700">
                  {totals.totalDeath}
                </td>
                <td className="py-3 px-3 text-right font-bold text-slate-900 dark:text-white border-r border-slate-300 dark:border-slate-700">
                  {totals.stopTreatment}
                </td>
                <td className="py-3 px-3 text-right text-rose-600 dark:text-rose-400 font-black text-sm border-r border-slate-300 dark:border-slate-700">
                  {totals.currentManagement}
                </td>
                <td className="py-3 px-3"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* OVERWRITE / UPDATE PROMPT MODAL */}
      {showOverwriteModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center gap-3 text-amber-600">
              <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-950 flex items-center justify-center">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Đã tồn tại Báo cáo Tháng {month.toString().padStart(2, '0')}/{year}
              </h3>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Dữ liệu của tháng này đã được nhập trước đó. Bạn vui lòng chọn hình thức cập nhật:
            </p>

            <div className="space-y-2 pt-2">
              <button
                onClick={() => executeSave('OVERWRITE')}
                className="w-full text-left p-3 rounded-2xl border border-slate-200 dark:border-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:border-rose-300 transition-all group"
              >
                <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-rose-600">
                  ● Ghi đè (Overwrite)
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Xóa toàn bộ số liệu cũ và thay thế hoàn toàn bằng số liệu trên bảng hiện tại.
                </p>
              </button>

              <button
                onClick={() => executeSave('UPDATE')}
                className="w-full text-left p-3 rounded-2xl border border-slate-200 dark:border-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:border-blue-300 transition-all group"
              >
                <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600">
                  ● Cập nhật (Update)
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Giữ lại thời gian tạo ban đầu và cập nhật chỉnh sửa nội dung.
                </p>
              </button>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowOverwriteModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Hủy bỏ
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
