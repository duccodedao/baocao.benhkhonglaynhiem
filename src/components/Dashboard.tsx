import React, { useState, useMemo, useEffect } from 'react';
import { TabType } from './Sidebar';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';
import {
  FileText,
  Users,
  Activity,
  AlertTriangle,
  TrendingUp,
  Calendar,
  Filter,
  BarChart3,
  Stethoscope,
  ChevronRight
} from 'lucide-react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { OfficialNcdData, createEmptyOfficialReport } from './OfficialMonthlyReport';
import { OfficialReportTableView } from './OfficialReportTableView';

interface DashboardProps {
  setActiveTab: (tab: TabType) => void;
  onSelectReportDetail: (reportId: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ setActiveTab, onSelectReportDetail }) => {
  const [reports, setReports] = useState<OfficialNcdData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedMonth, setSelectedMonth] = useState<number | 'ALL'>('ALL'); // 'ALL' or 1..12
  const [activeMetric, setActiveMetric] = useState<'NEW' | 'DEATH' | 'MANAGED'>('NEW');

  // 1. Setup real-time listener to officialNcdReports
  useEffect(() => {
    const colRef = collection(db, 'officialNcdReports');
    const unsubscribe = onSnapshot(colRef, (snapshot) => {
      const data: OfficialNcdData[] = [];
      snapshot.forEach(doc => {
        data.push(doc.data() as OfficialNcdData);
      });
      setReports(data);
      setLoading(false);
    }, (err) => {
      console.error('Error fetching reports realtime:', err);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Filter reports by selected year (excluding quarterly saved reports)
  const yearMonthlyReports = useMemo(() => {
    return reports.filter(r => r.year === selectedYear && r.id && !r.id.includes('_q_'));
  }, [reports, selectedYear]);

  // Aggregate Metrics for Selected View (Year or Month)
  const aggregatedStats = useMemo(() => {
    const relevantReports = selectedMonth === 'ALL'
      ? yearMonthlyReports
      : yearMonthlyReports.filter(r => r.month === selectedMonth);

    let totalNew = 0;
    let totalDeath = 0;
    let totalStop = 0;
    let maxManaged = 0;

    relevantReports.forEach(rep => {
      totalNew += (rep.tha?.m1_newCase || 0) + (rep.dtd?.m1_newCase || 0) + (rep.cancer?.m1_newCase || 0);
      totalDeath += (rep.tha?.m3_death || 0) + (rep.dtd?.m5_death || 0) + (rep.cancer?.m3_death || 0);
      totalStop += (rep.tha?.m4_stopTreat || 0) + (rep.dtd?.m6_stopTreat || 0) + (rep.cancer?.m4_stopTreat || 0);
    });

    if (selectedMonth !== 'ALL') {
      const activeMonthReport = yearMonthlyReports.find(r => r.month === selectedMonth);
      if (activeMonthReport) {
        maxManaged = (activeMonthReport.tha?.m5_currentManaged || 0) + 
                     (activeMonthReport.dtd?.m3_currentManaged || 0) + 
                     (activeMonthReport.cancer?.m5_currentManaged || 0);
      }
    } else if (yearMonthlyReports.length > 0) {
      // Find the latest month that has data
      const sorted = [...yearMonthlyReports].sort((a, b) => b.month - a.month);
      if (sorted[0]) {
        maxManaged = (sorted[0].tha?.m5_currentManaged || 0) + 
                     (sorted[0].dtd?.m3_currentManaged || 0) + 
                     (sorted[0].cancer?.m5_currentManaged || 0);
      }
    }

    return {
      totalNew,
      totalDeath,
      totalStop,
      maxManaged
    };
  }, [yearMonthlyReports, selectedMonth]);

  // 12-Month Trend Chart Data for the selected year
  const monthly12TrendData = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const monthNum = i + 1;
      const rep = yearMonthlyReports.find(r => r.month === monthNum);

      let thaVal = 0;
      let dtdVal = 0;
      let cancerVal = 0;
      let copdVal = 0;
      let henVal = 0;
      let iodVal = 0;

      if (activeMetric === 'NEW') {
        thaVal = rep?.tha?.m1_newCase || 0;
        dtdVal = rep?.dtd?.m1_newCase || 0;
        cancerVal = rep?.cancer?.m1_newCase || 0;
        copdVal = (rep as any)?.copd?.m1_newCase || 0;
        henVal = (rep as any)?.asthma?.m1_newCase || 0;
        iodVal = (rep?.iod?.m6_hypothyroidism || 0) + (rep?.iod?.m7_thyroiditis || 0) + (rep?.iod?.m8_basedow || 0) || 0;
      } else if (activeMetric === 'DEATH') {
        thaVal = rep?.tha?.m3_death || 0;
        dtdVal = rep?.dtd?.m5_death || 0;
        cancerVal = rep?.cancer?.m3_death || 0;
        copdVal = (rep as any)?.copd?.m2_death || 0;
        henVal = (rep as any)?.asthma?.m2_death || 0;
        iodVal = 0;
      } else { // MANAGED
        thaVal = rep?.tha?.m5_currentManaged || 0;
        dtdVal = rep?.dtd?.m3_currentManaged || 0;
        cancerVal = rep?.cancer?.m5_currentManaged || 0;
        copdVal = (rep as any)?.copd?.m3_currentManaged || 0;
        henVal = (rep as any)?.asthma?.m3_currentManaged || 0;
        iodVal = rep?.iod?.m5_goiterSimpleTotal || 0;
      }

      const totalVal = thaVal + dtdVal + cancerVal + copdVal + henVal + iodVal;

      return {
        month: `Tháng ${monthNum}`,
        monthNum,
        'Tăng huyết áp (THA)': thaVal,
        'Đái tháo đường (ĐTĐ)': dtdVal,
        'Ung thư': cancerVal,
        'COPD': copdVal,
        'Hen': henVal,
        'Bướu cổ & IOD': iodVal,
        'Tổng số': totalVal
      };
    });
  }, [yearMonthlyReports, activeMetric]);

  // Aggregate or load report to render under the official template
  const dashboardReportData = useMemo<OfficialNcdData>(() => {
    if (selectedMonth === 'ALL') {
      const base = createEmptyOfficialReport(12, selectedYear, 'TRẠM Y TẾ PHƯỜNG HIỆP THÀNH');
      base.reportDate = `Cộng dồn cả năm ${selectedYear}`;
      
      const sorted = [...yearMonthlyReports].sort((a, b) => a.month - b.month);
      if (sorted.length === 0) return base;
      
      base.unitName = sorted[0].unitName || 'TRẠM Y TẾ PHƯỜNG HIỆP THÀNH';

      const sumField = (section: 'tha' | 'dtd' | 'cancer' | 'iod', field: string) => {
        return sorted.reduce((sum, r) => {
          const val = (r[section] as any)?.[field];
          return sum + (typeof val === 'number' ? val : 0);
        }, 0);
      };

      const latestValue = (section: 'tha' | 'dtd' | 'cancer' | 'iod', field: string) => {
        for (let i = sorted.length - 1; i >= 0; i--) {
          const val = (sorted[i][section] as any)?.[field];
          if (val !== undefined && val !== null) return val;
        }
        return 0;
      };

      const compText = (curr: number, prev: number) => {
        const diff = curr - prev;
        if (diff > 0) return `Tăng +${diff.toLocaleString('vi-VN')}`;
        if (diff < 0) return `Giảm ${diff.toLocaleString('vi-VN')}`;
        return 'Không';
      };

      // 1. THA
      base.tha.m1_newCase = sumField('tha', 'm1_newCase');
      base.tha.m1_newCase_cum = latestValue('tha', 'm1_newCase_cum') || base.tha.m1_newCase;
      base.tha.m1_newCase_prevYear = sumField('tha', 'm1_newCase_prevYear');
      base.tha.m1_newCase_comp = compText(base.tha.m1_newCase, base.tha.m1_newCase_prevYear);

      base.tha.m2_reTreat = sumField('tha', 'm2_reTreat');
      base.tha.m2_reTreat_cum = latestValue('tha', 'm2_reTreat_cum') || base.tha.m2_reTreat;
      base.tha.m2_reTreat_prevYear = sumField('tha', 'm2_reTreat_prevYear');
      base.tha.m2_reTreat_comp = compText(base.tha.m2_reTreat, base.tha.m2_reTreat_prevYear);

      base.tha.m3_death = sumField('tha', 'm3_death');
      base.tha.m3_death_cum = latestValue('tha', 'm3_death_cum') || base.tha.m3_death;
      base.tha.m3_death_prevYear = sumField('tha', 'm3_death_prevYear');
      base.tha.m3_death_comp = compText(base.tha.m3_death, base.tha.m3_death_prevYear);

      base.tha.m4_stopTreat = sumField('tha', 'm4_stopTreat');
      base.tha.m4_stopTreat_cum = latestValue('tha', 'm4_stopTreat_cum') || base.tha.m4_stopTreat;
      base.tha.m4_stopTreat_prevYear = sumField('tha', 'm4_stopTreat_prevYear');
      base.tha.m4_stopTreat_comp = compText(base.tha.m4_stopTreat, base.tha.m4_stopTreat_prevYear);

      base.tha.m5_currentManaged = latestValue('tha', 'm5_currentManaged');
      base.tha.m5_currentManaged_prevYear = latestValue('tha', 'm5_currentManaged_prevYear');
      base.tha.m5_currentManaged_comp = compText(base.tha.m5_currentManaged, base.tha.m5_currentManaged_prevYear);

      base.tha.m6_targetBp = latestValue('tha', 'm6_targetBp');
      base.tha.m6_targetBp_prevYear = latestValue('tha', 'm6_targetBp_prevYear');
      base.tha.m6_targetBp_comp = compText(base.tha.m6_targetBp, base.tha.m6_targetBp_prevYear);

      // 2. DTD
      base.dtd.m1_newCase = sumField('dtd', 'm1_newCase');
      base.dtd.m1_newCase_cum = latestValue('dtd', 'm1_newCase_cum') || base.dtd.m1_newCase;
      base.dtd.m1_newCase_prevYear = sumField('dtd', 'm1_newCase_prevYear');
      base.dtd.m1_newCase_comp = compText(base.dtd.m1_newCase, base.dtd.m1_newCase_prevYear);

      base.dtd.m2_reTreat = sumField('dtd', 'm2_reTreat');
      base.dtd.m2_reTreat_cum = latestValue('dtd', 'm2_reTreat_cum') || base.dtd.m2_reTreat;
      base.dtd.m2_reTreat_prevYear = sumField('dtd', 'm2_reTreat_prevYear');
      base.dtd.m2_reTreat_comp = compText(base.dtd.m2_reTreat, base.dtd.m2_reTreat_prevYear);

      base.dtd.m3_currentManaged = latestValue('dtd', 'm3_currentManaged');
      base.dtd.m3_currentManaged_prevYear = latestValue('dtd', 'm3_currentManaged_prevYear');
      base.dtd.m3_currentManaged_comp = compText(base.dtd.m3_currentManaged, base.dtd.m3_currentManaged_prevYear);

      base.dtd.m4_stableTreat = latestValue('dtd', 'm4_stableTreat');
      base.dtd.m4_stableTreat_prevYear = latestValue('dtd', 'm4_stableTreat_prevYear');
      base.dtd.m4_stableTreat_comp = compText(base.dtd.m4_stableTreat, base.dtd.m4_stableTreat_prevYear);

      base.dtd.m5_death = sumField('dtd', 'm5_death');
      base.dtd.m5_death_cum = latestValue('dtd', 'm5_death_cum') || base.dtd.m5_death;
      base.dtd.m5_death_prevYear = sumField('dtd', 'm5_death_prevYear');
      base.dtd.m5_death_comp = compText(base.dtd.m5_death, base.dtd.m5_death_prevYear);

      base.dtd.m6_stopTreat = sumField('dtd', 'm6_stopTreat');
      base.dtd.m6_stopTreat_cum = latestValue('dtd', 'm6_stopTreat_cum') || base.dtd.m6_stopTreat;
      base.dtd.m6_stopTreat_prevYear = sumField('dtd', 'm6_stopTreat_prevYear');
      base.dtd.m6_stopTreat_comp = compText(base.dtd.m6_stopTreat, base.dtd.m6_stopTreat_prevYear);

      base.dtd.m7_prediabetesNew = sumField('dtd', 'm7_prediabetesNew');
      base.dtd.m7_prediabetesNew_cum = latestValue('dtd', 'm7_prediabetesNew_cum') || base.dtd.m7_prediabetesNew;
      base.dtd.m7_prediabetesNew_prevYear = sumField('dtd', 'm7_prediabetesNew_prevYear');
      base.dtd.m7_prediabetesNew_comp = compText(base.dtd.m7_prediabetesNew, base.dtd.m7_prediabetesNew_prevYear);

      base.dtd.m8_prediabetesManaged = latestValue('dtd', 'm8_prediabetesManaged');
      base.dtd.m8_prediabetesManaged_prevYear = latestValue('dtd', 'm8_prediabetesManaged_prevYear');
      base.dtd.m8_prediabetesManaged_comp = compText(base.dtd.m8_prediabetesManaged, base.dtd.m8_prediabetesManaged_prevYear);

      // 3. Cancer
      base.cancer.m1_newCase = sumField('cancer', 'm1_newCase');
      base.cancer.m1_newCase_cum = latestValue('cancer', 'm1_newCase_cum') || base.cancer.m1_newCase;
      base.cancer.m1_newCase_prevYear = sumField('cancer', 'm1_newCase_prevYear');
      base.cancer.m1_newCase_comp = compText(base.cancer.m1_newCase, base.cancer.m1_newCase_prevYear);

      base.cancer.m2_reTreat = sumField('cancer', 'm2_reTreat');
      base.cancer.m2_reTreat_cum = latestValue('cancer', 'm2_reTreat_cum') || base.cancer.m2_reTreat;
      base.cancer.m2_reTreat_prevYear = sumField('cancer', 'm2_reTreat_prevYear');
      base.cancer.m2_reTreat_comp = compText(base.cancer.m2_reTreat, base.cancer.m2_reTreat_prevYear);

      base.cancer.m3_death = sumField('cancer', 'm3_death');
      base.cancer.m3_death_cum = latestValue('cancer', 'm3_death_cum') || base.cancer.m3_death;
      base.cancer.m3_death_prevYear = sumField('cancer', 'm3_death_prevYear');
      base.cancer.m3_death_comp = compText(base.cancer.m3_death, base.cancer.m3_death_prevYear);

      base.cancer.m4_stopTreat = sumField('cancer', 'm4_stopTreat');
      base.cancer.m4_stopTreat_cum = latestValue('cancer', 'm4_stopTreat_cum') || base.cancer.m4_stopTreat;
      base.cancer.m4_stopTreat_prevYear = sumField('cancer', 'm4_stopTreat_prevYear');
      base.cancer.m4_stopTreat_comp = compText(base.cancer.m4_stopTreat, base.cancer.m4_stopTreat_prevYear);

      base.cancer.m5_currentManaged = latestValue('cancer', 'm5_currentManaged');
      base.cancer.m5_currentManaged_prevYear = latestValue('cancer', 'm5_currentManaged_prevYear');
      base.cancer.m5_currentManaged_comp = compText(base.cancer.m5_currentManaged, base.cancer.m5_currentManaged_prevYear);

      // 4. IOD
      base.iod.m1_saltTested = sumField('iod', 'm1_saltTested');
      base.iod.m1_saltTested_cum = latestValue('iod', 'm1_saltTested_cum') || base.iod.m1_saltTested;
      base.iod.m1_saltTested_prevYear = sumField('iod', 'm1_saltTested_prevYear');
      base.iod.m1_saltTested_comp = compText(base.iod.m1_saltTested, base.iod.m1_saltTested_prevYear);

      base.iod.m1_1_saltPass = sumField('iod', 'm1_1_saltPass');
      base.iod.m1_1_saltPass_cum = latestValue('iod', 'm1_1_saltPass_cum') || base.iod.m1_1_saltPass;
      base.iod.m1_1_saltPass_prevYear = sumField('iod', 'm1_1_saltPass_prevYear');
      base.iod.m1_1_saltPass_comp = compText(base.iod.m1_1_saltPass, base.iod.m1_1_saltPass_prevYear);

      base.iod.m1_2_saltFail = sumField('iod', 'm1_2_saltFail');
      base.iod.m1_2_saltFail_cum = latestValue('iod', 'm1_2_saltFail_cum') || base.iod.m1_2_saltFail;
      base.iod.m1_2_saltFail_prevYear = sumField('iod', 'm1_2_saltFail_prevYear');
      base.iod.m1_2_saltFail_comp = compText(base.iod.m1_2_saltFail, base.iod.m1_2_saltFail_prevYear);

      base.iod.m2_householdRatio = latestValue('iod', 'm2_householdRatio');
      base.iod.m2_householdRatio_prevYear = latestValue('iod', 'm2_householdRatio_prevYear');
      base.iod.m2_householdRatio_comp = compText(base.iod.m2_householdRatio, base.iod.m2_householdRatio_prevYear);

      base.iod.m3_goiterChildRatio = latestValue('iod', 'm3_goiterChildRatio');
      base.iod.m3_goiterChildRatio_prevYear = latestValue('iod', 'm3_goiterChildRatio_prevYear');
      base.iod.m3_goiterChildRatio_comp = compText(base.iod.m3_goiterChildRatio, base.iod.m3_goiterChildRatio_prevYear);

      base.iod.m4_goiterExamTotal = sumField('iod', 'm4_goiterExamTotal');
      base.iod.m4_goiterExamTotal_cum = latestValue('iod', 'm4_goiterExamTotal_cum') || base.iod.m4_goiterExamTotal;
      base.iod.m4_goiterExamTotal_prevYear = sumField('iod', 'm4_goiterExamTotal_prevYear');
      base.iod.m4_goiterExamTotal_comp = compText(base.iod.m4_goiterExamTotal, base.iod.m4_goiterExamTotal_prevYear);

      base.iod.m5_goiterSimpleTotal = sumField('iod', 'm5_goiterSimpleTotal');
      base.iod.m5_goiterSimpleTotal_cum = latestValue('iod', 'm5_goiterSimpleTotal_cum') || base.iod.m5_goiterSimpleTotal;
      base.iod.m5_goiterSimpleTotal_prevYear = sumField('iod', 'm5_goiterSimpleTotal_prevYear');
      base.iod.m5_goiterSimpleTotal_comp = compText(base.iod.m5_goiterSimpleTotal, base.iod.m5_goiterSimpleTotal_prevYear);

      base.iod.m5_1_goiterChild = sumField('iod', 'm5_1_goiterChild');
      base.iod.m5_1_goiterChild_cum = latestValue('iod', 'm5_1_goiterChild_cum') || base.iod.m5_1_goiterChild;
      base.iod.m5_1_goiterChild_prevYear = sumField('iod', 'm5_1_goiterChild_prevYear');
      base.iod.m5_1_goiterChild_comp = compText(base.iod.m5_1_goiterChild, base.iod.m5_1_goiterChild_prevYear);

      base.iod.m5_2_goiterTreated = sumField('iod', 'm5_2_goiterTreated');
      base.iod.m5_2_goiterTreated_cum = latestValue('iod', 'm5_2_goiterTreated_cum') || base.iod.m5_2_goiterTreated;
      base.iod.m5_2_goiterTreated_prevYear = sumField('iod', 'm5_2_goiterTreated_prevYear');
      base.iod.m5_2_goiterTreated_comp = compText(base.iod.m5_2_goiterTreated, base.iod.m5_2_goiterTreated_prevYear);

      base.iod.m6_hypothyroidism = sumField('iod', 'm6_hypothyroidism');
      base.iod.m6_hypothyroidism_cum = latestValue('iod', 'm6_hypothyroidism_cum') || base.iod.m6_hypothyroidism;
      base.iod.m6_hypothyroidism_prevYear = sumField('iod', 'm6_hypothyroidism_prevYear');
      base.iod.m6_hypothyroidism_comp = compText(base.iod.m6_hypothyroidism, base.iod.m6_hypothyroidism_prevYear);

      base.iod.m7_thyroiditis = sumField('iod', 'm7_thyroiditis');
      base.iod.m7_thyroiditis_cum = latestValue('iod', 'm7_thyroiditis_cum') || base.iod.m7_thyroiditis;
      base.iod.m7_thyroiditis_prevYear = sumField('iod', 'm7_thyroiditis_prevYear');
      base.iod.m7_thyroiditis_comp = compText(base.iod.m7_thyroiditis, base.iod.m7_thyroiditis_prevYear);

      base.iod.m8_basedow = sumField('iod', 'm8_basedow');
      base.iod.m8_basedow_cum = latestValue('iod', 'm8_basedow_cum') || base.iod.m8_basedow;
      base.iod.m8_basedow_prevYear = sumField('iod', 'm8_basedow_prevYear');
      base.iod.m8_basedow_comp = compText(base.iod.m8_basedow, base.iod.m8_basedow_prevYear);

      base.iod.m9_saltCoverageRatio = latestValue('iod', 'm9_saltCoverageRatio');
      base.iod.m9_saltCoverageRatio_cum = latestValue('iod', 'm9_saltCoverageRatio_cum') || base.iod.m9_saltCoverageRatio;
      base.iod.m9_saltCoverageRatio_prevYear = latestValue('iod', 'm9_saltCoverageRatio_prevYear');
      base.iod.m9_saltCoverageRatio_comp = compText(base.iod.m9_saltCoverageRatio, base.iod.m9_saltCoverageRatio_prevYear);

      return base;
    } else {
      const targetId = `ncd_${selectedYear}_${selectedMonth.toString().padStart(2, '0')}`;
      const found = yearMonthlyReports.find(r => r.id === targetId);
      if (found) return found;

      const emptyRep = createEmptyOfficialReport(selectedMonth, selectedYear, 'TRẠM Y TẾ PHƯỜNG HIỆP THÀNH');
      emptyRep.reportDate = `Tháng ${selectedMonth}/${selectedYear} (Chưa tạo báo cáo)`;
      return emptyRep;
    }
  }, [yearMonthlyReports, selectedYear, selectedMonth]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="w-10 h-10 border-4 border-rose-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-bold text-slate-500">Đang tải số liệu thời gian thực...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner & Year/Month Selector */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center text-white shadow-lg shadow-rose-500/25">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                Tổng Quan Báo Cáo & Số Liệu Quản Lý Bệnh Mãn Tính
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Số liệu cập nhật trực tiếp từ Firebase Firestore thời gian thực • Trạm Y tế phường Hiệp Thành
              </p>
            </div>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-3 bg-slate-50 dark:bg-slate-800/80 p-2 rounded-2xl border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-1.5 px-2">
            <Calendar className="w-4 h-4 text-rose-600" />
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Năm báo cáo:</span>
          </div>
          <select
            value={selectedYear}
            onChange={e => setSelectedYear(Number(e.target.value))}
            className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white"
          >
            <option value={2026}>Năm 2026</option>
            <option value={2025}>Năm 2025</option>
            <option value={2024}>Năm 2024</option>
          </select>

          <div className="h-5 w-px bg-slate-300 dark:bg-slate-700" />
          <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 px-2">
            Hiển thị số liệu tổng hợp cả năm
          </span>
        </div>
      </div>

      {/* Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Total Managed */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Bệnh Nhân Đang Quản Lý
            </span>
            <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div className="text-3xl font-black text-rose-600 dark:text-rose-400 font-mono">
              {aggregatedStats.maxManaged.toLocaleString('vi-VN')}
            </div>
            <span className="text-[10px] text-slate-400 font-medium">Bệnh nhân</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Tổng số lượng quản lý năm {selectedYear}
          </p>
        </div>

        {/* Card 2: New Cases */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Số Ca Mắc Mới
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div className="text-3xl font-black text-blue-600 dark:text-blue-400 font-mono">
              +{aggregatedStats.totalNew.toLocaleString('vi-VN')}
            </div>
            <span className="text-[10px] text-slate-400 font-medium">Ca mới</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Tổng mắc mới cả năm {selectedYear}
          </p>
        </div>

        {/* Card 3: Deaths */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Số Ca Tử Vong
            </span>
            <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center font-bold">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div className="text-3xl font-black text-slate-800 dark:text-slate-100 font-mono">
              {aggregatedStats.totalDeath.toLocaleString('vi-VN')}
            </div>
            <span className="text-[10px] text-slate-400 font-medium">Ca tử vong</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Tổng tử vong cả năm {selectedYear}
          </p>
        </div>

        {/* Card 4: Stop Treatment */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Ngưng Điều Trị / Chuyển Đi
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <Stethoscope className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div className="text-3xl font-black text-amber-600 dark:text-amber-400 font-mono">
              {aggregatedStats.totalStop.toLocaleString('vi-VN')}
            </div>
            <span className="text-[10px] text-slate-400 font-medium">Bệnh nhân</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Tổng ngưng quản lý cả năm {selectedYear}
          </p>
        </div>

      </div>

      {/* 12-Month Bar & Line Chart Section */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-rose-600" />
              <span>Biểu Đồ Diễn Biến Các Tháng Trong Năm {selectedYear}</span>
            </h3>
            <p className="text-xs text-slate-500">
              Diễn biến số liệu từng tháng trong năm {selectedYear}
            </p>
          </div>

          {/* Metric Selector Tabs */}
          <div className="flex bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl self-start lg:self-auto shadow-inner border border-slate-200/50 dark:border-slate-700/50">
            <button
              onClick={() => setActiveMetric('NEW')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeMetric === 'NEW'
                  ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <span>Mắc mới</span>
            </button>
            <button
              onClick={() => setActiveMetric('DEATH')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeMetric === 'DEATH'
                  ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <span>Tử vong</span>
            </button>
            <button
              onClick={() => setActiveMetric('MANAGED')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeMetric === 'MANAGED'
                  ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <span>Quản lý</span>
            </button>
          </div>
        </div>

        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthly12TrendData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fontWeight: 'bold' }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ borderRadius: '16px', fontSize: '12px', fontWeight: 'bold' }} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Line type="monotone" dataKey="Tăng huyết áp (THA)" stroke="#e11d48" strokeWidth={3} activeDot={{ r: 6 }} dot={{ strokeWidth: 2 }} />
              <Line type="monotone" dataKey="Đái tháo đường (ĐTĐ)" stroke="#d97706" strokeWidth={3} activeDot={{ r: 6 }} dot={{ strokeWidth: 2 }} />
              <Line type="monotone" dataKey="Ung thư" stroke="#9333ea" strokeWidth={3} activeDot={{ r: 6 }} dot={{ strokeWidth: 2 }} />
              <Line type="monotone" dataKey="COPD" stroke="#059669" strokeWidth={3} activeDot={{ r: 6 }} dot={{ strokeWidth: 2 }} />
              <Line type="monotone" dataKey="Hen" stroke="#0d9488" strokeWidth={3} activeDot={{ r: 6 }} dot={{ strokeWidth: 2 }} />
              <Line type="monotone" dataKey="Bướu cổ & IOD" stroke="#0284c7" strokeWidth={3} activeDot={{ r: 6 }} dot={{ strokeWidth: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Breakdown Table using OfficialReportTableView */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 overflow-hidden">
        <OfficialReportTableView
          reportData={dashboardReportData}
          title={`Chi Tiết Số Liệu Tổng Năm ${selectedYear}`}
          colCurrentLabel={`Số liệu Tổng năm ${selectedYear}`}
          colPrevLabel="Năm trước"
        />
      </div>
    </div>
  );
};
