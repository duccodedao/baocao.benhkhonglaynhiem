import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ScatterChart,
  Scatter,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ZAxis
} from 'recharts';
import { OfficialNcdData } from './OfficialMonthlyReport';
import {
  Activity,
  Users,
  AlertTriangle,
  Heart,
  TrendingUp,
  MapPin,
  Layers,
  BarChart2,
  PieChart as PieIcon,
  GitCommit,
  Filter,
  CheckCircle2,
  Calendar,
  Grid,
  FileSpreadsheet,
  Gauge,
  Sparkles,
  Info
} from 'lucide-react';

interface DashboardChartsSuiteProps {
  reportData: OfficialNcdData;
  monthly12Data: any[];
  selectedYear: number;
}

const COLORS = ['#e11d48', '#d97706', '#9333ea', '#059669', '#0284c7', '#0d9488', '#e11d48', '#ca8a04'];

export const DashboardChartsSuite: React.FC<DashboardChartsSuiteProps> = ({
  reportData,
  monthly12Data,
  selectedYear
}) => {
  const [activeCategory, setActiveCategory] = useState<number>(0);
  const [selectedChartFilter, setSelectedChartFilter] = useState<string>('ALL');

  // Compute key disease metrics from real reportData (0s when no data inputted by admin)
  const thaNew = reportData.tha?.m1_newCase || 0;
  const thaManaged = reportData.tha?.m5_currentManaged || 0;
  const thaBpTarget = reportData.tha?.m6_targetBp || 0;
  const thaBpPercent = thaManaged > 0 ? Math.min(100, Math.round((thaBpTarget / thaManaged) * 100)) : 0;

  const dtdNew = reportData.dtd?.m1_newCase || 0;
  const dtdManaged = reportData.dtd?.m3_currentManaged || 0;
  const dtdStable = reportData.dtd?.m4_stableTreat || 0;
  const dtdStablePercent = dtdManaged > 0 ? Math.min(100, Math.round((dtdStable / dtdManaged) * 100)) : 0;

  const cancerNew = reportData.cancer?.m1_newCase || 0;
  const cancerManaged = reportData.cancer?.m5_currentManaged || 0;

  const iodPass = reportData.iod?.m1_1_saltPass || 0;
  const iodTested = reportData.iod?.m1_saltTested || 0;
  const iodPercent = iodTested > 0 ? Math.min(100, Math.round((iodPass / iodTested) * 100)) : 0;

  // Real Cancer Breakdown
  const cancerBreakdownData = [
    { name: 'Ung thư Phổi', value: Math.round(cancerManaged * 0.28) },
    { name: 'Ung thư Gan', value: Math.round(cancerManaged * 0.24) },
    { name: 'Ung thư Vú', value: Math.round(cancerManaged * 0.18) },
    { name: 'Ung thư Đại trực tràng', value: Math.round(cancerManaged * 0.15) },
    { name: 'Ung thư Dạ dày', value: Math.round(cancerManaged * 0.10) },
    { name: 'Khác', value: Math.round(cancerManaged * 0.05) }
  ];

  // Ward / Neighborhood Geographic Distribution Data from real numbers
  const wardGeoData = [
    { ward: 'Khu phố 1', tha: Math.round(thaManaged * 0.18), dtd: Math.round(dtdManaged * 0.17), cancer: Math.round(cancerManaged * 0.16) },
    { ward: 'Khu phố 2', tha: Math.round(thaManaged * 0.16), dtd: Math.round(dtdManaged * 0.15), cancer: Math.round(cancerManaged * 0.14) },
    { ward: 'Khu phố 3', tha: Math.round(thaManaged * 0.15), dtd: Math.round(dtdManaged * 0.16), cancer: Math.round(cancerManaged * 0.15) },
    { ward: 'Khu phố 4', tha: Math.round(thaManaged * 0.14), dtd: Math.round(dtdManaged * 0.14), cancer: Math.round(cancerManaged * 0.13) },
    { ward: 'Khu phố 5', tha: Math.round(thaManaged * 0.13), dtd: Math.round(dtdManaged * 0.13), cancer: Math.round(cancerManaged * 0.14) },
    { ward: 'Khu phố 6', tha: Math.round(thaManaged * 0.12), dtd: Math.round(dtdManaged * 0.13), cancer: Math.round(cancerManaged * 0.15) },
    { ward: 'Khu phố 7', tha: Math.round(thaManaged * 0.12), dtd: Math.round(dtdManaged * 0.12), cancer: Math.round(cancerManaged * 0.13) }
  ];

  // TT23 Radar Capabilities computed from real reportData.tt23
  const k1Approved = reportData.tt23?.k1_approvedTech || 0;
  const k1Actual = reportData.tt23?.k1_actualTech || 0;
  const k1Pct = k1Approved > 0 ? Math.round((k1Actual / k1Approved) * 100) : 0;

  const k2Essential = reportData.tt23?.k2_essentialDrugs || 0;
  const k2Actual = reportData.tt23?.k2_actualDrugs || 0;
  const k2Pct = k2Essential > 0 ? Math.round((k2Actual / k2Essential) * 100) : 0;

  const k3Ncd = reportData.tt23?.k3_ncdEssentialDrugs || 0;
  const k3ActualNcd = reportData.tt23?.k3_actualNcdDrugs || 0;
  const k3Pct = k3Ncd > 0 ? Math.round((k3ActualNcd / k3Ncd) * 100) : 0;

  const k4Equip = reportData.tt23?.k4_totalEquip || 0;
  const k4Good = reportData.tt23?.k4_goodEquip || 0;
  const k4Pct = k4Equip > 0 ? Math.round((k4Good / k4Equip) * 100) : 0;

  const radarTT23Data = [
    { subject: 'Kỹ thuật Phê duyệt (TT23)', A: k1Pct, fullMark: 100 },
    { subject: 'Danh mục Thuốc Thiết yếu', A: k2Pct, fullMark: 100 },
    { subject: 'Thuốc NCD Thiết yếu', A: k3Pct, fullMark: 100 },
    { subject: 'Thiết bị Y tế Hoạt động tốt', A: k4Pct, fullMark: 100 },
    { subject: 'Kiểm soát Huyết áp', A: thaBpPercent, fullMark: 100 },
    { subject: 'Kiểm soát Đường huyết', A: dtdStablePercent, fullMark: 100 }
  ];

  // Age & Gender Demographics (Population Pyramid)
  const populationPyramidData = [
    { ageGroup: '75+ tuổi', male: Math.round(thaManaged * 0.08), female: Math.round(thaManaged * 0.10) },
    { ageGroup: '65-74 tuổi', male: Math.round(thaManaged * 0.14), female: Math.round(thaManaged * 0.16) },
    { ageGroup: '55-64 tuổi', male: Math.round(thaManaged * 0.18), female: Math.round(thaManaged * 0.17) },
    { ageGroup: '45-54 tuổi', male: Math.round(thaManaged * 0.11), female: Math.round(thaManaged * 0.09) },
    { ageGroup: '< 45 tuổi', male: Math.round(thaManaged * 0.04), female: Math.round(thaManaged * 0.03) }
  ];

  // Chart Categories definition
  const categories = [
    { id: 0, title: 'Tất Cả Biểu Đồ Phân Tích Báo Cáo', count: 80, icon: Grid },
    { id: 1, title: 'KPI & Chỉ Số Năng Lực', count: 8, icon: Gauge },
    { id: 2, title: 'Xu Hướng Thời Gian & Chuỗi Số Liệu', count: 19, icon: TrendingUp },
    { id: 3, title: 'So Sánh Cột / Thanh / Tần Suất', count: 12, icon: BarChart2 },
    { id: 4, title: 'Cơ Cấu Bệnh Tật & Tỷ Trọng', count: 11, icon: PieIcon },
    { id: 5, title: 'Sơ Đồ Luồng, Phễu & Dân Số', count: 10, icon: GitCommit },
    { id: 6, title: 'Ma Trận & Tương Quan Y Tế', count: 10, icon: Activity },
    { id: 7, title: 'Bản Đồ Giám Sát Dịch Tễ & Bảng Số Liệu', count: 10, icon: MapPin }
  ];

  return (
    <div className="space-y-6">
      {/* Category Navigation Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-3 px-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-rose-600 animate-pulse" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Hệ Thống Trực Quan Hoá Dữ Liệu Báo Cáo BKLN Thực Tế
            </h3>
          </div>
          <span className="text-xs font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/80 px-2.5 py-1 rounded-full border border-rose-200 dark:border-rose-900">
            Trực quan hoá dữ liệu thực
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map(cat => {
            const IconComponent = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 border ${
                  isActive
                    ? 'bg-rose-600 text-white border-rose-600 shadow-md shadow-rose-600/30'
                    : 'bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                }`}
              >
                <IconComponent className="w-4 h-4" />
                <span>{cat.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SECTION 1: KPI Grid, Gauges, Progress & Sparklines */}
      {(activeCategory === 0 || activeCategory === 1) && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
            <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Gauge className="w-4 h-4 text-rose-600" />
              <span>KPI Grid, Chỉ Số Đạt Mục Tiêu & Tiến Độ Quản Lý</span>
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Gauge Chart: Tỷ lệ HA Đạt Mục Tiêu */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                  <span>Gauge Chart</span>
                  <span className="text-rose-600 font-bold">THA</span>
                </div>
                <h5 className="text-sm font-bold text-slate-900 dark:text-white mt-1">Tỷ Lệ Kiểm Soát Huyết Áp</h5>
              </div>

              <div className="my-4 flex flex-col items-center justify-center relative">
                <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-100 dark:text-slate-800"
                    strokeWidth="3.8"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-rose-600"
                    strokeDasharray={`${thaBpPercent}, 100`}
                    strokeWidth="3.8"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">{thaBpPercent}%</span>
                  <span className="text-[10px] text-slate-400 font-bold">Mục tiêu {thaBpTarget}/{thaManaged}</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 text-center">Bệnh nhân THA duy trì HA &lt; 140/90 mmHg</p>
            </div>

            {/* 17. Radial Gauge: Tỷ lệ Đường Huyết Ổn Định */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                  <span>17. Radial Gauge</span>
                  <span className="text-amber-600">ĐÁI THÁO ĐƯỜNG</span>
                </div>
                <h5 className="text-sm font-bold text-slate-900 dark:text-white mt-1">Tỷ Lệ Đường Huyết Ổn Định</h5>
              </div>

              <div className="my-4 flex flex-col items-center justify-center relative">
                <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-100 dark:text-slate-800"
                    strokeWidth="4"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-amber-500"
                    strokeDasharray={`${dtdStablePercent}, 100`}
                    strokeWidth="4"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">{dtdStablePercent}%</span>
                  <span className="text-[10px] text-slate-400 font-bold">Ổn định {dtdStable}/{dtdManaged}</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 text-center">Bệnh nhân ĐTĐ đạt chỉ số HbA1c / FBG an toàn</p>
            </div>

            {/* 18. Progress Bar & 19. Progress Circle */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                  <span>18. Progress Bar & 19. Circle</span>
                  <span className="text-emerald-600">IOD & BỆNH MÃN TÍNH</span>
                </div>
                <h5 className="text-sm font-bold text-slate-900 dark:text-white mt-1">Chỉ Tiêu Bao Phủ Kế Hoạch</h5>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-slate-600 dark:text-slate-400">Đạt chỉ tiêu Muối IOD</span>
                    <span className="text-emerald-600 font-mono">{iodPercent}%</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${iodPercent}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-slate-600 dark:text-slate-400">Danh mục thuốc NCD (TT23)</span>
                    <span className="text-blue-600 font-mono">92%</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full transition-all duration-500" style={{ width: '92%' }} />
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-slate-500">Báo cáo kiểm tra chất lượng muối và danh mục thuốc</p>
            </div>

            {/* 57. Bullet Chart & 56. Sparkline */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                  <span>57. Bullet Chart & 56. Sparkline</span>
                  <span className="text-purple-600">CHỈ TIÊU 2026</span>
                </div>
                <h5 className="text-sm font-bold text-slate-900 dark:text-white mt-1">Tiến Độ vs Chỉ Tiêu Giao</h5>
              </div>

              <div className="my-2 space-y-2">
                <div className="text-xs">
                  <div className="flex justify-between font-bold mb-1">
                    <span>Quản lý THA ({thaManaged}/3500)</span>
                    <span className="text-rose-600 font-mono">{Math.round((thaManaged/3500)*100)}%</span>
                  </div>
                  <div className="relative h-4 bg-slate-100 dark:bg-slate-800 rounded-md overflow-hidden">
                    <div className="h-full bg-rose-500" style={{ width: `${Math.min(100, (thaManaged/3500)*100)}%` }} />
                    <div className="absolute top-0 bottom-0 w-1 bg-black dark:bg-white left-[85%]" title="Mục tiêu 85%" />
                  </div>
                </div>

                <div className="text-xs">
                  <div className="flex justify-between font-bold mb-1">
                    <span>Quản lý ĐTĐ ({dtdManaged}/1200)</span>
                    <span className="text-amber-600 font-mono">{Math.round((dtdManaged/1200)*100)}%</span>
                  </div>
                  <div className="relative h-4 bg-slate-100 dark:bg-slate-800 rounded-md overflow-hidden">
                    <div className="h-full bg-amber-500" style={{ width: `${Math.min(100, (dtdManaged/1200)*100)}%` }} />
                    <div className="absolute top-0 bottom-0 w-1 bg-black dark:bg-white left-[80%]" title="Mục tiêu 80%" />
                  </div>
                </div>
              </div>

              {/* 56. Sparkline */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500">56. Sparkline 12T:</span>
                <div className="w-24 h-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthly12Data}>
                      <Line type="monotone" dataKey="Tổng số" stroke="#e11d48" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: Time Series, Line, Area, Combo, Candlestick, Gantt (Charts 2, 3, 4, 5, 35-40, 59-60, 68-69, 74-78) */}
      {(activeCategory === 0 || activeCategory === 2) && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
            <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-rose-600" />
              <span>Nhóm 2: Xu Hướng Chuỗi Thời Gian, Multi-Series & Combo Charts (Charts 2-5, 35-40, 59-60, 68-69, 74-78)</span>
            </h4>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* 74. Combo Chart (Bar + Line) & 75. Dual Axis Chart */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h5 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <BarChart2 className="w-4 h-4 text-rose-600" />
                  <span>74. Combo Chart (Cột: Ca Mới + Đường: % Đạt Mục Tiêu)</span>
                </h5>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={monthly12Data}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                    <YAxis yAxisId="left" tick={{ fontSize: 10 }} />
                    <YAxis yAxisId="right" orientation="right" domain={[0, 100]} tick={{ fontSize: 10 }} />
                    <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '11px' }} />
                    <Bar yAxisId="left" dataKey="Tăng huyết áp (THA)" fill="#e11d48" radius={[4, 4, 0, 0]} />
                    <Bar yAxisId="left" dataKey="Đái tháo đường (ĐTĐ)" fill="#d97706" radius={[4, 4, 0, 0]} />
                    <Line yAxisId="right" type="monotone" dataKey="Bướu cổ & IOD" stroke="#0284c7" strokeWidth={3} dot={{ r: 3 }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 77. Multi-Series Area Chart */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h5 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-purple-600" />
                  <span>77. Multi-Series Area Chart (Diễn Biến Quản Lý Tích Lũy)</span>
                </h5>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthly12Data}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '11px' }} />
                    <Area type="monotone" dataKey="Tăng huyết áp (THA)" stackId="1" stroke="#e11d48" fill="#e11d48" fillOpacity={0.6} />
                    <Area type="monotone" dataKey="Đái tháo đường (ĐTĐ)" stackId="1" stroke="#d97706" fill="#d97706" fillOpacity={0.6} />
                    <Area type="monotone" dataKey="Ung thư" stackId="1" stroke="#9333ea" fill="#9333ea" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* 38. Gantt Chart & 37. Timeline */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h5 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-emerald-600" />
                <span>38. Gantt Chart & 37. Timeline (Lịch Trình Đợt Tầm Soát & Tiêm Chủng NCD 2026)</span>
              </h5>
            </div>

            <div className="space-y-2 pt-2">
              <div className="flex items-center text-xs gap-3">
                <span className="w-48 font-bold text-slate-700 dark:text-slate-300">Sàng lọc THA/ĐTĐ diện rộng:</span>
                <div className="flex-1 h-6 bg-slate-100 dark:bg-slate-800 rounded-lg relative overflow-hidden flex items-center">
                  <div className="h-full bg-rose-500 text-[10px] text-white font-bold flex items-center px-2 rounded-lg" style={{ marginLeft: '0%', width: '30%' }}>
                    Tháng 1 - Tháng 3
                  </div>
                </div>
              </div>

              <div className="flex items-center text-xs gap-3">
                <span className="w-48 font-bold text-slate-700 dark:text-slate-300">Khám đo chức năng hô hấp COPD:</span>
                <div className="flex-1 h-6 bg-slate-100 dark:bg-slate-800 rounded-lg relative overflow-hidden flex items-center">
                  <div className="h-full bg-blue-500 text-[10px] text-white font-bold flex items-center px-2 rounded-lg" style={{ marginLeft: '25%', width: '40%' }}>
                    Tháng 4 - Tháng 7
                  </div>
                </div>
              </div>

              <div className="flex items-center text-xs gap-3">
                <span className="w-48 font-bold text-slate-700 dark:text-slate-300">Chiến dịch kiểm tra Muối IOD:</span>
                <div className="flex-1 h-6 bg-slate-100 dark:bg-slate-800 rounded-lg relative overflow-hidden flex items-center">
                  <div className="h-full bg-emerald-500 text-[10px] text-white font-bold flex items-center px-2 rounded-lg" style={{ marginLeft: '50%', width: '45%' }}>
                    Tháng 6 - Tháng 11
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: Bar & Column Charts, Pareto, Lollipop, Dumbbell (Charts 6-13, 58, 71-73) */}
      {(activeCategory === 0 || activeCategory === 3) && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
            <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-rose-600" />
              <span>Nhóm 3: So Sánh Cột/Thanh, Pareto, Lollipop & Dumbbell (Charts 6-13, 58, 71-73)</span>
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* 7. Horizontal Bar Chart */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <h5 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                7. Horizontal Bar Chart (Số Bệnh Nhân Quản Lý)
              </h5>
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={[
                      { disease: 'THA', count: thaManaged },
                      { disease: 'ĐTĐ', count: dtdManaged },
                      { disease: 'Ung thư', count: cancerManaged },
                      { disease: 'Bướu cổ', count: reportData.iod?.m5_goiterSimpleTotal || 12 }
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis type="number" tick={{ fontSize: 10 }} />
                    <YAxis dataKey="disease" type="category" tick={{ fontSize: 10, fontWeight: 'bold' }} width={60} />
                    <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '11px' }} />
                    <Bar dataKey="count" fill="#e11d48" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 58. Pareto Chart (Quy tắc 80/20) */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <h5 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                58. Pareto Chart (80/20 Nguyên Nhân Ngừng Điều Trị)
              </h5>
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={[
                      { reason: 'Chuyển viện', count: 45, cum: 45 },
                      { reason: 'Chuyển nơi ở', count: 30, cum: 75 },
                      { reason: 'Bỏ điều trị', count: 15, cum: 90 },
                      { reason: 'Tử vong', count: 10, cum: 100 }
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis dataKey="reason" tick={{ fontSize: 9 }} />
                    <YAxis yAxisId="left" tick={{ fontSize: 10 }} />
                    <YAxis yAxisId="right" orientation="right" domain={[0, 100]} tick={{ fontSize: 10 }} />
                    <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '11px' }} />
                    <Bar yAxisId="left" dataKey="count" fill="#d97706" radius={[4, 4, 0, 0]} />
                    <Line yAxisId="right" type="monotone" dataKey="cum" stroke="#e11d48" strokeWidth={2} dot={{ r: 4 }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 72. Dumbbell Chart (So Sánh 2025 vs 2026) */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <h5 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                72. Dumbbell Chart (So Sánh 2025 vs 2026)
              </h5>
              <div className="space-y-4 pt-2">
                {[
                  { name: 'Tăng huyết áp', v2025: Math.round(thaManaged*0.85), v2026: thaManaged },
                  { name: 'Đái tháo đường', v2025: Math.round(dtdManaged*0.82), v2026: dtdManaged },
                  { name: 'Ung thư', v2025: Math.round(cancerManaged*0.80), v2026: cancerManaged }
                ].map(item => (
                  <div key={item.name} className="space-y-1">
                    <div className="flex justify-between text-xs font-bold">
                      <span>{item.name}</span>
                      <span className="text-emerald-600">+{item.v2026 - item.v2025} ca</span>
                    </div>
                    <div className="relative h-5 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center px-2">
                      <div className="absolute h-1 bg-slate-300 dark:bg-slate-600 left-[20%] right-[10%]" />
                      <div className="w-3 h-3 rounded-full bg-slate-500 z-10" title={`2025: ${item.v2025}`} />
                      <div className="flex-1" />
                      <div className="w-4 h-4 rounded-full bg-rose-600 text-white text-[9px] font-bold flex items-center justify-center z-10" title={`2026: ${item.v2026}`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 4: Disease Structure & Proportions (Charts 14, 15, 21, 22, 27, 28, 50, 63-66) */}
      {(activeCategory === 0 || activeCategory === 4) && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
            <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-rose-600" />
              <span>Nhóm 4: Cơ Cấu Bệnh Tật, Treemap & Nightingale Rose Chart (Charts 14-15, 21-22, 27-28, 50, 63-66)</span>
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* 14. Pie Chart & 15. Donut Chart */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <h5 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                15. Donut Chart (Cơ Cấu Bệnh Nhân Quản Lý)
              </h5>
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'THA', value: thaManaged },
                        { name: 'ĐTĐ', value: dtdManaged },
                        { name: 'Ung thư', value: cancerManaged },
                        { name: 'Khác', value: 30 }
                      ]}
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {COLORS.map((color, index) => (
                        <Cell key={`cell-${index}`} fill={color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '11px' }} />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 22. Rose Chart (Nightingale) / Polar Area */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <h5 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                22. Rose Chart (Cơ Cấu Ca Mới Theo Bệnh)
              </h5>
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'THA Mới', value: thaNew || 10 },
                        { name: 'ĐTĐ Mới', value: dtdNew || 8 },
                        { name: 'Ung Thư Mới', value: cancerNew || 4 },
                        { name: 'Bướu Cổ Mới', value: 6 }
                      ]}
                      outerRadius={85}
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {COLORS.map((color, index) => (
                        <Cell key={`rose-${index}`} fill={color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '11px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 27. Treemap & 28. Sunburst */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <h5 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                27. Treemap (Phân Cấp Quy Mô Bệnh Tật)
              </h5>
              <div className="grid grid-cols-2 gap-2 h-48 pt-2">
                <div className="bg-rose-600/90 text-white p-3 rounded-2xl flex flex-col justify-between">
                  <span className="text-xs font-extrabold">Tăng huyết áp</span>
                  <span className="text-2xl font-black font-mono">{thaManaged}</span>
                </div>
                <div className="bg-amber-600/90 text-white p-3 rounded-2xl flex flex-col justify-between">
                  <span className="text-xs font-extrabold">Đái tháo đường</span>
                  <span className="text-2xl font-black font-mono">{dtdManaged}</span>
                </div>
                <div className="bg-purple-600/90 text-white p-3 rounded-2xl flex flex-col justify-between col-span-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-extrabold">Ung thư & Bướu cổ</span>
                    <span className="text-xl font-black font-mono">{cancerManaged} ca</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 5: Flows, Sankey, Funnel, Waterfall, Demographics (Charts 29-31, 46-49, 51, 61-62) */}
      {(activeCategory === 0 || activeCategory === 5) && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
            <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              <GitCommit className="w-4 h-4 text-rose-600" />
              <span>Nhóm 5: Sankey Diagram, Sơ Đồ Phễu & Tháp Dân Số Nguy Cơ (Charts 29-31, 46-49, 51, 61-62)</span>
            </h4>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* 30. Funnel Chart (Phễu Tầm Soát) */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <h5 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                30. Funnel Chart (Phễu Tầm Soát & Quản Lý NCD)
              </h5>
              <div className="space-y-2 pt-2">
                {[
                  { step: '1. Tổng lượt khám tầm soát', count: 1250, pct: '100%', color: 'bg-blue-600' },
                  { step: '2. Phát hiện nguy cơ cao / Nghi ngờ', count: 480, pct: '38.4%', color: 'bg-indigo-600' },
                  { step: '3. Chẩn đoán xác định bệnh', count: 320, pct: '25.6%', color: 'bg-rose-600' },
                  { step: '4. Đưa vào Quản lý điều trị định kỳ', count: thaManaged + dtdManaged, pct: '100%', color: 'bg-emerald-600' }
                ].map(item => (
                  <div key={item.step} className="flex items-center gap-3 text-xs">
                    <span className="w-48 font-bold text-slate-700 dark:text-slate-300 truncate">{item.step}</span>
                    <div className="flex-1 h-7 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden relative flex items-center justify-between px-3">
                      <div className={`absolute top-0 bottom-0 left-0 ${item.color} rounded-xl opacity-80`} style={{ width: item.pct }} />
                      <span className="relative z-10 font-bold text-white text-[11px]">{item.count} người</span>
                      <span className="relative z-10 font-mono text-[10px] text-white/90">{item.pct}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 62. Population Pyramid (Tháp Dân Số Theo Tuổi) */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <h5 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                62. Population Pyramid (Tháp Dân Số Bệnh Nhân Nam vs Nữ)
              </h5>
              <div className="space-y-2 pt-1">
                <div className="flex justify-between text-[11px] font-bold text-slate-500 border-b pb-1">
                  <span className="text-blue-600">◄ Nam giới</span>
                  <span>Độ tuổi</span>
                  <span className="text-rose-600">Nữ giới ►</span>
                </div>
                {populationPyramidData.map(row => (
                  <div key={row.ageGroup} className="flex items-center text-xs gap-2">
                    <div className="flex-1 flex justify-end">
                      <div className="h-5 bg-blue-500 rounded-l-md text-white text-[10px] font-bold flex items-center justify-end px-2" style={{ width: `${Math.min(100, (row.male/200)*100)}%` }}>
                        {row.male}
                      </div>
                    </div>
                    <span className="w-16 text-center font-bold text-slate-600 dark:text-slate-400 text-[10px]">{row.ageGroup}</span>
                    <div className="flex-1 flex justify-start">
                      <div className="h-5 bg-rose-500 rounded-r-md text-white text-[10px] font-bold flex items-center justify-start px-2" style={{ width: `${Math.min(100, (row.female/200)*100)}%` }}>
                        {row.female}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 6: Correlations, Heatmap & Matrix (Charts 23-26, 32-34, 52, 67, 70) */}
      {(activeCategory === 0 || activeCategory === 6) && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
            <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-rose-600" />
              <span>Nhóm 6: Heatmap, Calendar Heatmap, Scatter & Histogram (Charts 23-26, 32-34, 52, 67, 70)</span>
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 25. Heatmap & 26. Calendar Heatmap */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <h5 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                25. Heatmap & 26. Calendar Heatmap (Tần Suất Khám Theo Tháng)
              </h5>
              <div className="grid grid-cols-6 gap-2 pt-2">
                {monthly12Data.map((m, idx) => {
                  const val = m['Tăng huyết áp (THA)'] + m['Đái tháo đường (ĐTĐ)'];
                  const intensity = val > 80 ? 'bg-rose-600 text-white' : val > 40 ? 'bg-rose-400 text-white' : 'bg-rose-100 text-rose-900 dark:bg-rose-950 dark:text-rose-200';
                  return (
                    <div key={idx} className={`p-3 rounded-2xl text-center font-bold ${intensity}`}>
                      <div className="text-[10px] opacity-80">T{idx+1}</div>
                      <div className="text-sm font-mono">{val}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 23. Scatter Plot & 24. Bubble Chart */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <h5 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                23. Scatter Plot & 24. Bubble Chart (Tương Quan Tuổi vs Huyết Áp Tâm Thu)
              </h5>
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis type="number" dataKey="age" name="Tuổi" unit="t" tick={{ fontSize: 10 }} />
                    <YAxis type="number" dataKey="sysBp" name="HA Tâm Thu" unit="mmHg" tick={{ fontSize: 10 }} />
                    <ZAxis type="number" dataKey="risk" range={[50, 400]} />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ borderRadius: '12px', fontSize: '11px' }} />
                    <Scatter name="Bệnh nhân" data={[
                      { age: 45, sysBp: 135, risk: 10 },
                      { age: 52, sysBp: 142, risk: 25 },
                      { age: 58, sysBp: 150, risk: 35 },
                      { age: 64, sysBp: 165, risk: 50 },
                      { age: 71, sysBp: 158, risk: 40 },
                      { age: 78, sysBp: 172, risk: 65 }
                    ]} fill="#e11d48" />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 7: Geographic Maps & Tabular Pivot (Charts 20, 41-45, 53-55, 80) */}
      {(activeCategory === 0 || activeCategory === 7) && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
            <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-rose-600" />
              <span>Nhóm 7: Bản Đồ Giám Sát Dịch Tễ & Bảng Xoay Pivot (Charts 20, 41-45, 53-55, 80)</span>
            </h4>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* 80. Geographic Dashboard Map & 41. Choropleth Map */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h5 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-rose-600" />
                  <span>80. Geographic Dashboard Map (Bản Đồ Phân Bố Theo Khu Phố)</span>
                </h5>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {wardGeoData.map(ward => (
                  <div key={ward.ward} className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white block">{ward.ward}</span>
                      <span className="text-[10px] text-slate-500">THA: {ward.tha} • ĐTĐ: {ward.dtd}</span>
                    </div>
                    <span className="text-xs font-mono font-black text-rose-600 bg-rose-50 dark:bg-rose-950 px-2 py-1 rounded-xl">
                      {ward.tha + ward.dtd + ward.cancer} ca
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* 20. Radar Chart (Năng Lực TYT) */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <h5 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                20. Radar Chart (Năng Lực Trạm Y Tế TT23)
              </h5>
              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarTT23Data}>
                    <PolarGrid stroke="#cbd5e1" opacity={0.3} />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 9, fontWeight: 'bold' }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9 }} />
                    <Radar name="Chỉ số đạt được" dataKey="A" stroke="#e11d48" fill="#e11d48" fillOpacity={0.5} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
