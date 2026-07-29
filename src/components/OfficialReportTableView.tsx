import React, { useState } from 'react';
import { OfficialNcdData } from './OfficialMonthlyReport';
import {
  Table,
  Building,
  Calendar,
  Heart,
  Activity,
  ShieldAlert,
  Clock,
  Stethoscope,
  Pill,
  Layers
} from 'lucide-react';

interface OfficialReportTableViewProps {
  reportData: OfficialNcdData;
  title: string;
  unitName?: string;
  colCurrentLabel: string;
  colPrevLabel: string;
}

export const OfficialReportTableView: React.FC<OfficialReportTableViewProps> = ({
  reportData,
  title,
  unitName,
  colCurrentLabel,
  colPrevLabel
}) => {
  const [activeViewTab, setActiveViewTab] = useState<'all' | 'tha' | 'dtd' | 'cancer' | 'iod' | 'copd' | 'asthma'>('all');
  const displayUnit = unitName || reportData.unitName || 'TRẠM Y TẾ PHƯỜNG HIỆP THÀNH';

  const formatVal = (val: number | undefined | null) => {
    if (val === undefined || val === null) return '0';
    return val.toLocaleString('vi-VN');
  };

  const formatComp = (str: string | undefined | null) => {
    if (!str || str === 'Không') return <span className="text-slate-500 font-semibold">Không</span>;
    if (str.includes('+') || str.includes('Tăng')) {
      return <span className="text-rose-600 font-bold dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded">{str}</span>;
    }
    if (str.includes('-') || str.includes('Giảm')) {
      return <span className="text-emerald-600 font-bold dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded">{str}</span>;
    }
    return <span className="text-slate-600 font-medium">{str}</span>;
  };

  return (
    <div className="space-y-6">
      {/* Table Header Info Banner */}
      <div className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400">
            <Table className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              {title}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-2">
              <Building className="w-3.5 h-3.5" />
              <span>Đơn vị: <strong className="text-slate-800 dark:text-slate-200">{displayUnit}</strong></span>
            </p>
          </div>
        </div>
        <div className="text-xs font-semibold text-rose-600 dark:text-rose-400 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-1.5 shadow-sm">
          <Calendar className="w-3.5 h-3.5" />
          <span>{reportData.reportDate || 'Số liệu tổng hợp Bộ Y Tế'}</span>
        </div>
      </div>

      {/* Report Module Tabs Selector for read-only view (Hidden on Print) */}
      <div className="print:hidden bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-x-auto flex items-center gap-1.5 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700 pb-2">
        <button
          onClick={() => setActiveViewTab('all')}
          className={`shrink-0 py-2 px-3.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
            activeViewTab === 'all'
              ? 'bg-rose-600 text-white shadow-sm shadow-rose-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Tất cả chương trình</span>
        </button>

        <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 shrink-0 mx-1" />

        <button
          onClick={() => setActiveViewTab('tha')}
          className={`shrink-0 py-2 px-3.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
            activeViewTab === 'tha'
              ? 'bg-rose-600 text-white shadow-sm shadow-rose-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Heart className="w-4 h-4" />
          <span>6. Tăng huyết áp (THA)</span>
        </button>

        <button
          onClick={() => setActiveViewTab('dtd')}
          className={`shrink-0 py-2 px-3.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
            activeViewTab === 'dtd'
              ? 'bg-rose-600 text-white shadow-sm shadow-rose-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>7. Đái tháo đường (ĐTĐ)</span>
        </button>

        <button
          onClick={() => setActiveViewTab('cancer')}
          className={`shrink-0 py-2 px-3.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
            activeViewTab === 'cancer'
              ? 'bg-rose-600 text-white shadow-sm shadow-rose-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>8. Bệnh Ung thư</span>
        </button>

        <button
          onClick={() => setActiveViewTab('iod')}
          className={`shrink-0 py-2 px-3.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
            activeViewTab === 'iod'
              ? 'bg-rose-600 text-white shadow-sm shadow-rose-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>9. Rối loạn do thiếu I-ốt</span>
        </button>

        <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 shrink-0 mx-1" />

        <button
          onClick={() => setActiveViewTab('copd')}
          className={`shrink-0 py-2 px-3.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
            activeViewTab === 'copd'
              ? 'bg-rose-600 text-white shadow-sm shadow-rose-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Stethoscope className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Báo cáo COPD</span>
          <span className="text-[10px] bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 px-1.5 py-0.5 rounded-md font-bold shrink-0">Chờ mẫu</span>
        </button>

        <button
          onClick={() => setActiveViewTab('asthma')}
          className={`shrink-0 py-2 px-3.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
            activeViewTab === 'asthma'
              ? 'bg-rose-600 text-white shadow-sm shadow-rose-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Pill className="w-4 h-4 text-rose-600 dark:text-rose-400" />
          <span>Báo cáo Hen PQ</span>
          <span className="text-[10px] bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 px-1.5 py-0.5 rounded-md font-bold shrink-0">Chờ mẫu</span>
        </button>
      </div>

      {/* COPD Read-Only Placeholder */}
      {activeViewTab === 'copd' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center text-center space-y-4">
          <div className="p-4 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
            <Stethoscope className="w-10 h-10 animate-pulse" />
          </div>
          <div className="max-w-md space-y-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Báo Cáo Chương Trình COPD (Bộ Y Tế)</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Phân hệ này đã sẵn sàng. Trạm Y tế sẽ cập nhật số liệu hiển thị tại đây ngay sau khi nhận được mẫu chính thức từ bạn.
            </p>
          </div>
        </div>
      )}

      {/* Asthma Read-Only Placeholder */}
      {activeViewTab === 'asthma' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center text-center space-y-4">
          <div className="p-4 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400">
            <Pill className="w-10 h-10 animate-pulse" />
          </div>
          <div className="max-w-md space-y-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Báo Cáo Chương Trình Hen Phế Quản</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Phân hệ này đã sẵn sàng. Trạm Y tế sẽ cập nhật số liệu hiển thị tại đây ngay sau khi nhận được mẫu chính thức từ bạn.
            </p>
          </div>
        </div>
      )}

      {/* --- SECTION 6: TĂNG HUYẾT ÁP --- */}
      <div className={`bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden ${
        activeViewTab === 'all' || activeViewTab === 'tha' ? 'block' : 'hidden print:block'
      }`}>
        <div className="p-3.5 bg-slate-100/80 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
            6. PHÒNG, CHỐNG TĂNG HUYẾT ÁP (THA)
          </h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-800/90 text-slate-800 dark:text-slate-200 font-bold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-2.5 px-3 text-center w-12 border-r border-slate-200 dark:border-slate-700">TT</th>
                <th className="py-2.5 px-3 min-w-[280px] border-r border-slate-200 dark:border-slate-700">Nội dung báo cáo</th>
                <th className="py-2.5 px-3 text-right w-36">{colCurrentLabel}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className="py-2 px-3 text-center font-semibold border-r border-slate-200 dark:border-slate-800">1</td>
                <td className="py-2 px-3 border-r border-slate-200 dark:border-slate-800">Tổng số bệnh nhân THA được phát hiện mới</td>
                <td className="py-2 px-3 text-right font-bold text-blue-600 dark:text-blue-400">{formatVal(reportData.tha?.m1_newCase)}</td>
              </tr>
              <tr>
                <td className="py-2 px-3 text-center font-semibold border-r border-slate-200 dark:border-slate-800">2</td>
                <td className="py-2 px-3 border-r border-slate-200 dark:border-slate-800">Tổng số bệnh nhân THA cũ quay lại điều trị</td>
                <td className="py-2 px-3 text-right font-mono">{formatVal(reportData.tha?.m2_reTreat)}</td>
              </tr>
              <tr>
                <td className="py-2 px-3 text-center font-semibold border-r border-slate-200 dark:border-slate-800">3</td>
                <td className="py-2 px-3 border-r border-slate-200 dark:border-slate-800">Số ca tử vong do bệnh THA</td>
                <td className="py-2 px-3 text-right font-mono text-slate-700 dark:text-slate-300">{formatVal(reportData.tha?.m3_death)}</td>
              </tr>
              <tr>
                <td className="py-2 px-3 text-center font-semibold border-r border-slate-200 dark:border-slate-800">4</td>
                <td className="py-2 px-3 border-r border-slate-200 dark:border-slate-800">Số bệnh nhân THA không tiếp tục tham gia điều trị</td>
                <td className="py-2 px-3 text-right font-mono">{formatVal(reportData.tha?.m4_stopTreat)}</td>
              </tr>
              <tr className="bg-rose-50/50 dark:bg-rose-950/30">
                <td className="py-2.5 px-3 text-center font-bold border-r border-slate-200 dark:border-slate-800">5</td>
                <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white border-r border-slate-200 dark:border-slate-800">Tổng số bệnh nhân THA được quản lý hiện tại</td>
                <td className="py-2.5 px-3 text-right font-black text-rose-600 dark:text-rose-400 text-sm">{formatVal(reportData.tha?.m5_currentManaged)}</td>
              </tr>
              <tr>
                <td className="py-2 px-3 text-center font-semibold border-r border-slate-200 dark:border-slate-800">6</td>
                <td className="py-2 px-3 border-r border-slate-200 dark:border-slate-800">Số BN THA đạt huyết áp mục tiêu</td>
                <td className="py-2 px-3 text-right font-mono">{formatVal(reportData.tha?.m6_targetBp)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* --- SECTION 7: ĐÁI THÁO ĐƯỜNG --- */}
      <div className={`bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden ${
        activeViewTab === 'all' || activeViewTab === 'dtd' ? 'block' : 'hidden print:block'
      }`}>
        <div className="p-3.5 bg-slate-100/80 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
            7. PHÒNG, CHỐNG ĐÁI THÁO ĐƯỜNG (ĐTĐ)
          </h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-800/90 text-slate-800 dark:text-slate-200 font-bold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-2.5 px-3 text-center w-12 border-r border-slate-200 dark:border-slate-700">TT</th>
                <th className="py-2.5 px-3 min-w-[280px] border-r border-slate-200 dark:border-slate-700">Nội dung báo cáo</th>
                <th className="py-2.5 px-3 text-right w-36">{colCurrentLabel}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className="py-2 px-3 text-center font-semibold border-r border-slate-200 dark:border-slate-800">1</td>
                <td className="py-2 px-3 border-r border-slate-200 dark:border-slate-800">Tổng số BN ĐTĐ được phát hiện mới</td>
                <td className="py-2 px-3 text-right font-bold text-blue-600 dark:text-blue-400">{formatVal(reportData.dtd?.m1_newCase)}</td>
              </tr>
              <tr>
                <td className="py-2 px-3 text-center font-semibold border-r border-slate-200 dark:border-slate-800">2</td>
                <td className="py-2 px-3 border-r border-slate-200 dark:border-slate-800">Tổng số bệnh nhân ĐTĐ cũ quay lại điều trị</td>
                <td className="py-2 px-3 text-right font-mono">{formatVal(reportData.dtd?.m2_reTreat)}</td>
              </tr>
              <tr className="bg-blue-50/50 dark:bg-blue-950/30">
                <td className="py-2.5 px-3 text-center font-bold border-r border-slate-200 dark:border-slate-800">3</td>
                <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white border-r border-slate-200 dark:border-slate-800">Tổng số BN ĐTĐ được quản lý hiện tại</td>
                <td className="py-2.5 px-3 text-right font-black text-blue-600 dark:text-blue-400 text-sm">{formatVal(reportData.dtd?.m3_currentManaged)}</td>
              </tr>
              <tr>
                <td className="py-2 px-3 text-center font-semibold border-r border-slate-200 dark:border-slate-800">4</td>
                <td className="py-2 px-3 border-r border-slate-200 dark:border-slate-800">Số BN ĐTĐ điều trị duy trì ổn định</td>
                <td className="py-2 px-3 text-right font-mono">{formatVal(reportData.dtd?.m4_stableTreat)}</td>
              </tr>
              <tr>
                <td className="py-2 px-3 text-center font-semibold border-r border-slate-200 dark:border-slate-800">5</td>
                <td className="py-2 px-3 border-r border-slate-200 dark:border-slate-800">Số ca tử vong do bệnh ĐTĐ</td>
                <td className="py-2 px-3 text-right font-mono">{formatVal(reportData.dtd?.m5_death)}</td>
              </tr>
              <tr>
                <td className="py-2 px-3 text-center font-semibold border-r border-slate-200 dark:border-slate-800">6</td>
                <td className="py-2 px-3 border-r border-slate-200 dark:border-slate-800">Tổng số BN ĐTĐ không tiếp tục tham gia điều trị</td>
                <td className="py-2 px-3 text-right font-mono">{formatVal(reportData.dtd?.m6_stopTreat)}</td>
              </tr>
              <tr>
                <td className="py-2 px-3 text-center font-semibold border-r border-slate-200 dark:border-slate-800">7</td>
                <td className="py-2 px-3 border-r border-slate-200 dark:border-slate-800">Tổng số BN tiền ĐTĐ được phát hiện mới</td>
                <td className="py-2 px-3 text-right font-mono">{formatVal(reportData.dtd?.m7_prediabetesNew)}</td>
              </tr>
              <tr>
                <td className="py-2 px-3 text-center font-semibold border-r border-slate-200 dark:border-slate-800">8</td>
                <td className="py-2 px-3 border-r border-slate-200 dark:border-slate-800 font-semibold">Tổng số BN tiền ĐTĐ được quản lý hiện tại</td>
                <td className="py-2 px-3 text-right font-mono">{formatVal(reportData.dtd?.m8_prediabetesManaged)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* --- SECTION 8: UNG THƯ --- */}
      <div className={`bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden ${
        activeViewTab === 'all' || activeViewTab === 'cancer' ? 'block' : 'hidden print:block'
      }`}>
        <div className="p-3.5 bg-slate-100/80 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
            8. PHÒNG, CHỐNG UNG THƯ
          </h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-800/90 text-slate-800 dark:text-slate-200 font-bold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-2.5 px-3 text-center w-12 border-r border-slate-200 dark:border-slate-700">TT</th>
                <th className="py-2.5 px-3 min-w-[280px] border-r border-slate-200 dark:border-slate-700">Nội dung báo cáo</th>
                <th className="py-2.5 px-3 text-right w-36">{colCurrentLabel}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className="py-2 px-3 text-center font-semibold border-r border-slate-200 dark:border-slate-800">1</td>
                <td className="py-2 px-3 border-r border-slate-200 dark:border-slate-800">Tổng số bệnh nhân Ung thư được phát hiện mới</td>
                <td className="py-2 px-3 text-right font-bold text-purple-600 dark:text-purple-400">{formatVal(reportData.cancer?.m1_newCase)}</td>
              </tr>
              <tr>
                <td className="py-2 px-3 text-center font-semibold border-r border-slate-200 dark:border-slate-800">2</td>
                <td className="py-2 px-3 border-r border-slate-200 dark:border-slate-800">Tổng số bệnh nhân Ung thư cũ quay lại điều trị</td>
                <td className="py-2 px-3 text-right font-mono">{formatVal(reportData.cancer?.m2_reTreat)}</td>
              </tr>
              <tr>
                <td className="py-2 px-3 text-center font-semibold border-r border-slate-200 dark:border-slate-800">3</td>
                <td className="py-2 px-3 border-r border-slate-200 dark:border-slate-800">Số ca tử vong do Ung thư</td>
                <td className="py-2 px-3 text-right font-mono">{formatVal(reportData.cancer?.m3_death)}</td>
              </tr>
              <tr>
                <td className="py-2 px-3 text-center font-semibold border-r border-slate-200 dark:border-slate-800">4</td>
                <td className="py-2 px-3 border-r border-slate-200 dark:border-slate-800">Số bệnh nhân Ung thư không tiếp tục tham gia điều trị</td>
                <td className="py-2 px-3 text-right font-mono">{formatVal(reportData.cancer?.m4_stopTreat)}</td>
              </tr>
              <tr className="bg-purple-50/50 dark:bg-purple-950/30">
                <td className="py-2.5 px-3 text-center font-bold border-r border-slate-200 dark:border-slate-800">5</td>
                <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white border-r border-slate-200 dark:border-slate-800">Tổng số bệnh nhân Ung thư được quản lý hiện tại</td>
                <td className="py-2.5 px-3 text-right font-black text-purple-600 dark:text-purple-400 text-sm">{formatVal(reportData.cancer?.m5_currentManaged)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* --- SECTION 9: RỐI LOẠN DO THIẾU I-ỐT --- */}
      <div className={`bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden ${
        activeViewTab === 'all' || activeViewTab === 'iod' ? 'block' : 'hidden print:block'
      }`}>
        <div className="p-3.5 bg-slate-100/80 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
            9. PHÒNG, CHỐNG RỐI LOẠN DO THIẾU I-ỐT (IOD)
          </h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-800/90 text-slate-800 dark:text-slate-200 font-bold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-2.5 px-3 text-center w-12 border-r border-slate-200 dark:border-slate-700">TT</th>
                <th className="py-2.5 px-3 min-w-[280px] border-r border-slate-200 dark:border-slate-700">Nội dung báo cáo</th>
                <th className="py-2.5 px-3 text-right w-36">{colCurrentLabel}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className="py-2 px-3 text-center font-bold border-r border-slate-200 dark:border-slate-800">1</td>
                <td className="py-2 px-3 font-bold text-slate-900 dark:text-white border-r border-slate-200 dark:border-slate-800">Số mẫu muối I-ốt kiểm tra</td>
                <td className="py-2 px-3 text-right font-bold text-cyan-600 dark:text-cyan-400">{formatVal(reportData.iod?.m1_saltTested)}</td>
              </tr>
              <tr>
                <td className="py-2 px-3 text-center italic border-r border-slate-200 dark:border-slate-800">1.1</td>
                <td className="py-2 px-3 pl-6 italic border-r border-slate-200 dark:border-slate-800">Số mẫu kiểm tra đạt chất lượng</td>
                <td className="py-2 px-3 text-right font-mono">{formatVal(reportData.iod?.m1_1_saltPass)}</td>
              </tr>
              <tr>
                <td className="py-2 px-3 text-center italic border-r border-slate-200 dark:border-slate-800">1.2</td>
                <td className="py-2 px-3 pl-6 italic border-r border-slate-200 dark:border-slate-800">Số mẫu kiểm tra không đạt chất lượng</td>
                <td className="py-2 px-3 text-right font-mono">{formatVal(reportData.iod?.m1_2_saltFail)}</td>
              </tr>
              <tr>
                <td className="py-2 px-3 text-center font-bold border-r border-slate-200 dark:border-slate-800">2</td>
                <td className="py-2 px-3 font-bold border-r border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white">Tỷ lệ % hộ gia đình sử dụng muối I ốt đạt chất lượng</td>
                <td className="py-2 px-3 text-right font-mono">{formatVal(reportData.iod?.m2_householdRatio)}%</td>
              </tr>
              <tr>
                <td className="py-2 px-3 text-center font-bold border-r border-slate-200 dark:border-slate-800">3</td>
                <td className="py-2 px-3 font-bold border-r border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white">Tỷ lệ % trẻ 8 - 12 tuổi mắc bệnh Bướu cổ</td>
                <td className="py-2 px-3 text-right font-mono">{formatVal(reportData.iod?.m3_goiterChildRatio)}%</td>
              </tr>
              <tr>
                <td className="py-2 px-3 text-center font-bold border-r border-slate-200 dark:border-slate-800">4</td>
                <td className="py-2 px-3 font-bold border-r border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white">Tổng số lượt khám phát hiện bệnh Bướu cổ</td>
                <td className="py-2 px-3 text-right font-mono">{formatVal(reportData.iod?.m4_goiterExamTotal)}</td>
              </tr>
              <tr>
                <td className="py-2 px-3 text-center font-bold border-r border-slate-200 dark:border-slate-800">5</td>
                <td className="py-2 px-3 font-bold border-r border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white">Tổng số bệnh nhân Bướu cổ đơn thuần</td>
                <td className="py-2 px-3 text-right font-mono">{formatVal(reportData.iod?.m5_goiterSimpleTotal)}</td>
              </tr>
              <tr>
                <td className="py-2 px-3 text-center italic border-r border-slate-200 dark:border-slate-800">5,1</td>
                <td className="py-2 px-3 pl-6 italic border-r border-slate-200 dark:border-slate-800">Trẻ em 8 - 12 tuổi</td>
                <td className="py-2 px-3 text-right font-mono">{formatVal(reportData.iod?.m5_1_goiterChild)}</td>
              </tr>
              <tr>
                <td className="py-2 px-3 text-center italic border-r border-slate-200 dark:border-slate-800">5,2</td>
                <td className="py-2 px-3 pl-6 italic font-semibold border-r border-slate-200 dark:border-slate-800">Tổng số bệnh nhân được điều trị</td>
                <td className="py-2 px-3 text-right font-mono">{formatVal(reportData.iod?.m5_2_goiterTreated)}</td>
              </tr>
              <tr>
                <td className="py-2 px-3 text-center font-bold border-r border-slate-200 dark:border-slate-800">6</td>
                <td className="py-2 px-3 font-bold border-r border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white">Tổng số bệnh nhân suy giáp</td>
                <td className="py-2 px-3 text-right font-mono">{formatVal(reportData.iod?.m6_hypothyroidism)}</td>
              </tr>
              <tr>
                <td className="py-2 px-3 text-center font-bold border-r border-slate-200 dark:border-slate-800">7</td>
                <td className="py-2 px-3 font-bold border-r border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white">Tổng số bệnh nhân viêm giáp</td>
                <td className="py-2 px-3 text-right font-mono">{formatVal(reportData.iod?.m7_thyroiditis)}</td>
              </tr>
              <tr>
                <td className="py-2 px-3 text-center font-bold border-r border-slate-200 dark:border-slate-800">8</td>
                <td className="py-2 px-3 font-bold border-r border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white">Tổng số bệnh nhân Basedow</td>
                <td className="py-2 px-3 text-right font-mono">{formatVal(reportData.iod?.m8_basedow)}</td>
              </tr>
              <tr>
                <td className="py-2 px-3 text-center font-bold border-r border-slate-200 dark:border-slate-800">9</td>
                <td className="py-2 px-3 font-bold border-r border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white">Tỷ lệ % phủ muối I ốt các huyện thị báo cáo</td>
                <td className="py-2 px-3 text-right font-mono">{formatVal(reportData.iod?.m9_saltCoverageRatio)}%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
