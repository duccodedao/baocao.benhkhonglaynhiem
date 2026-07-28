import React from 'react';
import { ReportWithDetails } from '../types';
import { exportReportToExcel } from '../services/excelExporter';
import { getUnitConfig } from '../services/storage';
import {
  X,
  Download,
  Printer,
  Calendar,
  Building2,
  Lock,
  Unlock,
  UserCheck
} from 'lucide-react';

interface ReportDetailModalProps {
  report: ReportWithDetails;
  onClose: () => void;
}

export const ReportDetailModal: React.FC<ReportDetailModalProps> = ({ report, onClose }) => {
  const config = getUnitConfig();

  // Totals
  const totals = report.details.reduce(
    (acc, item) => ({
      newCase: acc.newCase + (item.newCase || 0),
      totalCase: acc.totalCase + (item.totalCase || 0),
      death: acc.death + (item.death || 0),
      totalDeath: acc.totalDeath + (item.totalDeath || 0),
      stopTreatment: acc.stopTreatment + (item.stopTreatment || 0),
      currentManagement: acc.currentManagement + (item.currentManagement || 0),
    }),
    { newCase: 0, totalCase: 0, death: 0, totalDeath: 0, stopTreatment: 0, currentManagement: 0 }
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto">
        
        {/* Modal Top Actions Header */}
        <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>BÁO CÁO UNG THƯ THÁNG {report.month.toString().padStart(2, '0')}/{report.year}</span>
              {report.isLocked && (
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                  Đã khóa
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-500">
              Đơn vị: {report.unitName} • Ngày lập: {new Date(report.createdDate).toLocaleDateString('vi-VN')}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">In báo cáo</span>
            </button>

            <button
              onClick={() => exportReportToExcel(report)}
              className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Xuất File Excel</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Printable Report Paper Content */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900 font-serif">
          
          {/* Header Banner */}
          <div className="grid grid-cols-2 gap-4 border-b pb-4 text-xs">
            <div>
              <p className="font-bold uppercase">{config.provinceName}</p>
              <p className="font-bold uppercase">{config.districtName}</p>
              <p className="font-bold uppercase underline">{config.unitName}</p>
            </div>
            <div className="text-right">
              <p className="font-bold uppercase">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
              <p className="font-bold underline">Độc lập - Tự do - Hạnh phúc</p>
            </div>
          </div>

          {/* Title */}
          <div className="text-center space-y-1">
            <h2 className="text-xl sm:text-2xl font-black text-rose-900 dark:text-rose-400 tracking-wide uppercase">
              BÁO CÁO BỆNH UNG THƯ THÁNG {report.month.toString().padStart(2, '0')} NĂM {report.year}
            </h2>
            <p className="text-xs text-slate-500 italic">
              (Người lập: {report.createdBy} - Cập nhật lần cuối: {new Date(report.updatedAt).toLocaleDateString('vi-VN')})
            </p>
          </div>

          {/* Table */}
          <div className="overflow-x-auto border border-slate-300 dark:border-slate-700 rounded-lg">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-center border-b border-slate-300 dark:border-slate-700">
                <tr>
                  <th className="p-2 border-r border-slate-300 dark:border-slate-700 w-10">STT</th>
                  <th className="p-2 border-r border-slate-300 dark:border-slate-700 text-left">Tên bệnh</th>
                  <th className="p-2 border-r border-slate-300 dark:border-slate-700">Số mắc</th>
                  <th className="p-2 border-r border-slate-300 dark:border-slate-700">Mắc tích lũy</th>
                  <th className="p-2 border-r border-slate-300 dark:border-slate-700">Số chết</th>
                  <th className="p-2 border-r border-slate-300 dark:border-slate-700">Chết tích lũy</th>
                  <th className="p-2 border-r border-slate-300 dark:border-slate-700">Không tiếp tục ĐT</th>
                  <th className="p-2 border-r border-slate-300 dark:border-slate-700">Quản lý hiện tại</th>
                  <th className="p-2">Ghi chú</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {report.details.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="p-2 text-center text-slate-500 border-r border-slate-200 dark:border-slate-800">{idx + 1}</td>
                    <td className="p-2 font-bold text-slate-900 dark:text-white border-r border-slate-200 dark:border-slate-800">{item.diseaseName}</td>
                    <td className="p-2 text-right font-bold text-rose-600 border-r border-slate-200 dark:border-slate-800">{item.newCase || 0}</td>
                    <td className="p-2 text-right border-r border-slate-200 dark:border-slate-800">{item.totalCase || 0}</td>
                    <td className="p-2 text-right border-r border-slate-200 dark:border-slate-800">{item.death || 0}</td>
                    <td className="p-2 text-right border-r border-slate-200 dark:border-slate-800">{item.totalDeath || 0}</td>
                    <td className="p-2 text-right border-r border-slate-200 dark:border-slate-800">{item.stopTreatment || 0}</td>
                    <td className="p-2 text-right font-bold text-slate-900 dark:text-white border-r border-slate-200 dark:border-slate-800">{item.currentManagement || 0}</td>
                    <td className="p-2 text-slate-500">{item.note || ''}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-100 dark:bg-slate-800 font-bold border-t-2 border-slate-300 dark:border-slate-700">
                <tr>
                  <td colSpan={2} className="p-2.5 text-center uppercase border-r border-slate-300 dark:border-slate-700">TỔNG CỘNG</td>
                  <td className="p-2.5 text-right text-rose-600 font-extrabold border-r border-slate-300 dark:border-slate-700">{totals.newCase}</td>
                  <td className="p-2.5 text-right border-r border-slate-300 dark:border-slate-700">{totals.totalCase}</td>
                  <td className="p-2.5 text-right border-r border-slate-300 dark:border-slate-700">{totals.death}</td>
                  <td className="p-2.5 text-right border-r border-slate-300 dark:border-slate-700">{totals.totalDeath}</td>
                  <td className="p-2.5 text-right border-r border-slate-300 dark:border-slate-700">{totals.stopTreatment}</td>
                  <td className="p-2.5 text-right text-rose-600 font-black border-r border-slate-300 dark:border-slate-700">{totals.currentManagement}</td>
                  <td className="p-2.5"></td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Signature block */}
          <div className="grid grid-cols-2 text-center text-xs pt-6 border-t border-slate-200 dark:border-slate-800">
            <div>
              <p className="font-bold uppercase">{config.reporterTitle}</p>
              <p className="italic text-slate-500">(Ký, ghi rõ họ tên)</p>
              <div className="h-16" />
              <p className="font-bold">{report.createdBy}</p>
            </div>
            <div>
              <p className="font-bold uppercase">{config.headTitle}</p>
              <p className="italic text-slate-500">(Ký tên, đóng dấu)</p>
              <div className="h-16" />
              <p className="font-bold">{config.headName || 'ThS.BS. Sơn Lý Hồng Đức'}</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
