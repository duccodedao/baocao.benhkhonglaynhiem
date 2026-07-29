import React, { useState, useEffect, useRef } from 'react';
import {
  FileText,
  Save,
  Printer,
  RotateCcw,
  CheckCircle2,
  Calendar,
  Building,
  Clock,
  Table,
  Loader2,
  CloudCheck,
  FileSpreadsheet,
  Layers,
  CalendarDays,
  Heart,
  Activity,
  ShieldAlert,
  Stethoscope,
  Pill,
  Search,
  Download,
  FileUp,
  Info,
  AlertCircle,
  X,
  ExternalLink
} from 'lucide-react';
import { CancerImportModal } from './CancerImportModal';
import { CANCER_TYPES } from '../constants/cancerTypes';
import { useAuth } from '../context/AuthContext';
import { useReports } from '../context/ReportsContext';
import { useToast } from '../context/ToastContext';
import { getUnitConfig } from '../services/storage';
import { exportOfficialNcdToExcel, exportCancerAppendixToExcel } from '../services/excelExporter';
import { db } from '../firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';

export type ReportViewMode = 'MONTHLY' | 'QUARTERLY' | 'CUSTOM_RANGE';
export type QuarterType = 'STANDARD';

export interface QuarterMonthSpec {
  m: number;
  y: number;
}

export const getQuarterMonths = (
  type: QuarterType,
  choice: string,
  selYear: number
): QuarterMonthSpec[] => {
  switch (choice) {
    case 'Q1':
      return [{ m: 1, y: selYear }, { m: 2, y: selYear }, { m: 3, y: selYear }];
    case 'Q2':
      return [{ m: 4, y: selYear }, { m: 5, y: selYear }, { m: 6, y: selYear }];
    case 'Q3':
      return [{ m: 7, y: selYear }, { m: 8, y: selYear }, { m: 9, y: selYear }];
    case 'Q4':
      return [{ m: 10, y: selYear }, { m: 11, y: selYear }, { m: 12, y: selYear }];
    default:
      return [{ m: 1, y: selYear }, { m: 2, y: selYear }, { m: 3, y: selYear }];
  }
};

export const getQuarterDisplayText = (type: QuarterType, choice: string, selYear: number) => {
  const months = getQuarterMonths(type, choice, selYear);
  const monthsStr = months.map(x => `Tháng ${x.m}/${x.y}`).join(', ');
  const qName = choice === 'Q1' ? 'QUÝ 1' : choice === 'Q2' ? 'QUÝ 2' : choice === 'Q3' ? 'QUÝ 3' : 'QUÝ 4';
  return `${qName} NĂM ${selYear} (${monthsStr})`;
};

export interface OfficialNcdData {
  id: string; // e.g. "ncd_2026_06"
  month: number;
  year: number;
  unitName: string;
  reportDate: string;
  reporterName: string;
  headName: string;
  lastSavedAt?: string;

  // 6. THA
  tha: {
    m1_newCase: number;
    m1_newCase_cum: number;
    m1_newCase_prevYear: number;
    m1_newCase_comp: string;

    m2_reTreat: number;
    m2_reTreat_cum: number;
    m2_reTreat_prevYear: number;
    m2_reTreat_comp: string;

    m3_death: number;
    m3_death_cum: number;
    m3_death_prevYear: number;
    m3_death_comp: string;

    m4_stopTreat: number;
    m4_stopTreat_cum: number;
    m4_stopTreat_prevYear: number;
    m4_stopTreat_comp: string;

    m5_currentManaged: number;
    m5_currentManaged_prevYear: number;
    m5_currentManaged_comp: string;

    m6_targetBp: number;
    m6_targetBp_prevYear: number;
    m6_targetBp_comp: string;
  };

  // 7. ĐTĐ
  dtd: {
    m1_newCase: number;
    m1_newCase_cum: number;
    m1_newCase_prevYear: number;
    m1_newCase_comp: string;

    m2_reTreat: number;
    m2_reTreat_cum: number;
    m2_reTreat_prevYear: number;
    m2_reTreat_comp: string;

    m3_currentManaged: number;
    m3_currentManaged_prevYear: number;
    m3_currentManaged_comp: string;

    m4_stableTreat: number;
    m4_stableTreat_prevYear: number;
    m4_stableTreat_comp: string;

    m5_death: number;
    m5_death_cum: number;
    m5_death_prevYear: number;
    m5_death_comp: string;

    m6_stopTreat: number;
    m6_stopTreat_cum: number;
    m6_stopTreat_prevYear: number;
    m6_stopTreat_comp: string;

    m7_prediabetesNew: number;
    m7_prediabetesNew_cum: number;
    m7_prediabetesNew_prevYear: number;
    m7_prediabetesNew_comp: string;

    m8_prediabetesManaged: number;
    m8_prediabetesManaged_prevYear: number;
    m8_prediabetesManaged_comp: string;
  };

  // 8. UNG THƯ
  cancer: {
    m1_newCase: number;
    m1_newCase_cum: number;
    m1_newCase_prevYear: number;
    m1_newCase_comp: string;

    m2_reTreat: number;
    m2_reTreat_cum: number;
    m2_reTreat_prevYear: number;
    m2_reTreat_comp: string;

    m3_death: number;
    m3_death_cum: number;
    m3_death_prevYear: number;
    m3_death_comp: string;

    m4_stopTreat: number;
    m4_stopTreat_cum: number;
    m4_stopTreat_prevYear: number;
    m4_stopTreat_comp: string;

    m5_currentManaged: number;
    m5_currentManaged_prevYear: number;
    m5_currentManaged_comp: string;
  };
  cancerDetails?: Record<string, {
    mac: number;
    macTichLuy: number;
    chet: number;
    chetTichLuy: number;
    ngungDieuTri: number;
    quanLyHienTai: number;
    note: string;
  }>;

  // 9. IOD
  iod: {
    m1_saltTested: number;
    m1_saltTested_cum: number;
    m1_saltTested_prevYear: number;
    m1_saltTested_comp: string;

    m1_1_saltPass: number;
    m1_1_saltPass_cum: number;
    m1_1_saltPass_prevYear: number;
    m1_1_saltPass_comp: string;

    m1_2_saltFail: number;
    m1_2_saltFail_cum: number;
    m1_2_saltFail_prevYear: number;
    m1_2_saltFail_comp: string;

    m2_householdRatio: number;
    m2_householdRatio_cum: number;
    m2_householdRatio_prevYear: number;
    m2_householdRatio_comp: string;

    m3_goiterChildRatio: number;
    m3_goiterChildRatio_cum: number;
    m3_goiterChildRatio_prevYear: number;
    m3_goiterChildRatio_comp: string;

    m4_goiterExamTotal: number;
    m4_goiterExamTotal_cum: number;
    m4_goiterExamTotal_prevYear: number;
    m4_goiterExamTotal_comp: string;

    m5_goiterSimpleTotal: number;
    m5_goiterSimpleTotal_cum: number;
    m5_goiterSimpleTotal_prevYear: number;
    m5_goiterSimpleTotal_comp: string;

    m5_1_goiterChild: number;
    m5_1_goiterChild_cum: number;
    m5_1_goiterChild_prevYear: number;
    m5_1_goiterChild_comp: string;

    m5_2_goiterTreated: number;
    m5_2_goiterTreated_cum: number;
    m5_2_goiterTreated_prevYear: number;
    m5_2_goiterTreated_comp: string;

    m6_hypothyroidism: number;
    m6_hypothyroidism_cum: number;
    m6_hypothyroidism_prevYear: number;
    m6_hypothyroidism_comp: string;

    m7_thyroiditis: number;
    m7_thyroiditis_cum: number;
    m7_thyroiditis_prevYear: number;
    m7_thyroiditis_comp: string;

    m8_basedow: number;
    m8_basedow_cum: number;
    m8_basedow_prevYear: number;
    m8_basedow_comp: string;

    m9_saltCoverageRatio: number;
    m9_saltCoverageRatio_cum: number;
    m9_saltCoverageRatio_prevYear: number;
    m9_saltCoverageRatio_comp: string;
  };
  tt23?: {
    k1_approvedTech: number;
    k1_actualTech: number;
    k1_approvedTech_prevYear: number;
    k1_approvedTech_comp: string;

    k2_essentialDrugs: number;
    k2_actualDrugs: number;
    k2_essentialDrugs_prevYear: number;
    k2_essentialDrugs_comp: string;

    k3_ncdEssentialDrugs: number;
    k3_actualNcdDrugs: number;
    k3_ncdEssentialDrugs_prevYear: number;
    k3_ncdEssentialDrugs_comp: string;

    k4_totalEquip: number;
    k4_goodEquip: number;
    k4_totalEquip_prevYear: number;
    k4_totalEquip_comp: string;
  };
}

const STORAGE_KEY = 'yt_official_ncd_monthly_reports_v2';


export const createEmptyOfficialReport = (month: number, year: number, unitName: string): OfficialNcdData => ({
  id: `ncd_${year}_${month.toString().padStart(2, '0')}`,
  month,
  year,
  unitName: unitName || 'TRẠM Y TẾ PHƯỜNG HIỆP THÀNH',
  reportDate: `Ngày 05 tháng ${month.toString().padStart(2, '0')} năm ${year}`,
  reporterName: '',
  headName: '',

  tha: {
    m1_newCase: 0, m1_newCase_cum: 0, m1_newCase_prevYear: 0, m1_newCase_comp: 'Không',
    m2_reTreat: 0, m2_reTreat_cum: 0, m2_reTreat_prevYear: 0, m2_reTreat_comp: 'Không',
    m3_death: 0, m3_death_cum: 0, m3_death_prevYear: 0, m3_death_comp: 'Không',
    m4_stopTreat: 0, m4_stopTreat_cum: 0, m4_stopTreat_prevYear: 0, m4_stopTreat_comp: 'Không',
    m5_currentManaged: 0, m5_currentManaged_prevYear: 0, m5_currentManaged_comp: 'Không',
    m6_targetBp: 0, m6_targetBp_prevYear: 0, m6_targetBp_comp: 'Không',
  },

  dtd: {
    m1_newCase: 0, m1_newCase_cum: 0, m1_newCase_prevYear: 0, m1_newCase_comp: 'Không',
    m2_reTreat: 0, m2_reTreat_cum: 0, m2_reTreat_prevYear: 0, m2_reTreat_comp: 'Không',
    m3_currentManaged: 0, m3_currentManaged_prevYear: 0, m3_currentManaged_comp: 'Không',
    m4_stableTreat: 0, m4_stableTreat_prevYear: 0, m4_stableTreat_comp: 'Không',
    m5_death: 0, m5_death_cum: 0, m5_death_prevYear: 0, m5_death_comp: 'Không',
    m6_stopTreat: 0, m6_stopTreat_cum: 0, m6_stopTreat_prevYear: 0, m6_stopTreat_comp: 'Không',
    m7_prediabetesNew: 0, m7_prediabetesNew_cum: 0, m7_prediabetesNew_prevYear: 0, m7_prediabetesNew_comp: 'Không',
    m8_prediabetesManaged: 0, m8_prediabetesManaged_prevYear: 0, m8_prediabetesManaged_comp: 'Không',
  },

  cancer: {
    m1_newCase: 0, m1_newCase_cum: 0, m1_newCase_prevYear: 0, m1_newCase_comp: 'Không',
    m2_reTreat: 0, m2_reTreat_cum: 0, m2_reTreat_prevYear: 0, m2_reTreat_comp: 'Không',
    m3_death: 0, m3_death_cum: 0, m3_death_prevYear: 0, m3_death_comp: 'Không',
    m4_stopTreat: 0, m4_stopTreat_cum: 0, m4_stopTreat_prevYear: 0, m4_stopTreat_comp: 'Không',
    m5_currentManaged: 0, m5_currentManaged_prevYear: 0, m5_currentManaged_comp: 'Không',
  },
  cancerDetails: CANCER_TYPES.reduce((acc, type) => {
    acc[type] = {
      mac: 0,
      macTichLuy: 0,
      chet: 0,
      chetTichLuy: 0,
      ngungDieuTri: 0,
      quanLyHienTai: 0,
      note: '',
    };
    return acc;
  }, {} as Record<string, any>),

  iod: {
    m1_saltTested: 0, m1_saltTested_cum: 0, m1_saltTested_prevYear: 0, m1_saltTested_comp: 'Không',
    m1_1_saltPass: 0, m1_1_saltPass_cum: 0, m1_1_saltPass_prevYear: 0, m1_1_saltPass_comp: 'Không',
    m1_2_saltFail: 0, m1_2_saltFail_cum: 0, m1_2_saltFail_prevYear: 0, m1_2_saltFail_comp: 'Không',
    m2_householdRatio: 0, m2_householdRatio_cum: 0, m2_householdRatio_prevYear: 0, m2_householdRatio_comp: 'Không',
    m3_goiterChildRatio: 0, m3_goiterChildRatio_cum: 0, m3_goiterChildRatio_prevYear: 0, m3_goiterChildRatio_comp: 'Không',
    m4_goiterExamTotal: 0, m4_goiterExamTotal_cum: 0, m4_goiterExamTotal_prevYear: 0, m4_goiterExamTotal_comp: 'Không',
    m5_goiterSimpleTotal: 0, m5_goiterSimpleTotal_cum: 0, m5_goiterSimpleTotal_prevYear: 0, m5_goiterSimpleTotal_comp: 'Không',
    m5_1_goiterChild: 0, m5_1_goiterChild_cum: 0, m5_1_goiterChild_prevYear: 0, m5_1_goiterChild_comp: 'Không',
    m5_2_goiterTreated: 0, m5_2_goiterTreated_cum: 0, m5_2_goiterTreated_prevYear: 0, m5_2_goiterTreated_comp: 'Không',
    m6_hypothyroidism: 0, m6_hypothyroidism_cum: 0, m6_hypothyroidism_prevYear: 0, m6_hypothyroidism_comp: 'Không',
    m7_thyroiditis: 0, m7_thyroiditis_cum: 0, m7_thyroiditis_prevYear: 0, m7_thyroiditis_comp: 'Không',
    m8_basedow: 0, m8_basedow_cum: 0, m8_basedow_prevYear: 0, m8_basedow_comp: 'Không',
    m9_saltCoverageRatio: 0, m9_saltCoverageRatio_cum: 0, m9_saltCoverageRatio_prevYear: 0, m9_saltCoverageRatio_comp: 'Không',
  },

  tt23: {
    k1_approvedTech: 85, k1_actualTech: 62, k1_approvedTech_prevYear: 80, k1_approvedTech_comp: 'Không',
    k2_essentialDrugs: 150, k2_actualDrugs: 110, k2_essentialDrugs_prevYear: 140, k2_essentialDrugs_comp: 'Không',
    k3_ncdEssentialDrugs: 20, k3_actualNcdDrugs: 16, k3_ncdEssentialDrugs_prevYear: 18, k3_ncdEssentialDrugs_comp: 'Không',
    k4_totalEquip: 12, k4_goodEquip: 9, k4_totalEquip_prevYear: 11, k4_totalEquip_comp: 'Không',
  },
});

interface NumInputProps {
  value: number;
  onChange: (val: string) => void;
  disabled?: boolean;
  highlight?: boolean;
  mismatch?: boolean;
  align?: 'right' | 'center' | 'left';
}

const NumInput: React.FC<NumInputProps> = ({
  value,
  onChange,
  disabled,
  highlight,
  mismatch,
  align = 'right'
}) => {
  const { user } = useAuth();
  const isReadOnly = disabled || user?.role === 'VIEWER';

  return (
    <input
      type="number"
      min="0"
      value={value === 0 ? '' : value}
      placeholder="0"
      onChange={e => onChange(e.target.value)}
      disabled={isReadOnly}
      className={`w-full ${align === 'center' ? 'text-center' : align === 'left' ? 'text-left' : 'text-right'} px-2 py-1.5 rounded-lg ${
        mismatch
          ? 'bg-amber-100 dark:bg-amber-950/90 text-amber-950 dark:text-amber-100 font-extrabold border-2 border-amber-500 dark:border-amber-400 ring-2 ring-amber-400/50'
          : highlight
          ? 'bg-rose-50/90 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 font-bold border-rose-300 dark:border-rose-800'
          : 'bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white font-semibold border-slate-200 dark:border-slate-700'
      } text-xs border hover:border-slate-400 dark:hover:border-slate-500 focus:bg-white focus:dark:bg-slate-900 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all outline-none print:border-none print:bg-transparent print:p-0 print:shadow-none print:font-semibold print:text-slate-900 disabled:opacity-75 disabled:cursor-not-allowed`}
    />
  );
};

interface CompSelectProps {
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
}

const CompSelect: React.FC<CompSelectProps> = ({ value, onChange, disabled }) => {
  const { user } = useAuth();
  const isReadOnly = disabled || user?.role === 'VIEWER';

  return (
    <select
      value={value || 'Không'}
      onChange={e => onChange(e.target.value)}
      disabled={isReadOnly}
      className={`w-full text-center appearance-none px-1 py-1.5 rounded-lg text-xs font-black border transition-all cursor-pointer ${
        value === 'Tăng +'
          ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800'
          : value === 'Giảm -'
          ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
          : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
      } focus:ring-2 focus:ring-rose-500 outline-none print:border-none print:bg-transparent print:p-0 print:text-slate-900 disabled:opacity-75 disabled:cursor-not-allowed`}
    >
      <option value="Tăng +">Tăng +</option>
      <option value="Giảm -">Giảm -</option>
      <option value="Không">Không</option>
    </select>
  );
};

interface UnimplementedReportPlaceholderProps {
  title: string;
  icon: React.ComponentType<any>;
  color: 'rose' | 'emerald' | 'amber' | 'blue' | 'indigo';
}

const UnimplementedReportPlaceholder: React.FC<UnimplementedReportPlaceholderProps> = ({ title, icon: Icon, color }) => {
  const colorMap = {
    rose: {
      bg: 'bg-rose-50 dark:bg-rose-950/30',
      text: 'text-rose-600 dark:text-rose-400',
      border: 'border-rose-100 dark:border-rose-950/40',
    },
    emerald: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/30',
      text: 'text-emerald-600 dark:text-emerald-400',
      border: 'border-emerald-100 dark:border-emerald-950/40',
    },
    amber: {
      bg: 'bg-amber-50 dark:bg-amber-950/30',
      text: 'text-amber-600 dark:text-amber-400',
      border: 'border-amber-100 dark:border-amber-950/40',
    },
    blue: {
      bg: 'bg-blue-50 dark:bg-blue-950/30',
      text: 'text-blue-600 dark:text-blue-400',
      border: 'border-blue-100 dark:border-blue-950/40',
    },
    indigo: {
      bg: 'bg-indigo-50 dark:bg-indigo-950/30',
      text: 'text-indigo-600 dark:text-indigo-400',
      border: 'border-indigo-100 dark:border-indigo-950/40',
    }
  }[color];

  return (
    <div className={`bg-white dark:bg-slate-900 rounded-3xl p-8 border ${colorMap.border} shadow-sm flex flex-col items-center text-center space-y-4 max-w-2xl mx-auto my-6`}>
      <div className={`p-4 rounded-full ${colorMap.bg} ${colorMap.text}`}>
        <Icon className="w-10 h-10 animate-pulse" />
      </div>
      <div className="space-y-2">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">{title}</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          Biểu mẫu báo cáo chương trình này chưa triển khai chính thức. Trạm Y tế hiện tại đang đợi biểu mẫu chuẩn từ Sở Y tế / Trung tâm Y tế cấp trên để cấu hình chuẩn xác vào hệ thống phần mềm.
        </p>
        <div className="pt-2 flex items-center justify-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
            Đang chờ biểu mẫu chuẩn từ tuyến trên
          </span>
        </div>
      </div>
    </div>
  );
};

export interface OfficialMonthlyReportProps {
  defaultTab?: 'all' | 'tha' | 'dtd' | 'cancer' | 'iod' | 'copd' | 'asthma' | 'tt23';
  defaultViewMode?: ReportViewMode;
}

export const OfficialMonthlyReport: React.FC<OfficialMonthlyReportProps> = ({ defaultTab = 'all', defaultViewMode = 'MONTHLY' }) => {
  const { user } = useAuth();
  const { reports } = useReports();
  const { showToast, confirmModal } = useToast();
  const unitConfig = getUnitConfig();

  const now = new Date();
  const [viewMode, setViewMode] = useState<ReportViewMode>(defaultViewMode);

  useEffect(() => {
    if (defaultViewMode) {
      setViewMode(defaultViewMode);
    }
  }, [defaultViewMode]);
  const [month, setMonth] = useState<number>(now.getMonth() + 1);
  const [year, setYear] = useState<number>(now.getFullYear());

  const [quarterType, setQuarterType] = useState<QuarterType>('STANDARD');
  const [quarterChoice, setQuarterChoice] = useState<string>('Q1');

  // Custom range states
  const [fromMonth, setFromMonth] = useState<number>(1);
  const [fromYear, setFromYear] = useState<number>(now.getFullYear());
  const [toMonth, setToMonth] = useState<number>(now.getMonth() + 1);
  const [toYear, setToYear] = useState<number>(now.getFullYear());



  const [loadingFirebase, setLoadingFirebase] = useState<boolean>(true);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'idle'>('saved');
  const [cancerSearch, setCancerSearch] = useState("");
  const [showCancerImportModal, setShowCancerImportModal] = useState(false);
  const [selectedNoteType, setSelectedNoteType] = useState<string | null>(null);
  const [activeReportTab, setActiveReportTab] = useState<'all' | 'tha' | 'dtd' | 'cancer' | 'iod' | 'copd' | 'asthma' | 'tt23'>('all');

  useEffect(() => {
    if (defaultTab) {
      setActiveReportTab(defaultTab);
    }
  }, [defaultTab]);

  useEffect(() => {
    const targetId = `ncd_${year}_${month.toString().padStart(2, '0')}`;
    const found = reports.find(r => r.id === targetId);
    if (found) {
        setReportData(found as OfficialNcdData);
    }
  }, [month, year, reports]);

  const [reportData, setReportData] = useState<OfficialNcdData>(() =>
    createEmptyOfficialReport(now.getMonth() + 1, now.getFullYear(), unitConfig.unitName)
  );

  const isInitialMount = useRef(true);

  // Fetch single monthly report
  const fetchSingleMonthlyReport = async (m: number, y: number, unitName: string): Promise<OfficialNcdData> => {
    const targetId = `ncd_${y}_${m.toString().padStart(2, '0')}`;
    try {
      const docRef = doc(db, 'officialNcdReports', targetId);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return snap.data() as OfficialNcdData;
      }
    } catch (e) {
      console.warn('Firestore fetch notice:', e);
    }

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const reports: OfficialNcdData[] = JSON.parse(raw);
        const found = reports.find(r => r.id === targetId);
        if (found) return found;
      }
    } catch (e) {
      // ignore
    }

    return createEmptyOfficialReport(m, y, unitName);
  };

  // Aggregate 3 monthly reports into a quarterly report
  const aggregateQuarterData = (
    monthsReports: OfficialNcdData[],
    prevYearReports: OfficialNcdData[],
    unitName: string,
    targetId: string,
    qYear: number
  ): OfficialNcdData => {
    const base = createEmptyOfficialReport(1, qYear, unitName);
    base.id = targetId;

    const sumField = (sec: 'tha' | 'dtd' | 'cancer' | 'iod', field: string, arr: OfficialNcdData[]) =>
      arr.reduce((acc, curr) => acc + (Number((curr[sec] as any)?.[field]) || 0), 0);

    const lastValue = (sec: 'tha' | 'dtd' | 'cancer' | 'iod', field: string, arr: OfficialNcdData[]) => {
      if (!arr || arr.length === 0) return 0;
      for (let i = arr.length - 1; i >= 0; i--) {
        const val = (arr[i][sec] as any)?.[field];
        if (val !== undefined && val !== null && val !== '') return Number(val) || 0;
      }
      return 0;
    };

    const compText = (cur: number, prev: number) => {
      if (cur > prev) return 'Tăng +';
      if (cur < prev) return 'Giảm -';
      return 'Không';
    };

    // 1. THA
    base.tha.m1_newCase = sumField('tha', 'm1_newCase', monthsReports);
    base.tha.m1_newCase_cum = lastValue('tha', 'm1_newCase_cum', monthsReports);
    base.tha.m1_newCase_prevYear = sumField('tha', 'm1_newCase', prevYearReports);
    base.tha.m1_newCase_comp = compText(base.tha.m1_newCase, base.tha.m1_newCase_prevYear);

    base.tha.m2_reTreat = sumField('tha', 'm2_reTreat', monthsReports);
    base.tha.m2_reTreat_cum = lastValue('tha', 'm2_reTreat_cum', monthsReports);
    base.tha.m2_reTreat_prevYear = sumField('tha', 'm2_reTreat', prevYearReports);
    base.tha.m2_reTreat_comp = compText(base.tha.m2_reTreat, base.tha.m2_reTreat_prevYear);

    base.tha.m3_death = sumField('tha', 'm3_death', monthsReports);
    base.tha.m3_death_cum = lastValue('tha', 'm3_death_cum', monthsReports);
    base.tha.m3_death_prevYear = sumField('tha', 'm3_death', prevYearReports);
    base.tha.m3_death_comp = compText(base.tha.m3_death, base.tha.m3_death_prevYear);

    base.tha.m4_stopTreat = sumField('tha', 'm4_stopTreat', monthsReports);
    base.tha.m4_stopTreat_cum = lastValue('tha', 'm4_stopTreat_cum', monthsReports);
    base.tha.m4_stopTreat_prevYear = sumField('tha', 'm4_stopTreat', prevYearReports);
    base.tha.m4_stopTreat_comp = compText(base.tha.m4_stopTreat, base.tha.m4_stopTreat_prevYear);

    base.tha.m5_currentManaged = lastValue('tha', 'm5_currentManaged', monthsReports);
    base.tha.m5_currentManaged_prevYear = lastValue('tha', 'm5_currentManaged', prevYearReports);
    base.tha.m5_currentManaged_comp = compText(base.tha.m5_currentManaged, base.tha.m5_currentManaged_prevYear);

    base.tha.m6_targetBp = lastValue('tha', 'm6_targetBp', monthsReports);
    base.tha.m6_targetBp_prevYear = lastValue('tha', 'm6_targetBp', prevYearReports);
    base.tha.m6_targetBp_comp = compText(base.tha.m6_targetBp, base.tha.m6_targetBp_prevYear);

    // 2. DTD
    base.dtd.m1_newCase = sumField('dtd', 'm1_newCase', monthsReports);
    base.dtd.m1_newCase_cum = lastValue('dtd', 'm1_newCase_cum', monthsReports);
    base.dtd.m1_newCase_prevYear = sumField('dtd', 'm1_newCase', prevYearReports);
    base.dtd.m1_newCase_comp = compText(base.dtd.m1_newCase, base.dtd.m1_newCase_prevYear);

    base.dtd.m2_reTreat = sumField('dtd', 'm2_reTreat', monthsReports);
    base.dtd.m2_reTreat_cum = lastValue('dtd', 'm2_reTreat_cum', monthsReports);
    base.dtd.m2_reTreat_prevYear = sumField('dtd', 'm2_reTreat', prevYearReports);
    base.dtd.m2_reTreat_comp = compText(base.dtd.m2_reTreat, base.dtd.m2_reTreat_prevYear);

    base.dtd.m3_currentManaged = lastValue('dtd', 'm3_currentManaged', monthsReports);
    base.dtd.m3_currentManaged_prevYear = lastValue('dtd', 'm3_currentManaged', prevYearReports);
    base.dtd.m3_currentManaged_comp = compText(base.dtd.m3_currentManaged, base.dtd.m3_currentManaged_prevYear);

    base.dtd.m4_stableTreat = lastValue('dtd', 'm4_stableTreat', monthsReports);
    base.dtd.m4_stableTreat_prevYear = lastValue('dtd', 'm4_stableTreat', prevYearReports);
    base.dtd.m4_stableTreat_comp = compText(base.dtd.m4_stableTreat, base.dtd.m4_stableTreat_prevYear);

    base.dtd.m5_death = sumField('dtd', 'm5_death', monthsReports);
    base.dtd.m5_death_cum = lastValue('dtd', 'm5_death_cum', monthsReports);
    base.dtd.m5_death_prevYear = sumField('dtd', 'm5_death', prevYearReports);
    base.dtd.m5_death_comp = compText(base.dtd.m5_death, base.dtd.m5_death_prevYear);

    base.dtd.m6_stopTreat = sumField('dtd', 'm6_stopTreat', monthsReports);
    base.dtd.m6_stopTreat_cum = lastValue('dtd', 'm6_stopTreat_cum', monthsReports);
    base.dtd.m6_stopTreat_prevYear = sumField('dtd', 'm6_stopTreat', prevYearReports);
    base.dtd.m6_stopTreat_comp = compText(base.dtd.m6_stopTreat, base.dtd.m6_stopTreat_prevYear);

    base.dtd.m7_prediabetesNew = sumField('dtd', 'm7_prediabetesNew', monthsReports);
    base.dtd.m7_prediabetesNew_cum = lastValue('dtd', 'm7_prediabetesNew_cum', monthsReports);
    base.dtd.m7_prediabetesNew_prevYear = sumField('dtd', 'm7_prediabetesNew', prevYearReports);
    base.dtd.m7_prediabetesNew_comp = compText(base.dtd.m7_prediabetesNew, base.dtd.m7_prediabetesNew_prevYear);

    base.dtd.m8_prediabetesManaged = lastValue('dtd', 'm8_prediabetesManaged', monthsReports);
    base.dtd.m8_prediabetesManaged_prevYear = lastValue('dtd', 'm8_prediabetesManaged', prevYearReports);
    base.dtd.m8_prediabetesManaged_comp = compText(base.dtd.m8_prediabetesManaged, base.dtd.m8_prediabetesManaged_prevYear);

    // 3. CANCER
    base.cancer.m1_newCase = sumField('cancer', 'm1_newCase', monthsReports);
    base.cancer.m1_newCase_cum = lastValue('cancer', 'm1_newCase_cum', monthsReports);
    base.cancer.m1_newCase_prevYear = sumField('cancer', 'm1_newCase', prevYearReports);
    base.cancer.m1_newCase_comp = compText(base.cancer.m1_newCase, base.cancer.m1_newCase_prevYear);

    base.cancer.m2_reTreat = sumField('cancer', 'm2_reTreat', monthsReports);
    base.cancer.m2_reTreat_cum = lastValue('cancer', 'm2_reTreat_cum', monthsReports);
    base.cancer.m2_reTreat_prevYear = sumField('cancer', 'm2_reTreat', prevYearReports);
    base.cancer.m2_reTreat_comp = compText(base.cancer.m2_reTreat, base.cancer.m2_reTreat_prevYear);

    base.cancer.m3_death = sumField('cancer', 'm3_death', monthsReports);
    base.cancer.m3_death_cum = lastValue('cancer', 'm3_death_cum', monthsReports);
    base.cancer.m3_death_prevYear = sumField('cancer', 'm3_death', prevYearReports);
    base.cancer.m3_death_comp = compText(base.cancer.m3_death, base.cancer.m3_death_prevYear);

    base.cancer.m4_stopTreat = sumField('cancer', 'm4_stopTreat', monthsReports);
    base.cancer.m4_stopTreat_cum = lastValue('cancer', 'm4_stopTreat_cum', monthsReports);
    base.cancer.m4_stopTreat_prevYear = sumField('cancer', 'm4_stopTreat', prevYearReports);
    base.cancer.m4_stopTreat_comp = compText(base.cancer.m4_stopTreat, base.cancer.m4_stopTreat_prevYear);

    base.cancer.m5_currentManaged = lastValue('cancer', 'm5_currentManaged', monthsReports);
    base.cancer.m5_currentManaged_prevYear = lastValue('cancer', 'm5_currentManaged', prevYearReports);
    base.cancer.m5_currentManaged_comp = compText(base.cancer.m5_currentManaged, base.cancer.m5_currentManaged_prevYear);

    // Aggregate cancerDetails for Cancer Appendix
    const aggCancerDetails: Record<string, any> = {};
    CANCER_TYPES.forEach(type => {
      let macSum = 0;
      let chetSum = 0;
      let ngungSum = 0;

      for (const r of monthsReports) {
        if (r.cancerDetails && r.cancerDetails[type]) {
          const d = r.cancerDetails[type];
          macSum += Number(d.mac) || 0;
          chetSum += Number(d.chet) || 0;
          ngungSum += Number(d.ngungDieuTri) || 0;
        }
      }

      // Cumulative / Snapshot fields are taken directly from the last month of the period
      let lastMacTichLuy = 0;
      let lastChetTichLuy = 0;
      let lastQuanLy = 0;
      let lastNote = '';

      for (let i = monthsReports.length - 1; i >= 0; i--) {
        const d = monthsReports[i]?.cancerDetails?.[type];
        if (d) {
          if (lastMacTichLuy === 0 && d.macTichLuy !== undefined && d.macTichLuy !== null) lastMacTichLuy = Number(d.macTichLuy) || 0;
          if (lastChetTichLuy === 0 && d.chetTichLuy !== undefined && d.chetTichLuy !== null) lastChetTichLuy = Number(d.chetTichLuy) || 0;
          if (lastQuanLy === 0 && d.quanLyHienTai !== undefined && d.quanLyHienTai !== null) lastQuanLy = Number(d.quanLyHienTai) || 0;
          if (!lastNote && d.note) lastNote = d.note;
        }
      }

      aggCancerDetails[type] = {
        mac: macSum,
        macTichLuy: lastMacTichLuy,
        chet: chetSum,
        chetTichLuy: lastChetTichLuy,
        ngungDieuTri: ngungSum,
        quanLyHienTai: lastQuanLy,
        note: lastNote
      };
    });
    base.cancerDetails = aggCancerDetails;

    // 4. IOD
    base.iod.m1_saltTested = sumField('iod', 'm1_saltTested', monthsReports);
    base.iod.m1_saltTested_cum = lastValue('iod', 'm1_saltTested_cum', monthsReports);
    base.iod.m1_saltTested_prevYear = sumField('iod', 'm1_saltTested', prevYearReports);
    base.iod.m1_saltTested_comp = compText(base.iod.m1_saltTested, base.iod.m1_saltTested_prevYear);

    base.iod.m1_1_saltPass = sumField('iod', 'm1_1_saltPass', monthsReports);
    base.iod.m1_1_saltPass_cum = lastValue('iod', 'm1_1_saltPass_cum', monthsReports);
    base.iod.m1_1_saltPass_prevYear = sumField('iod', 'm1_1_saltPass', prevYearReports);
    base.iod.m1_1_saltPass_comp = compText(base.iod.m1_1_saltPass, base.iod.m1_1_saltPass_prevYear);

    base.iod.m1_2_saltFail = sumField('iod', 'm1_2_saltFail', monthsReports);
    base.iod.m1_2_saltFail_cum = lastValue('iod', 'm1_2_saltFail_cum', monthsReports);
    base.iod.m1_2_saltFail_prevYear = sumField('iod', 'm1_2_saltFail', prevYearReports);
    base.iod.m1_2_saltFail_comp = compText(base.iod.m1_2_saltFail, base.iod.m1_2_saltFail_prevYear);

    base.iod.m2_householdRatio = lastValue('iod', 'm2_householdRatio', monthsReports);
    base.iod.m2_householdRatio_cum = lastValue('iod', 'm2_householdRatio_cum', monthsReports);
    base.iod.m2_householdRatio_prevYear = lastValue('iod', 'm2_householdRatio', prevYearReports);
    base.iod.m2_householdRatio_comp = compText(base.iod.m2_householdRatio, base.iod.m2_householdRatio_prevYear);

    base.iod.m3_goiterChildRatio = lastValue('iod', 'm3_goiterChildRatio', monthsReports);
    base.iod.m3_goiterChildRatio_cum = lastValue('iod', 'm3_goiterChildRatio_cum', monthsReports);
    base.iod.m3_goiterChildRatio_prevYear = lastValue('iod', 'm3_goiterChildRatio', prevYearReports);
    base.iod.m3_goiterChildRatio_comp = compText(base.iod.m3_goiterChildRatio, base.iod.m3_goiterChildRatio_prevYear);

    base.iod.m4_goiterExamTotal = sumField('iod', 'm4_goiterExamTotal', monthsReports);
    base.iod.m4_goiterExamTotal_cum = lastValue('iod', 'm4_goiterExamTotal_cum', monthsReports);
    base.iod.m4_goiterExamTotal_prevYear = sumField('iod', 'm4_goiterExamTotal', prevYearReports);
    base.iod.m4_goiterExamTotal_comp = compText(base.iod.m4_goiterExamTotal, base.iod.m4_goiterExamTotal_prevYear);

    base.iod.m5_goiterSimpleTotal = sumField('iod', 'm5_goiterSimpleTotal', monthsReports);
    base.iod.m5_goiterSimpleTotal_cum = lastValue('iod', 'm5_goiterSimpleTotal_cum', monthsReports);
    base.iod.m5_goiterSimpleTotal_prevYear = sumField('iod', 'm5_goiterSimpleTotal', prevYearReports);
    base.iod.m5_goiterSimpleTotal_comp = compText(base.iod.m5_goiterSimpleTotal, base.iod.m5_goiterSimpleTotal_prevYear);

    base.iod.m5_1_goiterChild = sumField('iod', 'm5_1_goiterChild', monthsReports);
    base.iod.m5_1_goiterChild_cum = lastValue('iod', 'm5_1_goiterChild_cum', monthsReports);
    base.iod.m5_1_goiterChild_prevYear = sumField('iod', 'm5_1_goiterChild', prevYearReports);
    base.iod.m5_1_goiterChild_comp = compText(base.iod.m5_1_goiterChild, base.iod.m5_1_goiterChild_prevYear);

    base.iod.m5_2_goiterTreated = sumField('iod', 'm5_2_goiterTreated', monthsReports);
    base.iod.m5_2_goiterTreated_cum = lastValue('iod', 'm5_2_goiterTreated_cum', monthsReports);
    base.iod.m5_2_goiterTreated_prevYear = sumField('iod', 'm5_2_goiterTreated', prevYearReports);
    base.iod.m5_2_goiterTreated_comp = compText(base.iod.m5_2_goiterTreated, base.iod.m5_2_goiterTreated_prevYear);

    base.iod.m6_hypothyroidism = sumField('iod', 'm6_hypothyroidism', monthsReports);
    base.iod.m6_hypothyroidism_cum = lastValue('iod', 'm6_hypothyroidism_cum', monthsReports);
    base.iod.m6_hypothyroidism_prevYear = sumField('iod', 'm6_hypothyroidism', prevYearReports);
    base.iod.m6_hypothyroidism_comp = compText(base.iod.m6_hypothyroidism, base.iod.m6_hypothyroidism_prevYear);

    base.iod.m7_thyroiditis = sumField('iod', 'm7_thyroiditis', monthsReports);
    base.iod.m7_thyroiditis_cum = lastValue('iod', 'm7_thyroiditis_cum', monthsReports);
    base.iod.m7_thyroiditis_prevYear = sumField('iod', 'm7_thyroiditis', prevYearReports);
    base.iod.m7_thyroiditis_comp = compText(base.iod.m7_thyroiditis, base.iod.m7_thyroiditis_prevYear);

    base.iod.m8_basedow = sumField('iod', 'm8_basedow', monthsReports);
    base.iod.m8_basedow_cum = lastValue('iod', 'm8_basedow_cum', monthsReports);
    base.iod.m8_basedow_prevYear = sumField('iod', 'm8_basedow', prevYearReports);
    base.iod.m8_basedow_comp = compText(base.iod.m8_basedow, base.iod.m8_basedow_prevYear);

    base.iod.m9_saltCoverageRatio = lastValue('iod', 'm9_saltCoverageRatio', monthsReports);
    base.iod.m9_saltCoverageRatio_cum = lastValue('iod', 'm9_saltCoverageRatio_cum', monthsReports);
    base.iod.m9_saltCoverageRatio_prevYear = lastValue('iod', 'm9_saltCoverageRatio', prevYearReports);
    base.iod.m9_saltCoverageRatio_comp = compText(base.iod.m9_saltCoverageRatio, base.iod.m9_saltCoverageRatio_prevYear);

    return base;
  };

  const aggregateCustomRangeData = async (
    startM: number,
    startY: number,
    endM: number,
    endY: number,
    unitName: string,
    targetId: string
  ): Promise<OfficialNcdData> => {
    const specs: { m: number; y: number }[] = [];
    let curM = startM;
    let curY = startY;
    while (curY < endY || (curY === endY && curM <= endM)) {
      specs.push({ m: curM, y: curY });
      curM++;
      if (curM > 12) {
        curM = 1;
        curY++;
      }
    }

    const monthPromises = specs.map(s => fetchSingleMonthlyReport(s.m, s.y, unitName));
    const pyPromises = specs.map(s => fetchSingleMonthlyReport(s.m, s.y - 1, unitName));

    const [mReports, pyReports] = await Promise.all([
      Promise.all(monthPromises),
      Promise.all(pyPromises)
    ]);

    const aggregated = aggregateQuarterData(mReports, pyReports, unitName, targetId, endY);
    return aggregated;
  };



  // Load report from Firestore when mode/month/quarter/year changes
  useEffect(() => {
    let isMounted = true;
    setLoadingFirebase(true);

    const targetId = viewMode === 'MONTHLY'
      ? `ncd_${year}_${month.toString().padStart(2, '0')}`
      : viewMode === 'QUARTERLY'
      ? `ncd_q_${quarterChoice}_${year}`
      : `ncd_range_${fromYear}_${fromMonth}_to_${toYear}_${toMonth}`;

    const docRef = doc(db, 'officialNcdReports', targetId);
    let unsubscribe: (() => void) | undefined;

    if (viewMode === 'MONTHLY') {
      unsubscribe = onSnapshot(docRef, (snap) => {
        if (!isMounted) return;
        if (snap.exists()) {
          setReportData(snap.data() as OfficialNcdData);
        } else {
          setReportData(createEmptyOfficialReport(month, year, unitConfig.unitName));
        }
        setLoadingFirebase(false);
        isInitialMount.current = true;
      }, (e) => {
        console.warn('Firestore subscription notice:', e);
        if (isMounted) {
          setReportData(createEmptyOfficialReport(month, year, unitConfig.unitName));
          setLoadingFirebase(false);
        }
      });
    } else if (viewMode === 'QUARTERLY') {
      unsubscribe = onSnapshot(docRef, async (snap) => {
        if (!isMounted) return;
        if (snap.exists()) {
          setReportData(snap.data() as OfficialNcdData);
          setLoadingFirebase(false);
          isInitialMount.current = true;
        } else {
          const mSpecs = getQuarterMonths('STANDARD', quarterChoice, year);
          const monthPromises = mSpecs.map(s => fetchSingleMonthlyReport(s.m, s.y, unitConfig.unitName));
          const prevYearSpecs = mSpecs.map(s => ({ m: s.m, y: s.y - 1 }));
          const prevYearPromises = prevYearSpecs.map(s => fetchSingleMonthlyReport(s.m, s.y, unitConfig.unitName));

          const [mReports, pyReports] = await Promise.all([
            Promise.all(monthPromises),
            Promise.all(prevYearPromises)
          ]);

          if (isMounted) {
            const aggregated = aggregateQuarterData(mReports, pyReports, unitConfig.unitName, targetId, year);
            setReportData(aggregated);
            setLoadingFirebase(false);
            isInitialMount.current = true;
          }
        }
      }, (e) => {
        console.warn('Firestore subscription notice:', e);
        if (isMounted) {
          setLoadingFirebase(false);
        }
      });
    } else {
      // CUSTOM_RANGE view mode
      unsubscribe = onSnapshot(docRef, async (snap) => {
        if (!isMounted) return;
        if (snap.exists()) {
          setReportData(snap.data() as OfficialNcdData);
          setLoadingFirebase(false);
          isInitialMount.current = true;
        } else {
          const aggregated = await aggregateCustomRangeData(fromMonth, fromYear, toMonth, toYear, unitConfig.unitName, targetId);
          if (isMounted) {
            setReportData(aggregated);
            setLoadingFirebase(false);
            isInitialMount.current = true;
          }
        }
      }, (e) => {
        console.warn('Firestore subscription notice:', e);
        if (isMounted) {
          setLoadingFirebase(false);
        }
      });
    }

    return () => {
      isMounted = false;
      if (unsubscribe) unsubscribe();
    };
  }, [viewMode, month, year, quarterChoice, fromMonth, fromYear, toMonth, toYear, unitConfig.unitName]);

  // Manual Save Handler
  const handleSave = async () => {
    if (user?.role === 'VIEWER') {
      showToast('Tài khoản Khách xem không có quyền lưu dữ liệu!', 'warning');
      return;
    }
    try {
      setAutoSaveStatus('saving');
      const nowIso = new Date().toISOString();
      const updatedReport: OfficialNcdData = {
        ...reportData,
        lastSavedAt: nowIso
      };

      // Firestore Cloud save ONLY (No localStorage)
      await setDoc(doc(db, 'officialNcdReports', updatedReport.id), updatedReport, { merge: true });

      setReportData(updatedReport);
      setAutoSaveStatus('saved');
      if (viewMode === 'MONTHLY') {
        showToast(`Đã lưu Báo cáo Tháng ${month}/${year} thành công!`, 'success');
      } else {
        showToast(`Đã lưu Báo cáo Quý (${quarterChoice}) ${year} thành công!`, 'success');
      }
    } catch (e) {
      console.error('Save failed', e);
      setAutoSaveStatus('idle');
      showToast('Không thể lưu báo cáo. Vui lòng kiểm tra lại kết nối mạng!', 'error');
    }
  };

  // Clear current numbers to 0
  const handleClearMonth = async () => {
    if (user?.role === 'VIEWER') return;
    const confirmed = await confirmModal({
      title: 'Xác nhận xóa trắng số liệu?',
      message: viewMode === 'MONTHLY'
        ? `Bạn có chắc chắn muốn xóa trắng toàn bộ số liệu báo cáo của Tháng ${month}/${year}?`
        : `Bạn có chắc chắn muốn xóa trắng số liệu Báo cáo Quý (${quarterChoice}) ${year}?`,
      confirmText: 'Xóa trắng',
      cancelText: 'Hủy bỏ',
      type: 'danger'
    });

    if (confirmed) {
      const resetReport = createEmptyOfficialReport(month, year, reportData.unitName);
      resetReport.id = reportData.id;
      setReportData(resetReport);
      showToast('Đã xóa trắng số liệu', 'warning');
    }
  };

  // Auto comparison helper
  const computeComp = (current: number, prev: number) => {
    if (current > prev) return 'Tăng +';
    if (current < prev) return 'Giảm -';
    return 'Không';
  };

  // Generic value update handler
  const handleNestedChange = (
    section: 'tha' | 'dtd' | 'cancer' | 'iod',
    field: string,
    val: string | number
  ) => {
    setReportData(prev => {
      const secData = { ...prev[section] };
      const numVal = typeof val === 'number' ? val : Math.max(0, parseInt(val || '0', 10));
      (secData as any)[field] = isNaN(numVal) ? 0 : numVal;

      if (field.startsWith('m') && !field.includes('_cum') && !field.includes('_prevYear') && !field.includes('_comp')) {
        const prevField = `${field}_prevYear`;
        const compField = `${field}_comp`;
        const prevVal = (secData as any)[prevField] || 0;
        (secData as any)[compField] = computeComp(numVal, prevVal);
      }

      return {
        ...prev,
        [section]: secData
      };
    });
  };


  const loadPreviousCancerData = async () => {
    try {
      let prevMonth = month - 1;
      let prevYear = year;
      if (prevMonth === 0) {
        prevMonth = 12;
        prevYear -= 1;
      }
      const prevId = `ncd_${prevYear}_${prevMonth.toString().padStart(2, '0')}`;
      const docRef = doc(db, 'officialNcdReports', prevId);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const prevData = snap.data() as any;
        if (prevData.cancerDetails || prevData.cancer) {
          setReportData((prev: any) => ({
            ...prev,
            cancer: prevData.cancer || prev.cancer,
            cancerDetails: prevData.cancerDetails || prev.cancerDetails
          }));
          showToast(`Đã tải dữ liệu ung thư từ tháng ${prevMonth}/${prevYear}`, 'success');
        } else {
          showToast(`Tháng ${prevMonth}/${prevYear} chưa có dữ liệu ung thư`, 'warning');
        }
      } else {
         showToast(`Không tìm thấy dữ liệu tháng ${prevMonth}/${prevYear}`, 'warning');
      }
    } catch (e) {
      console.error(e);
      showToast('Lỗi khi tải dữ liệu tháng trước', 'error');
    }
  };

  const handleCompChange = (
    section: 'tha' | 'dtd' | 'cancer' | 'iod',
    field: string,
    textVal: string
  ) => {
    setReportData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: textVal
      }
    }));
  };

  // Export Excel handler
  const handleExportExcel = () => {
    if (viewMode === 'MONTHLY') {
      exportOfficialNcdToExcel(reportData);
      showToast(`Đã xuất tập tin Excel Báo cáo Tháng ${month}/${year}`, 'success');
    } else {
      const title = `${unitConfig.unitName.toUpperCase()} - BÁO CÁO PHÒNG CHỐNG BỆNH KHÔNG LÂY NHIỄM (NCD) ${getQuarterDisplayText(quarterType, quarterChoice, year)}`;
      const periodText = `Báo cáo Quý (${quarterChoice}) - Lần lưu gần nhất: ${reportData.lastSavedAt ? new Date(reportData.lastSavedAt).toLocaleString('vi-VN') : 'Tự động tổng hợp'}`;
      const fileName = `Bao_Cao_NCD_Quy_${quarterType}_${quarterChoice}_${year}.xlsx`;

      exportOfficialNcdToExcel(reportData, {
        isQuarterly: true,
        customTitle: title,
        periodText,
        fileName
      });
      showToast(`Đã xuất tập tin Excel Báo cáo Quý (${quarterChoice}) ${year}`, 'success');
    }
  };

  // Print view handler
  const handlePrint = () => {
    window.print();
  };

  const tt23 = reportData.tt23 || {
    k1_approvedTech: 85, k1_actualTech: 62, k1_approvedTech_prevYear: 80, k1_approvedTech_comp: 'Không',
    k2_essentialDrugs: 150, k2_actualDrugs: 110, k2_essentialDrugs_prevYear: 140, k2_essentialDrugs_comp: 'Không',
    k3_ncdEssentialDrugs: 20, k3_actualNcdDrugs: 16, k3_ncdEssentialDrugs_prevYear: 18, k3_ncdEssentialDrugs_comp: 'Không',
    k4_totalEquip: 12, k4_goodEquip: 9, k4_totalEquip_prevYear: 11, k4_totalEquip_comp: 'Không',
  };

  // Warning logic for Requirement 2: "Chưa nhập ngay" & Mismatch checks
  const annexMacSum = CANCER_TYPES.reduce((acc, t) => acc + (Number(reportData.cancerDetails?.[t]?.mac) || 0), 0);
  const annexChetSum = CANCER_TYPES.reduce((acc, t) => acc + (Number(reportData.cancerDetails?.[t]?.chet) || 0), 0);
  const annexNgungSum = CANCER_TYPES.reduce((acc, t) => acc + (Number(reportData.cancerDetails?.[t]?.ngungDieuTri) || 0), 0);
  const annexQuanLySum = CANCER_TYPES.reduce((acc, t) => acc + (Number(reportData.cancerDetails?.[t]?.quanLyHienTai) || 0), 0);

  const mainMac = reportData.cancer?.m1_newCase || 0;
  const mainChet = reportData.cancer?.m3_death || 0;
  const mainNgung = reportData.cancer?.m4_stopTreat || 0;
  const mainQuanLy = reportData.cancer?.m5_currentManaged || 0;

  const isDiffMac = mainMac !== annexMacSum;
  const isDiffChet = mainChet !== annexChetSum;
  const isDiffNgung = mainNgung !== annexNgungSum;
  const isDiffQuanLy = mainQuanLy !== annexQuanLySum;

  const totalAnnexCases = annexMacSum + annexChetSum + annexNgungSum + annexQuanLySum;
  const hasAnnexData = totalAnnexCases > 0 || CANCER_TYPES.some(type => (reportData.cancerDetails?.[type]?.note || '').trim() !== '');

  const totalMainCancerCases = mainMac + mainChet + mainNgung + mainQuanLy;
  const hasMainCancerData = totalMainCancerCases > 0;

  // Annex entered BUT main report section is empty or unpopulated
  const isMissingMainReportWarning = hasAnnexData && (!hasMainCancerData || !reportData.lastSavedAt);

  // Main report entered BUT Annex is empty
  const isMissingAnnexWarning = hasMainCancerData && !hasAnnexData;

  // Exact mismatch warning requested by user
  const hasMismatchWarning = (isDiffMac || isDiffChet || isDiffNgung || isDiffQuanLy) && (hasMainCancerData || hasAnnexData);

  return (
    <div className="space-y-6 pb-16">
      {/* View Mode Selector Tabs (Hidden on Print) */}
      <div className="print:hidden bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center gap-2">
        <button
          onClick={() => setViewMode(prev => prev === 'CUSTOM_RANGE' ? defaultViewMode : 'CUSTOM_RANGE')}
          className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
            viewMode === 'CUSTOM_RANGE'
              ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <CalendarDays className="w-4 h-4" />
          <span>{viewMode === 'CUSTOM_RANGE' ? 'Quay lại chế độ xem chuẩn' : 'Chế độ: Từ tháng đến tháng (Không cộng dồn)'}</span>
        </button>
      </div>

      {/* Month / Quarter / Custom Range Filter Bar (Hidden on Print) */}
      {viewMode === 'MONTHLY' ? (
        <div className="print:hidden bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-rose-500" />
              <span>Chọn Tháng báo cáo</span>
            </label>
            <select
              value={month}
              onChange={e => setMonth(parseInt(e.target.value, 10))}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 outline-none"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                <option key={m} value={m}>Tháng {m.toString().padStart(2, '0')}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-rose-500" />
              <span>Chọn Năm báo cáo</span>
            </label>
            <select
              value={year}
              onChange={e => setYear(parseInt(e.target.value, 10))}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 outline-none"
            >
              {[2024, 2025, 2026, 2027, 2028].map(y => (
                <option key={y} value={y}>Năm {y}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-rose-500" />
              <span>Tên Trạm Y tế / Đơn vị</span>
            </label>
            <input
              type="text"
              value={reportData.unitName}
              disabled
              readOnly
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/80 text-xs font-bold text-slate-500 dark:text-slate-400 cursor-not-allowed outline-none"
              title="Tên Trạm Y tế đã cố định, không được chỉnh sửa"
            />
          </div>
        </div>
      ) : viewMode === 'QUARTERLY' ? (
        <div className="print:hidden bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <CalendarDays className="w-3.5 h-3.5 text-rose-500" />
                <span>Chọn Quý</span>
              </label>
              <select
                value={quarterChoice}
                onChange={e => setQuarterChoice(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 outline-none"
              >
                <option value="Q1">Quý 1 (Tháng 1 - Tháng 3)</option>
                <option value="Q2">Quý 2 (Tháng 4 - Tháng 6)</option>
                <option value="Q3">Quý 3 (Tháng 7 - Tháng 9)</option>
                <option value="Q4">Quý 4 (Tháng 10 - Tháng 12)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-rose-500" />
                <span>Năm báo cáo</span>
              </label>
              <select
                value={year}
                onChange={e => setYear(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 outline-none"
              >
                {[2024, 2025, 2026, 2027, 2028].map(y => (
                  <option key={y} value={y}>Năm {y}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-rose-500" />
                <span>Tên Trạm Y tế / Đơn vị</span>
              </label>
              <input
                type="text"
                value={reportData.unitName}
                disabled
                readOnly
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/80 text-xs font-bold text-slate-500 dark:text-slate-400 cursor-not-allowed outline-none"
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="print:hidden bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-rose-500" />
              <span>Từ tháng / năm</span>
            </label>
            <div className="flex gap-2">
              <select
                value={fromMonth}
                onChange={e => setFromMonth(parseInt(e.target.value, 10))}
                className="w-1/2 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 outline-none"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                  <option key={m} value={m}>Tháng {m}</option>
                ))}
              </select>
              <select
                value={fromYear}
                onChange={e => setFromYear(parseInt(e.target.value, 10))}
                className="w-1/2 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 outline-none"
              >
                {[2024, 2025, 2026, 2027, 2028].map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <CalendarDays className="w-3.5 h-3.5 text-rose-500" />
              <span>Đến tháng / năm</span>
            </label>
            <div className="flex gap-2">
              <select
                value={toMonth}
                onChange={e => setToMonth(parseInt(e.target.value, 10))}
                className="w-1/2 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 outline-none"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                  <option key={m} value={m}>Tháng {m}</option>
                ))}
              </select>
              <select
                value={toYear}
                onChange={e => setToYear(parseInt(e.target.value, 10))}
                className="w-1/2 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 outline-none"
              >
                {[2024, 2025, 2026, 2027, 2028].map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-rose-500" />
              <span>Đơn vị báo cáo</span>
            </label>
            <input
              type="text"
              value={reportData.unitName}
              disabled
              readOnly
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/80 text-xs font-bold text-slate-500 dark:text-slate-400 cursor-not-allowed outline-none"
            />
          </div>
        </div>
      )}

      {/* Mismatch Warning Banner for Requirement 2 */}
      {viewMode === 'MONTHLY' && hasMismatchWarning && (
        <div className="print:hidden bg-amber-50 dark:bg-amber-950/80 border-2 border-amber-500 dark:border-amber-600 p-4 rounded-2xl space-y-3 shadow-xl animate-in fade-in duration-300">
          <div className="flex items-center gap-2.5 pb-2 border-b border-amber-200 dark:border-amber-800/80">
            <div className="p-2 rounded-xl bg-amber-500 text-white shrink-0 shadow-sm">
              <AlertCircle className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-amber-950 dark:text-amber-100">
                Cảnh báo: Phát hiện chênh lệch số liệu giữa Báo cáo chính và Phụ lục Ung thư (Tháng {month}/{year})
              </h4>
              <p className="text-xs text-amber-800 dark:text-amber-300">
                Vui lòng bấm nút di chuyển để kiểm tra và điều chỉnh ô số liệu chưa khớp bên dưới.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {isDiffMac && (
              <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border-2 border-amber-400 dark:border-amber-700 shadow-sm space-y-2">
                <div className="flex items-center gap-2 text-amber-950 dark:text-amber-100 font-extrabold text-xs">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Cảnh báo: Lệch số bệnh nhân phát hiện mới trong kỳ</span>
                </div>
                <div className="p-2.5 rounded-xl bg-amber-50/90 dark:bg-amber-950/50 text-xs text-amber-950 dark:text-amber-100 font-semibold flex items-center justify-between gap-2 border border-amber-200 dark:border-amber-800">
                  <span>Số Báo cáo chính: <strong className="text-rose-700 dark:text-rose-300 font-black">{mainMac} ca</strong></span>
                  <span className="text-amber-600 font-bold">và</span>
                  <span>Số Phụ lục Ung thư: <strong className="text-rose-700 dark:text-rose-300 font-black">{annexMacSum} ca</strong></span>
                </div>
                <div className="flex items-center justify-end gap-2 pt-1 flex-wrap">
                  <button
                    onClick={() => {
                      setActiveReportTab('all');
                      setTimeout(() => {
                        document.getElementById('main-cancer-m1')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }, 100);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/60 dark:hover:bg-amber-900 text-amber-950 dark:text-amber-100 font-bold text-xs transition-all flex items-center gap-1.5 border border-amber-300 dark:border-amber-700 shadow-xs"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Di chuyển đến ô Báo cáo chính</span>
                  </button>
                  <button
                    onClick={() => {
                      setActiveReportTab('cancer');
                      setTimeout(() => {
                        document.getElementById('cancer-annex-table')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }, 100);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-all flex items-center gap-1.5 shadow-sm"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Di chuyển đến Phụ lục</span>
                  </button>
                </div>
              </div>
            )}

            {isDiffChet && (
              <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border-2 border-amber-400 dark:border-amber-700 shadow-sm space-y-2">
                <div className="flex items-center gap-2 text-amber-950 dark:text-amber-100 font-extrabold text-xs">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Cảnh báo: Lệch số ca tử vong do Ung thư</span>
                </div>
                <div className="p-2.5 rounded-xl bg-amber-50/90 dark:bg-amber-950/50 text-xs text-amber-950 dark:text-amber-100 font-semibold flex items-center justify-between gap-2 border border-amber-200 dark:border-amber-800">
                  <span>Số Báo cáo chính: <strong className="text-rose-700 dark:text-rose-300 font-black">{mainChet} ca</strong></span>
                  <span className="text-amber-600 font-bold">và</span>
                  <span>Số Phụ lục Ung thư: <strong className="text-rose-700 dark:text-rose-300 font-black">{annexChetSum} ca</strong></span>
                </div>
                <div className="flex items-center justify-end gap-2 pt-1 flex-wrap">
                  <button
                    onClick={() => {
                      setActiveReportTab('all');
                      setTimeout(() => {
                        document.getElementById('main-cancer-m3')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }, 100);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/60 dark:hover:bg-amber-900 text-amber-950 dark:text-amber-100 font-bold text-xs transition-all flex items-center gap-1.5 border border-amber-300 dark:border-amber-700 shadow-xs"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Di chuyển đến ô Báo cáo chính</span>
                  </button>
                  <button
                    onClick={() => {
                      setActiveReportTab('cancer');
                      setTimeout(() => {
                        document.getElementById('cancer-annex-table')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }, 100);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-all flex items-center gap-1.5 shadow-sm"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Di chuyển đến Phụ lục</span>
                  </button>
                </div>
              </div>
            )}

            {isDiffNgung && (
              <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border-2 border-amber-400 dark:border-amber-700 shadow-sm space-y-2">
                <div className="flex items-center gap-2 text-amber-950 dark:text-amber-100 font-extrabold text-xs">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Cảnh báo: Lệch số ca không tiếp tục điều trị</span>
                </div>
                <div className="p-2.5 rounded-xl bg-amber-50/90 dark:bg-amber-950/50 text-xs text-amber-950 dark:text-amber-100 font-semibold flex items-center justify-between gap-2 border border-amber-200 dark:border-amber-800">
                  <span>Số Báo cáo chính: <strong className="text-rose-700 dark:text-rose-300 font-black">{mainNgung} ca</strong></span>
                  <span className="text-amber-600 font-bold">và</span>
                  <span>Số Phụ lục Ung thư: <strong className="text-rose-700 dark:text-rose-300 font-black">{annexNgungSum} ca</strong></span>
                </div>
                <div className="flex items-center justify-end gap-2 pt-1 flex-wrap">
                  <button
                    onClick={() => {
                      setActiveReportTab('all');
                      setTimeout(() => {
                        document.getElementById('main-cancer-m4')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }, 100);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/60 dark:hover:bg-amber-900 text-amber-950 dark:text-amber-100 font-bold text-xs transition-all flex items-center gap-1.5 border border-amber-300 dark:border-amber-700 shadow-xs"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Di chuyển đến ô Báo cáo chính</span>
                  </button>
                  <button
                    onClick={() => {
                      setActiveReportTab('cancer');
                      setTimeout(() => {
                        document.getElementById('cancer-annex-table')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }, 100);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-all flex items-center gap-1.5 shadow-sm"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Di chuyển đến Phụ lục</span>
                  </button>
                </div>
              </div>
            )}

            {isDiffQuanLy && (
              <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border-2 border-amber-400 dark:border-amber-700 shadow-sm space-y-2">
                <div className="flex items-center gap-2 text-amber-950 dark:text-amber-100 font-extrabold text-xs">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Cảnh báo: Lệch tổng số bệnh nhân quản lý hiện tại</span>
                </div>
                <div className="p-2.5 rounded-xl bg-amber-50/90 dark:bg-amber-950/50 text-xs text-amber-950 dark:text-amber-100 font-semibold flex items-center justify-between gap-2 border border-amber-200 dark:border-amber-800">
                  <span>Số Báo cáo chính: <strong className="text-rose-700 dark:text-rose-300 font-black">{mainQuanLy} ca</strong></span>
                  <span className="text-amber-600 font-bold">và</span>
                  <span>Số Phụ lục Ung thư: <strong className="text-rose-700 dark:text-rose-300 font-black">{annexQuanLySum} ca</strong></span>
                </div>
                <div className="flex items-center justify-end gap-2 pt-1 flex-wrap">
                  <button
                    onClick={() => {
                      setActiveReportTab('all');
                      setTimeout(() => {
                        document.getElementById('main-cancer-m5')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }, 100);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/60 dark:hover:bg-amber-900 text-amber-950 dark:text-amber-100 font-bold text-xs transition-all flex items-center gap-1.5 border border-amber-300 dark:border-amber-700 shadow-xs"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Di chuyển đến ô Báo cáo chính</span>
                  </button>
                  <button
                    onClick={() => {
                      setActiveReportTab('cancer');
                      setTimeout(() => {
                        document.getElementById('cancer-annex-table')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }, 100);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-all flex items-center gap-1.5 shadow-sm"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Di chuyển đến Phụ lục</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {viewMode === 'MONTHLY' && isMissingAnnexWarning && (
        <div className="print:hidden bg-rose-50 dark:bg-rose-950/60 border-2 border-rose-400 dark:border-rose-700 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md animate-in fade-in duration-300">
          <div className="flex items-start sm:items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-600 text-white shrink-0 mt-0.5 sm:mt-0 shadow-sm">
              <AlertCircle className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-rose-600 text-white uppercase tracking-wider animate-pulse shadow-sm">
                  Chưa nhập ngay
                </span>
                <h4 className="text-xs sm:text-sm font-bold text-rose-900 dark:text-rose-200">
                  Cảnh báo: Báo cáo chính Tháng {month}/{year} có số liệu Ung thư nhưng CHƯA NHẬP Phụ lục!
                </h4>
              </div>
              <p className="text-xs text-rose-800 dark:text-rose-300 mt-1 leading-relaxed">
                Báo cáo chính ghi nhận {totalMainCancerCases} ca Ung thư, nhưng danh sách Phụ lục chi tiết theo từng loại bệnh chưa được nhập.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveReportTab('cancer')}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shrink-0 shadow-md shadow-rose-600/30 transition-all text-center"
          >
            Mở Phụ lục nhập ngay
          </button>
        </div>
      )}

      {/* Main Section Header Card */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400">
            <Table className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              {viewMode === 'MONTHLY'
                ? `BÁO CÁO PHÒNG CHỐNG BỆNH KHÔNG LÂY NHIỄM THÁNG ${month.toString().padStart(2, '0')}/${year}`
                : `BÁO CÁO PHÒNG CHỐNG BỆNH KHÔNG LÂY NHIỄM ${getQuarterDisplayText(quarterType, quarterChoice, year)}`}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Đơn vị báo cáo: <span className="font-semibold text-slate-700 dark:text-slate-300">{reportData.unitName}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Cumulative Rules Info Banner for Quarterly/Range Mode */}
      {viewMode === 'QUARTERLY' && (
        <div className="bg-amber-50 dark:bg-amber-950/40 p-3.5 rounded-2xl border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5 shadow-sm">
          <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div>
            <strong className="font-bold text-amber-950 dark:text-amber-100">Quy tắc số liệu cộng dồn Quý ({quarterChoice}/{year}):</strong>
            <p className="mt-0.5 leading-relaxed text-[11px] text-amber-800 dark:text-amber-300">
              Số liệu phát sinh trong kỳ được tính tổng 3 tháng. Các cột <strong>"Cộng dồn"</strong> (lũy kế, số bệnh nhân đang quản lý) được chốt tự động từ tháng cuối cùng của Quý (<strong>Tháng {quarterChoice === 'Q1' ? '03' : quarterChoice === 'Q2' ? '06' : quarterChoice === 'Q3' ? '09' : '12'}/{year}</strong>), không cộng dồn chồng lấp giữa các tháng.
            </p>
          </div>
        </div>
      )}
      {viewMode === 'CUSTOM_RANGE' && (
        <div className="bg-amber-50 dark:bg-amber-950/40 p-3.5 rounded-2xl border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5 shadow-sm">
          <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div>
            <strong className="font-bold text-amber-950 dark:text-amber-100">Ghi chú số liệu cộng dồn giai đoạn:</strong>
            <p className="mt-0.5 leading-relaxed text-[11px] text-amber-800 dark:text-amber-300">
              Số liệu cộng dồn được chốt theo dữ liệu snapshot của tháng cuối cùng trong kỳ chọn (<strong>Tháng {toMonth.toString().padStart(2, '0')}/{toYear}</strong>).
            </p>
          </div>
        </div>
      )}

      {activeReportTab === 'copd' && (
        <UnimplementedReportPlaceholder
          title="BÁO CÁO CHƯƠNG TRÌNH PHÒNG CHỐNG COPD VÀ HEN PHẾ QUẢN"
          icon={Stethoscope}
          color="emerald"
        />
      )}

      {activeReportTab === 'tt23' && (
        <UnimplementedReportPlaceholder
          title="BÁO CÁO PHÒNG CHỐNG BỆNH KHÔNG LÂY NHIỄM THEO THÔNG TƯ 23/2022/TT-BYT"
          icon={Table}
          color="amber"
        />
      )}

      {/* --- SECTION 6: TĂNG HUYẾT ÁP --- */}
      <div className={`bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden ${
        activeReportTab === 'all' || activeReportTab === 'tha' ? 'block' : 'hidden print:block'
      }`}>
        <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
            6. PHÒNG, CHỐNG TĂNG HUYẾT ÁP (THA)
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[800px]">
            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-2.5 px-3 text-center w-12 border-r border-slate-200 dark:border-slate-700">TT</th>
                <th className="py-2.5 px-3 min-w-[260px] border-r border-slate-200 dark:border-slate-700">Nội dung báo cáo</th>
                <th className="py-2.5 px-3 text-right w-28 border-r border-slate-200 dark:border-slate-700">
                  {viewMode === 'MONTHLY' ? `Tháng ${month}/${year}` : `Trong Quý (${quarterChoice})`}
                </th>
                <th className="py-2.5 px-3 text-right min-w-[110px] border-r border-slate-200 dark:border-slate-700">
                  <div>Cộng dồn</div>
                  {viewMode === 'QUARTERLY' && (
                    <div className="text-[10px] font-normal text-amber-700 dark:text-amber-300">
                      (Đến T{quarterChoice === 'Q1' ? '03' : quarterChoice === 'Q2' ? '06' : quarterChoice === 'Q3' ? '09' : '12'}/{year})
                    </div>
                  )}
                  {viewMode === 'CUSTOM_RANGE' && (
                    <div className="text-[10px] font-normal text-amber-700 dark:text-amber-300">
                      (Đến T{toMonth.toString().padStart(2, '0')}/{toYear})
                    </div>
                  )}
                </th>
                <th className="py-2.5 px-3 text-right w-28 border-r border-slate-200 dark:border-slate-700">
                  {viewMode === 'MONTHLY' ? `Tháng ${month}/${year - 1}` : `Cùng kỳ năm trước`}
                </th>
                <th className="py-2.5 px-3 text-center w-32">So sánh cùng kỳ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {/* Row 1 */}
              <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <td className="py-2 px-3 text-center font-semibold border-r border-slate-200 dark:border-slate-800">1</td>
                <td className="py-2 px-3 border-r border-slate-200 dark:border-slate-800">Tổng số bệnh nhân THA được phát hiện mới trong tháng</td>
                <td className="py-1 px-2 border-r border-slate-200 dark:border-slate-800">
                  <NumInput
                    value={reportData.tha.m1_newCase}
                    onChange={val => handleNestedChange('tha', 'm1_newCase', val)}
                    highlight
                  />
                </td>
                <td className="py-1 px-2 border-r border-slate-200 dark:border-slate-800">
                  <NumInput
                    value={reportData.tha.m1_newCase_cum}
                    onChange={val => handleNestedChange('tha', 'm1_newCase_cum', val)}
                  />
                </td>
                <td className="py-1 px-2 border-r border-slate-200 dark:border-slate-800">
                  <NumInput
                    value={reportData.tha.m1_newCase_prevYear}
                    onChange={val => handleNestedChange('tha', 'm1_newCase_prevYear', val)}
                  />
                </td>
                <td className="py-1 px-2 text-center">
                  <CompSelect
                    value={reportData.tha.m1_newCase_comp}
                    onChange={val => handleCompChange('tha', 'm1_newCase_comp', val)}
                  />
                </td>
              </tr>

              {/* Row 2 */}
              <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <td className="py-2 px-3 text-center font-semibold border-r border-slate-200 dark:border-slate-800">2</td>
                <td className="py-2 px-3 border-r border-slate-200 dark:border-slate-800">Tổng số bệnh nhân THA cũ quay lại điều trị</td>
                <td className="py-1 px-2 border-r border-slate-200 dark:border-slate-800">
                  <NumInput
                    value={reportData.tha.m2_reTreat}
                    onChange={val => handleNestedChange('tha', 'm2_reTreat', val)}
                  />
                </td>
                <td className="py-1 px-2 border-r border-slate-200 dark:border-slate-800">
                  <NumInput
                    value={reportData.tha.m2_reTreat_cum}
                    onChange={val => handleNestedChange('tha', 'm2_reTreat_cum', val)}
                  />
                </td>
                <td className="py-1 px-2 border-r border-slate-200 dark:border-slate-800">
                  <NumInput
                    value={reportData.tha.m2_reTreat_prevYear}
                    onChange={val => handleNestedChange('tha', 'm2_reTreat_prevYear', val)}
                  />
                </td>
                <td className="py-1 px-2 text-center">
                  <CompSelect
                    value={reportData.tha.m2_reTreat_comp}
                    onChange={val => handleCompChange('tha', 'm2_reTreat_comp', val)}
                  />
                </td>
              </tr>

              {/* Row 3 */}
              <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <td className="py-2 px-3 text-center font-semibold border-r border-slate-200 dark:border-slate-800">3</td>
                <td className="py-2 px-3 border-r border-slate-200 dark:border-slate-800">Số ca tử vong do bệnh THA</td>
                <td className="py-1 px-2 border-r border-slate-200 dark:border-slate-800">
                  <NumInput
                    value={reportData.tha.m3_death}
                    onChange={val => handleNestedChange('tha', 'm3_death', val)}
                  />
                </td>
                <td className="py-1 px-2 border-r border-slate-200 dark:border-slate-800">
                  <NumInput
                    value={reportData.tha.m3_death_cum}
                    onChange={val => handleNestedChange('tha', 'm3_death_cum', val)}
                  />
                </td>
                <td className="py-1 px-2 border-r border-slate-200 dark:border-slate-800">
                  <NumInput
                    value={reportData.tha.m3_death_prevYear}
                    onChange={val => handleNestedChange('tha', 'm3_death_prevYear', val)}
                  />
                </td>
                <td className="py-1 px-2 text-center">
                  <CompSelect
                    value={reportData.tha.m3_death_comp}
                    onChange={val => handleCompChange('tha', 'm3_death_comp', val)}
                  />
                </td>
              </tr>

              {/* Row 4 */}
              <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <td className="py-2 px-3 text-center font-semibold border-r border-slate-200 dark:border-slate-800">4</td>
                <td className="py-2 px-3 border-r border-slate-200 dark:border-slate-800">Số bệnh nhân THA không tiếp tục tham gia điều trị</td>
                <td className="py-1 px-2 border-r border-slate-200 dark:border-slate-800">
                  <NumInput
                    value={reportData.tha.m4_stopTreat}
                    onChange={val => handleNestedChange('tha', 'm4_stopTreat', val)}
                  />
                </td>
                <td className="py-1 px-2 border-r border-slate-200 dark:border-slate-800">
                  <NumInput
                    value={reportData.tha.m4_stopTreat_cum}
                    onChange={val => handleNestedChange('tha', 'm4_stopTreat_cum', val)}
                  />
                </td>
                <td className="py-1 px-2 border-r border-slate-200 dark:border-slate-800">
                  <NumInput
                    value={reportData.tha.m4_stopTreat_prevYear}
                    onChange={val => handleNestedChange('tha', 'm4_stopTreat_prevYear', val)}
                  />
                </td>
                <td className="py-1 px-2 text-center">
                  <CompSelect
                    value={reportData.tha.m4_stopTreat_comp}
                    onChange={val => handleCompChange('tha', 'm4_stopTreat_comp', val)}
                  />
                </td>
              </tr>

              {/* Row 5 */}
              <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors bg-slate-50/50 dark:bg-slate-800/30">
                <td className="py-2 px-3 text-center font-bold border-r border-slate-200 dark:border-slate-800">5</td>
                <td className="py-2 px-3 font-bold border-r border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white">Tổng số bệnh nhân THA được quản lý hiện tại</td>
                <td className="py-1 px-2 border-r border-slate-200 dark:border-slate-800" colSpan={2}>
                  <NumInput
                    value={reportData.tha.m5_currentManaged}
                    onChange={val => handleNestedChange('tha', 'm5_currentManaged', val)}
                    highlight
                    align="center"
                  />
                </td>
                <td className="py-1 px-2 border-r border-slate-200 dark:border-slate-800">
                  <NumInput
                    value={reportData.tha.m5_currentManaged_prevYear}
                    onChange={val => handleNestedChange('tha', 'm5_currentManaged_prevYear', val)}
                  />
                </td>
                <td className="py-1 px-2 text-center">
                  <CompSelect
                    value={reportData.tha.m5_currentManaged_comp}
                    onChange={val => handleCompChange('tha', 'm5_currentManaged_comp', val)}
                  />
                </td>
              </tr>

              {/* Row 6 */}
              <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors bg-slate-50/50 dark:bg-slate-800/30">
                <td className="py-2 px-3 text-center font-bold border-r border-slate-200 dark:border-slate-800">6</td>
                <td className="py-2 px-3 font-bold border-r border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white">Số bệnh nhân THA điều trị đạt huyết áp mục tiêu</td>
                <td className="py-1 px-2 border-r border-slate-200 dark:border-slate-800" colSpan={2}>
                  <NumInput
                    value={reportData.tha.m6_targetBp}
                    onChange={val => handleNestedChange('tha', 'm6_targetBp', val)}
                    highlight
                    align="center"
                  />
                </td>
                <td className="py-1 px-2 border-r border-slate-200 dark:border-slate-800">
                  <NumInput
                    value={reportData.tha.m6_targetBp_prevYear}
                    onChange={val => handleNestedChange('tha', 'm6_targetBp_prevYear', val)}
                  />
                </td>
                <td className="py-1 px-2 text-center">
                  <CompSelect
                    value={reportData.tha.m6_targetBp_comp}
                    onChange={val => handleCompChange('tha', 'm6_targetBp_comp', val)}
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* --- SECTION 7: ĐÁI THÁO ĐƯỜNG --- */}
      <div className={`bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden ${
        activeReportTab === 'all' || activeReportTab === 'dtd' || activeReportTab === 'tt23' ? 'block' : 'hidden print:block'
      }`}>
        <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
            7. PHÒNG, CHỐNG ĐÁI THÁO ĐƯỜNG (ĐTĐ)
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[800px]">
            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-2.5 px-3 text-center w-12 border-r border-slate-200 dark:border-slate-700">TT</th>
                <th className="py-2.5 px-3 min-w-[260px] border-r border-slate-200 dark:border-slate-700">Nội dung báo cáo</th>
                <th className="py-2.5 px-3 text-right w-28 border-r border-slate-200 dark:border-slate-700">
                  {viewMode === 'MONTHLY' ? `Tháng ${month}/${year}` : `Trong Quý (${quarterChoice})`}
                </th>
                <th className="py-2.5 px-3 text-right min-w-[110px] border-r border-slate-200 dark:border-slate-700">
                  <div>Cộng dồn</div>
                  {viewMode === 'QUARTERLY' && (
                    <div className="text-[10px] font-normal text-amber-700 dark:text-amber-300">
                      (Đến T{quarterChoice === 'Q1' ? '03' : quarterChoice === 'Q2' ? '06' : quarterChoice === 'Q3' ? '09' : '12'}/{year})
                    </div>
                  )}
                  {viewMode === 'CUSTOM_RANGE' && (
                    <div className="text-[10px] font-normal text-amber-700 dark:text-amber-300">
                      (Đến T{toMonth.toString().padStart(2, '0')}/{toYear})
                    </div>
                  )}
                </th>
                <th className="py-2.5 px-3 text-right w-28 border-r border-slate-200 dark:border-slate-700">
                  {viewMode === 'MONTHLY' ? `Tháng ${month}/${year - 1}` : `Cùng kỳ năm trước`}
                </th>
                <th className="py-2.5 px-3 text-center w-32">So sánh cùng kỳ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {/* 1 */}
              <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <td className="py-2 px-3 text-center font-semibold border-r border-slate-200 dark:border-slate-800">1</td>
                <td className="py-2 px-3 border-r border-slate-200 dark:border-slate-800">Tổng số BN ĐTĐ được phát hiện mới trong tháng</td>
                <td className="py-1 px-2 border-r border-slate-200 dark:border-slate-800">
                  <NumInput
                    value={reportData.dtd.m1_newCase}
                    onChange={val => handleNestedChange('dtd', 'm1_newCase', val)}
                    highlight
                  />
                </td>
                <td className="py-1 px-2 border-r border-slate-200 dark:border-slate-800">
                  <NumInput
                    value={reportData.dtd.m1_newCase_cum}
                    onChange={val => handleNestedChange('dtd', 'm1_newCase_cum', val)}
                  />
                </td>
                <td className="py-1 px-2 border-r border-slate-200 dark:border-slate-800">
                  <NumInput
                    value={reportData.dtd.m1_newCase_prevYear}
                    onChange={val => handleNestedChange('dtd', 'm1_newCase_prevYear', val)}
                  />
                </td>
                <td className="py-1 px-2 text-center">
                  <CompSelect
                    value={reportData.dtd.m1_newCase_comp}
                    onChange={val => handleCompChange('dtd', 'm1_newCase_comp', val)}
                  />
                </td>
              </tr>

              {/* 2 */}
              <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <td className="py-2 px-3 text-center font-semibold border-r border-slate-200 dark:border-slate-800">2</td>
                <td className="py-2 px-3 border-r border-slate-200 dark:border-slate-800">Tổng số bệnh nhân ĐTĐ cũ quay lại điều trị</td>
                <td className="py-1 px-2 border-r border-slate-200 dark:border-slate-800">
                  <NumInput
                    value={reportData.dtd.m2_reTreat}
                    onChange={val => handleNestedChange('dtd', 'm2_reTreat', val)}
                  />
                </td>
                <td className="py-1 px-2 border-r border-slate-200 dark:border-slate-800">
                  <NumInput
                    value={reportData.dtd.m2_reTreat_cum}
                    onChange={val => handleNestedChange('dtd', 'm2_reTreat_cum', val)}
                  />
                </td>
                <td className="py-1 px-2 border-r border-slate-200 dark:border-slate-800">
                  <NumInput
                    value={reportData.dtd.m2_reTreat_prevYear}
                    onChange={val => handleNestedChange('dtd', 'm2_reTreat_prevYear', val)}
                  />
                </td>
                <td className="py-1 px-2 text-center">
                  <CompSelect
                    value={reportData.dtd.m2_reTreat_comp}
                    onChange={val => handleCompChange('dtd', 'm2_reTreat_comp', val)}
                  />
                </td>
              </tr>

              {/* 3 */}
              <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors bg-slate-50/50 dark:bg-slate-800/30">
                <td className="py-2 px-3 text-center font-bold border-r border-slate-200 dark:border-slate-800">3</td>
                <td className="py-2 px-3 font-bold border-r border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white">Tổng số BN ĐTĐ được quản lý hiện tại</td>
                <td className="py-1 px-2 border-r border-slate-200 dark:border-slate-800" colSpan={2}>
                  <NumInput
                    value={reportData.dtd.m3_currentManaged}
                    onChange={val => handleNestedChange('dtd', 'm3_currentManaged', val)}
                    highlight
                    align="center"
                  />
                </td>
                <td className="py-1 px-2 border-r border-slate-200 dark:border-slate-800">
                  <NumInput
                    value={reportData.dtd.m3_currentManaged_prevYear}
                    onChange={val => handleNestedChange('dtd', 'm3_currentManaged_prevYear', val)}
                  />
                </td>
                <td className="py-1 px-2 text-center">
                  <CompSelect
                    value={reportData.dtd.m3_currentManaged_comp}
                    onChange={val => handleCompChange('dtd', 'm3_currentManaged_comp', val)}
                  />
                </td>
              </tr>

              {/* 4 */}
              <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors bg-slate-50/50 dark:bg-slate-800/30">
                <td className="py-2 px-3 text-center font-bold border-r border-slate-200 dark:border-slate-800">4</td>
                <td className="py-2 px-3 font-bold border-r border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white">Số BN ĐTĐ điều trị duy trì ổn định</td>
                <td className="py-1 px-2 border-r border-slate-200 dark:border-slate-800" colSpan={2}>
                  <NumInput
                    value={reportData.dtd.m4_stableTreat}
                    onChange={val => handleNestedChange('dtd', 'm4_stableTreat', val)}
                    highlight
                    align="center"
                  />
                </td>
                <td className="py-1 px-2 border-r border-slate-200 dark:border-slate-800">
                  <NumInput
                    value={reportData.dtd.m4_stableTreat_prevYear}
                    onChange={val => handleNestedChange('dtd', 'm4_stableTreat_prevYear', val)}
                  />
                </td>
                <td className="py-1 px-2 text-center">
                  <CompSelect
                    value={reportData.dtd.m4_stableTreat_comp}
                    onChange={val => handleCompChange('dtd', 'm4_stableTreat_comp', val)}
                  />
                </td>
              </tr>

              {/* 5 */}
              <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <td className="py-2 px-3 text-center font-semibold border-r border-slate-200 dark:border-slate-800">5</td>
                <td className="py-2 px-3 border-r border-slate-200 dark:border-slate-800">Số ca tử vong do bệnh ĐTĐ</td>
                <td className="py-1 px-2 border-r border-slate-200 dark:border-slate-800">
                  <NumInput
                    value={reportData.dtd.m5_death}
                    onChange={val => handleNestedChange('dtd', 'm5_death', val)}
                  />
                </td>
                <td className="py-1 px-2 border-r border-slate-200 dark:border-slate-800">
                  <NumInput
                    value={reportData.dtd.m5_death_cum}
                    onChange={val => handleNestedChange('dtd', 'm5_death_cum', val)}
                  />
                </td>
                <td className="py-1 px-2 border-r border-slate-200 dark:border-slate-800">
                  <NumInput
                    value={reportData.dtd.m5_death_prevYear}
                    onChange={val => handleNestedChange('dtd', 'm5_death_prevYear', val)}
                  />
                </td>
                <td className="py-1 px-2 text-center">
                  <CompSelect
                    value={reportData.dtd.m5_death_comp}
                    onChange={val => handleCompChange('dtd', 'm5_death_comp', val)}
                  />
                </td>
              </tr>

              {/* 6 */}
              <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <td className="py-2 px-3 text-center font-semibold border-r border-slate-200 dark:border-slate-800">6</td>
                <td className="py-2 px-3 border-r border-slate-200 dark:border-slate-800">Tổng số BN ĐTĐ không tiếp tục tham gia điều trị</td>
                <td className="py-1 px-2 border-r border-slate-200 dark:border-slate-800">
                  <NumInput
                    value={reportData.dtd.m6_stopTreat}
                    onChange={val => handleNestedChange('dtd', 'm6_stopTreat', val)}
                  />
                </td>
                <td className="py-1 px-2 border-r border-slate-200 dark:border-slate-800">
                  <NumInput
                    value={reportData.dtd.m6_stopTreat_cum}
                    onChange={val => handleNestedChange('dtd', 'm6_stopTreat_cum', val)}
                  />
                </td>
                <td className="py-1 px-2 border-r border-slate-200 dark:border-slate-800">
                  <NumInput
                    value={reportData.dtd.m6_stopTreat_prevYear}
                    onChange={val => handleNestedChange('dtd', 'm6_stopTreat_prevYear', val)}
                  />
                </td>
                <td className="py-1 px-2 text-center">
                  <CompSelect
                    value={reportData.dtd.m6_stopTreat_comp}
                    onChange={val => handleCompChange('dtd', 'm6_stopTreat_comp', val)}
                  />
                </td>
              </tr>

              {/* 7 */}
              <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <td className="py-2 px-3 text-center font-semibold border-r border-slate-200 dark:border-slate-800">7</td>
                <td className="py-2 px-3 border-r border-slate-200 dark:border-slate-800">Tổng số BN tiền ĐTĐ được phát hiện trong tháng</td>
                <td className="py-1 px-2 border-r border-slate-200 dark:border-slate-800">
                  <NumInput
                    value={reportData.dtd.m7_prediabetesNew}
                    onChange={val => handleNestedChange('dtd', 'm7_prediabetesNew', val)}
                  />
                </td>
                <td className="py-1 px-2 border-r border-slate-200 dark:border-slate-800">
                  <NumInput
                    value={reportData.dtd.m7_prediabetesNew_cum}
                    onChange={val => handleNestedChange('dtd', 'm7_prediabetesNew_cum', val)}
                  />
                </td>
                <td className="py-1 px-2 border-r border-slate-200 dark:border-slate-800">
                  <NumInput
                    value={reportData.dtd.m7_prediabetesNew_prevYear}
                    onChange={val => handleNestedChange('dtd', 'm7_prediabetesNew_prevYear', val)}
                  />
                </td>
                <td className="py-1 px-2 text-center">
                  <CompSelect
                    value={reportData.dtd.m7_prediabetesNew_comp}
                    onChange={val => handleCompChange('dtd', 'm7_prediabetesNew_comp', val)}
                  />
                </td>
              </tr>

              {/* 8 */}
              <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors bg-slate-50/50 dark:bg-slate-800/30">
                <td className="py-2 px-3 text-center font-bold border-r border-slate-200 dark:border-slate-800">8</td>
                <td className="py-2 px-3 font-bold border-r border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white">Tổng số BN tiền ĐTĐ được quản lý hiện tại</td>
                <td className="py-1 px-2 border-r border-slate-200 dark:border-slate-800" colSpan={2}>
                  <NumInput
                    value={reportData.dtd.m8_prediabetesManaged}
                    onChange={val => handleNestedChange('dtd', 'm8_prediabetesManaged', val)}
                    highlight
                    align="center"
                  />
                </td>
                <td className="py-1 px-2 border-r border-slate-200 dark:border-slate-800">
                  <NumInput
                    value={reportData.dtd.m8_prediabetesManaged_prevYear}
                    onChange={val => handleNestedChange('dtd', 'm8_prediabetesManaged_prevYear', val)}
                  />
                </td>
                <td className="py-1 px-2 text-center">
                  <CompSelect
                    value={reportData.dtd.m8_prediabetesManaged_comp}
                    onChange={val => handleCompChange('dtd', 'm8_prediabetesManaged_comp', val)}
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* --- SECTION 8: UNG THƯ --- */}
      <div className={`bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden ${
        activeReportTab === 'all' || activeReportTab === 'cancer' || activeReportTab === 'tt23' ? 'block' : 'hidden print:block'
      }`}>
        <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
            8. PHÒNG, CHỐNG UNG THƯ
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[800px]">
            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-2.5 px-3 text-center w-12 border-r border-slate-200 dark:border-slate-700">TT</th>
                <th className="py-2.5 px-3 min-w-[260px] border-r border-slate-200 dark:border-slate-700">Nội dung báo cáo</th>
                <th className="py-2.5 px-3 text-right w-28 border-r border-slate-200 dark:border-slate-700">
                  {viewMode === 'MONTHLY' ? `Tháng ${month}/${year}` : `Trong Quý (${quarterChoice})`}
                </th>
                <th className="py-2.5 px-3 text-right min-w-[110px] border-r border-slate-200 dark:border-slate-700">
                  <div>Cộng dồn</div>
                  {viewMode === 'QUARTERLY' && (
                    <div className="text-[10px] font-normal text-amber-700 dark:text-amber-300">
                      (Đến T{quarterChoice === 'Q1' ? '03' : quarterChoice === 'Q2' ? '06' : quarterChoice === 'Q3' ? '09' : '12'}/{year})
                    </div>
                  )}
                  {viewMode === 'CUSTOM_RANGE' && (
                    <div className="text-[10px] font-normal text-amber-700 dark:text-amber-300">
                      (Đến T{toMonth.toString().padStart(2, '0')}/{toYear})
                    </div>
                  )}
                </th>
                <th className="py-2.5 px-3 text-right w-28 border-r border-slate-200 dark:border-slate-700">
                  {viewMode === 'MONTHLY' ? `Tháng ${month}/${year - 1}` : `Cùng kỳ năm trước`}
                </th>
                <th className="py-2.5 px-3 text-center w-32">So sánh cùng kỳ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {/* 1 */}
              <tr id="main-cancer-m1" className={isDiffMac ? 'bg-amber-100/80 dark:bg-amber-950/60 border-2 border-amber-500 dark:border-amber-600 transition-colors' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors'}>
                <td className={`py-2 px-3 text-center border-r border-slate-200 dark:border-slate-800 ${isDiffMac ? 'font-black text-amber-950 dark:text-amber-100' : 'font-semibold'}`}>1</td>
                <td className={`py-2 px-3 border-r border-slate-200 dark:border-slate-800 ${isDiffMac ? 'bg-amber-100 dark:bg-amber-950/80 font-black text-amber-950 dark:text-amber-100' : ''}`}>
                  <div className="flex items-center justify-between gap-2">
                    <span>Tổng số bệnh nhân Ung thư được phát hiện mới trong kỳ</span>
                    {isDiffMac && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-amber-600 text-white shadow-xs shrink-0 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        <span>Chưa khớp Phụ lục ({annexMacSum})</span>
                      </span>
                    )}
                  </div>
                </td>
                <td className="py-1 px-2 border-r border-slate-200 dark:border-slate-800">
                  <NumInput
                    value={reportData.cancer.m1_newCase}
                    onChange={val => handleNestedChange('cancer', 'm1_newCase', val)}
                    mismatch={isDiffMac}
                    highlight={!isDiffMac}
                  />
                </td>
                <td className="py-1 px-2 border-r border-slate-200 dark:border-slate-800">
                  <NumInput
                    value={reportData.cancer.m1_newCase_cum}
                    onChange={val => handleNestedChange('cancer', 'm1_newCase_cum', val)}
                  />
                </td>
                <td className="py-1 px-2 border-r border-slate-200 dark:border-slate-800">
                  <NumInput
                    value={reportData.cancer.m1_newCase_prevYear}
                    onChange={val => handleNestedChange('cancer', 'm1_newCase_prevYear', val)}
                  />
                </td>
                <td className="py-1 px-2 text-center">
                  <CompSelect
                    value={reportData.cancer.m1_newCase_comp}
                    onChange={val => handleCompChange('cancer', 'm1_newCase_comp', val)}
                  />
                </td>
              </tr>

              {/* 2 */}
              <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <td className="py-2 px-3 text-center font-semibold border-r border-slate-200 dark:border-slate-800">2</td>
                <td className="py-2 px-3 border-r border-slate-200 dark:border-slate-800">Tổng số bệnh nhân Ung thư cũ quay lại điều trị</td>
                <td className="py-1 px-2 border-r border-slate-200 dark:border-slate-800">
                  <NumInput
                    value={reportData.cancer.m2_reTreat}
                    onChange={val => handleNestedChange('cancer', 'm2_reTreat', val)}
                  />
                </td>
                <td className="py-1 px-2 border-r border-slate-200 dark:border-slate-800">
                  <NumInput
                    value={reportData.cancer.m2_reTreat_cum}
                    onChange={val => handleNestedChange('cancer', 'm2_reTreat_cum', val)}
                  />
                </td>
                <td className="py-1 px-2 border-r border-slate-200 dark:border-slate-800">
                  <NumInput
                    value={reportData.cancer.m2_reTreat_prevYear}
                    onChange={val => handleNestedChange('cancer', 'm2_reTreat_prevYear', val)}
                  />
                </td>
                <td className="py-1 px-2 text-center">
                  <CompSelect
                    value={reportData.cancer.m2_reTreat_comp}
                    onChange={val => handleCompChange('cancer', 'm2_reTreat_comp', val)}
                  />
                </td>
              </tr>

              {/* 3 */}
              <tr id="main-cancer-m3" className={isDiffChet ? 'bg-amber-100/80 dark:bg-amber-950/60 border-2 border-amber-500 dark:border-amber-600 transition-colors' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors'}>
                <td className={`py-2 px-3 text-center border-r border-slate-200 dark:border-slate-800 ${isDiffChet ? 'font-black text-amber-950 dark:text-amber-100' : 'font-semibold'}`}>3</td>
                <td className={`py-2 px-3 border-r border-slate-200 dark:border-slate-800 ${isDiffChet ? 'bg-amber-100 dark:bg-amber-950/80 font-black text-amber-950 dark:text-amber-100' : ''}`}>
                  <div className="flex items-center justify-between gap-2">
                    <span>Số ca tử vong do Ung thư</span>
                    {isDiffChet && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-amber-600 text-white shadow-xs shrink-0 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        <span>Chưa khớp Phụ lục ({annexChetSum})</span>
                      </span>
                    )}
                  </div>
                </td>
                <td className="py-1 px-2 border-r border-slate-200 dark:border-slate-800">
                  <NumInput
                    value={reportData.cancer.m3_death}
                    onChange={val => handleNestedChange('cancer', 'm3_death', val)}
                    mismatch={isDiffChet}
                  />
                </td>
                <td className="py-1 px-2 border-r border-slate-200 dark:border-slate-800">
                  <NumInput
                    value={reportData.cancer.m3_death_cum}
                    onChange={val => handleNestedChange('cancer', 'm3_death_cum', val)}
                  />
                </td>
                <td className="py-1 px-2 border-r border-slate-200 dark:border-slate-800">
                  <NumInput
                    value={reportData.cancer.m3_death_prevYear}
                    onChange={val => handleNestedChange('cancer', 'm3_death_prevYear', val)}
                  />
                </td>
                <td className="py-1 px-2 text-center">
                  <CompSelect
                    value={reportData.cancer.m3_death_comp}
                    onChange={val => handleCompChange('cancer', 'm3_death_comp', val)}
                  />
                </td>
              </tr>

              {/* 4 */}
              <tr id="main-cancer-m4" className={isDiffNgung ? 'bg-amber-100/80 dark:bg-amber-950/60 border-2 border-amber-500 dark:border-amber-600 transition-colors' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors'}>
                <td className={`py-2 px-3 text-center border-r border-slate-200 dark:border-slate-800 ${isDiffNgung ? 'font-black text-amber-950 dark:text-amber-100' : 'font-semibold'}`}>4</td>
                <td className={`py-2 px-3 border-r border-slate-200 dark:border-slate-800 ${isDiffNgung ? 'bg-amber-100 dark:bg-amber-950/80 font-black text-amber-950 dark:text-amber-100' : ''}`}>
                  <div className="flex items-center justify-between gap-2">
                    <span>Số bệnh nhân Ung thư không tiếp tục tham gia điều trị</span>
                    {isDiffNgung && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-amber-600 text-white shadow-xs shrink-0 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        <span>Chưa khớp Phụ lục ({annexNgungSum})</span>
                      </span>
                    )}
                  </div>
                </td>
                <td className="py-1 px-2 border-r border-slate-200 dark:border-slate-800">
                  <NumInput
                    value={reportData.cancer.m4_stopTreat}
                    onChange={val => handleNestedChange('cancer', 'm4_stopTreat', val)}
                    mismatch={isDiffNgung}
                  />
                </td>
                <td className="py-1 px-2 border-r border-slate-200 dark:border-slate-800">
                  <NumInput
                    value={reportData.cancer.m4_stopTreat_cum}
                    onChange={val => handleNestedChange('cancer', 'm4_stopTreat_cum', val)}
                  />
                </td>
                <td className="py-1 px-2 border-r border-slate-200 dark:border-slate-800">
                  <NumInput
                    value={reportData.cancer.m4_stopTreat_prevYear}
                    onChange={val => handleNestedChange('cancer', 'm4_stopTreat_prevYear', val)}
                  />
                </td>
                <td className="py-1 px-2 text-center">
                  <CompSelect
                    value={reportData.cancer.m4_stopTreat_comp}
                    onChange={val => handleCompChange('cancer', 'm4_stopTreat_comp', val)}
                  />
                </td>
              </tr>

              {/* 5 */}
              <tr id="main-cancer-m5" className={isDiffQuanLy ? 'bg-amber-100/80 dark:bg-amber-950/60 border-2 border-amber-500 dark:border-amber-600 transition-colors' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors bg-purple-50/40 dark:bg-purple-950/20'}>
                <td className={`py-2 px-3 text-center border-r border-slate-200 dark:border-slate-800 ${isDiffQuanLy ? 'font-black text-amber-950 dark:text-amber-100' : 'font-bold text-purple-900 dark:text-purple-300'}`}>5</td>
                <td className={`py-2 px-3 border-r border-slate-200 dark:border-slate-800 ${isDiffQuanLy ? 'bg-amber-100 dark:bg-amber-950/80 font-black text-amber-950 dark:text-amber-100' : 'font-bold text-purple-900 dark:text-purple-300'}`}>
                  <div className="flex items-center justify-between gap-2">
                    <span>Tổng số bệnh nhân Ung thư được quản lý hiện tại</span>
                    {isDiffQuanLy && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-amber-600 text-white shadow-xs shrink-0 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        <span>Chưa khớp Phụ lục ({annexQuanLySum})</span>
                      </span>
                    )}
                  </div>
                </td>
                <td className="py-1 px-2 border-r border-slate-200 dark:border-slate-800" colSpan={2}>
                  <NumInput
                    value={reportData.cancer.m5_currentManaged}
                    onChange={val => handleNestedChange('cancer', 'm5_currentManaged', val)}
                    mismatch={isDiffQuanLy}
                    highlight={!isDiffQuanLy}
                    align="center"
                  />
                </td>
                <td className="py-1 px-2 border-r border-slate-200 dark:border-slate-800">
                  <NumInput
                    value={reportData.cancer.m5_currentManaged_prevYear}
                    onChange={val => handleNestedChange('cancer', 'm5_currentManaged_prevYear', val)}
                  />
                </td>
                <td className="py-1 px-2 text-center">
                  <CompSelect
                    value={reportData.cancer.m5_currentManaged_comp}
                    onChange={val => handleCompChange('cancer', 'm5_currentManaged_comp', val)}
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Cancer Details Appendix */}
        {activeReportTab === 'cancer' && (
          <div className="mt-6 border-t border-slate-200 dark:border-slate-800 pt-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 px-4 gap-3">
            <div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                Phụ lục: Chi tiết bệnh nhân theo loại ung thư
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {viewMode === 'QUARTERLY' ? `Số liệu tổng hợp Quý ${quarterChoice}/${year}` : `Báo cáo Tháng ${month}/${year}`}
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative flex-1 sm:w-48">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Tìm loại ung thư..."
                  value={cancerSearch}
                  onChange={e => setCancerSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:border-rose-500"
                />
              </div>

              <button
                onClick={() => {
                  exportCancerAppendixToExcel(reportData.cancerDetails || {}, CANCER_TYPES, month, year);
                  showToast('Đã xuất Phụ lục Ung thư', 'success');
                }}
                className="px-2.5 py-1.5 text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300 rounded-lg hover:bg-emerald-200 transition-colors shadow-sm border border-emerald-200 dark:border-emerald-800 flex items-center gap-1 shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Excel</span>
              </button>
              <button
                onClick={() => setShowCancerImportModal(true)}
                className="px-2.5 py-1.5 text-xs font-semibold bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300 rounded-lg hover:bg-rose-200 transition-colors shadow-sm border border-rose-200 dark:border-rose-800 flex items-center gap-1 shrink-0"
              >
                <FileUp className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Import</span>
              </button>
              <button
                onClick={loadPreviousCancerData}
                className="px-2.5 py-1.5 text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 rounded-lg hover:bg-blue-200 transition-colors shadow-sm border border-blue-200 dark:border-blue-800 shrink-0"
              >
                Lấy T{month - 1 > 0 ? month - 1 : 12}
              </button>
            </div>
          </div>

          {/* Smooth Scrollable Cancer Appendix Table */}
          <div id="cancer-annex-table" className="overflow-x-auto touch-pan-x touch-pan-y px-4 pb-4">
            <table className="w-full text-left text-xs border-collapse min-w-[700px]">
                <thead className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold border border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="py-2 px-3 border border-slate-200 dark:border-slate-700">Loại ung thư</th>
                    <th className="py-2 px-3 text-center border border-slate-200 dark:border-slate-700">Số Mắc</th>
                    <th className="py-2 px-3 text-center border border-slate-200 dark:border-slate-700">Mắc Tích Lũy</th>
                    <th className="py-2 px-3 text-center border border-slate-200 dark:border-slate-700">Số Chết</th>
                    <th className="py-2 px-3 text-center border border-slate-200 dark:border-slate-700">Chết Tích Lũy</th>
                    <th className="py-2 px-3 text-center border border-slate-200 dark:border-slate-700">Không tiếp tục điều trị</th>
                    <th className="py-2 px-3 text-center border border-slate-200 dark:border-slate-700">Quản lý hiện tại</th>
                    <th className="py-2 px-3 text-center border border-slate-200 dark:border-slate-700">Ghi chú</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 border-b border-l border-r border-slate-200 dark:border-slate-700">
                  {CANCER_TYPES.filter(t => t.toLowerCase().includes(cancerSearch.toLowerCase())).map(type => (
                    <tr key={type} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-1 px-3 border-r border-slate-200 dark:border-slate-800 font-medium whitespace-nowrap">{type}</td>
                      <td className="py-1 px-2 border-r border-slate-200 dark:border-slate-800">
                        <NumInput
                          value={reportData.cancerDetails?.[type]?.mac || 0}
                          onChange={val => {
                            const newDetails = { ...reportData.cancerDetails };
                            if (!newDetails[type]) newDetails[type] = { mac: 0, macTichLuy: 0, chet: 0, chetTichLuy: 0, ngungDieuTri: 0, quanLyHienTai: 0, note: '' };
                            newDetails[type].mac = val;
                            setReportData(prev => ({ ...prev, cancerDetails: newDetails }));
                          }}
                        />
                      </td>
                      <td className="py-1 px-2 border-r border-slate-200 dark:border-slate-800">
                        <NumInput
                          value={reportData.cancerDetails?.[type]?.macTichLuy || 0}
                          onChange={val => {
                            const newDetails = { ...reportData.cancerDetails };
                            if (!newDetails[type]) newDetails[type] = { mac: 0, macTichLuy: 0, chet: 0, chetTichLuy: 0, ngungDieuTri: 0, quanLyHienTai: 0, note: '' };
                            newDetails[type].macTichLuy = val;
                            setReportData(prev => ({ ...prev, cancerDetails: newDetails }));
                          }}
                        />
                      </td>
                      <td className="py-1 px-2 border-r border-slate-200 dark:border-slate-800">
                        <NumInput
                          value={reportData.cancerDetails?.[type]?.chet || 0}
                          onChange={val => {
                            const newDetails = { ...reportData.cancerDetails };
                            if (!newDetails[type]) newDetails[type] = { mac: 0, macTichLuy: 0, chet: 0, chetTichLuy: 0, ngungDieuTri: 0, quanLyHienTai: 0, note: '' };
                            newDetails[type].chet = val;
                            setReportData(prev => ({ ...prev, cancerDetails: newDetails }));
                          }}
                        />
                      </td>
                      <td className="py-1 px-2 border-r border-slate-200 dark:border-slate-800">
                        <NumInput
                          value={reportData.cancerDetails?.[type]?.chetTichLuy || 0}
                          onChange={val => {
                            const newDetails = { ...reportData.cancerDetails };
                            if (!newDetails[type]) newDetails[type] = { mac: 0, macTichLuy: 0, chet: 0, chetTichLuy: 0, ngungDieuTri: 0, quanLyHienTai: 0, note: '' };
                            newDetails[type].chetTichLuy = val;
                            setReportData(prev => ({ ...prev, cancerDetails: newDetails }));
                          }}
                        />
                      </td>
                      <td className="py-1 px-2 border-r border-slate-200 dark:border-slate-800">
                        <NumInput
                          value={reportData.cancerDetails?.[type]?.ngungDieuTri || 0}
                          onChange={val => {
                            const newDetails = { ...reportData.cancerDetails };
                            if (!newDetails[type]) newDetails[type] = { mac: 0, macTichLuy: 0, chet: 0, chetTichLuy: 0, ngungDieuTri: 0, quanLyHienTai: 0, note: '' };
                            newDetails[type].ngungDieuTri = val;
                            setReportData(prev => ({ ...prev, cancerDetails: newDetails }));
                          }}
                        />
                      </td>
                      <td className="py-1 px-2 border-r border-slate-200 dark:border-slate-800">
                        <NumInput
                          value={reportData.cancerDetails?.[type]?.quanLyHienTai || 0}
                          onChange={val => {
                            const newDetails = { ...reportData.cancerDetails };
                            if (!newDetails[type]) newDetails[type] = { mac: 0, macTichLuy: 0, chet: 0, chetTichLuy: 0, ngungDieuTri: 0, quanLyHienTai: 0, note: '' };
                            newDetails[type].quanLyHienTai = val;
                            setReportData(prev => ({ ...prev, cancerDetails: newDetails }));
                          }}
                        />
                      </td>
                      <td className="py-1 px-2 border-slate-200 dark:border-slate-800">
                        <div className="flex items-center gap-1.5 min-w-[140px]">
                          <input
                            type="text"
                            value={reportData.cancerDetails?.[type]?.note || ''}
                            onChange={e => {
                              const newDetails = { ...reportData.cancerDetails };
                              if (!newDetails[type]) newDetails[type] = { mac: 0, macTichLuy: 0, chet: 0, chetTichLuy: 0, ngungDieuTri: 0, quanLyHienTai: 0, note: '' };
                              newDetails[type].note = e.target.value;
                              setReportData(prev => ({ ...prev, cancerDetails: newDetails }));
                            }}
                            placeholder="..."
                            className="w-full px-2 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-rose-500 outline-none truncate"
                          />
                          <button
                            type="button"
                            onClick={() => setSelectedNoteType(type)}
                            title="Bấm để xem chi tiết hoặc viết ghi chú đầy đủ"
                            className={`px-2 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all border flex items-center gap-1 shrink-0 ${
                              reportData.cancerDetails?.[type]?.note?.trim()
                                ? 'bg-rose-100 text-rose-700 border-rose-300 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800 shadow-sm'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                            }`}
                          >
                            <FileText className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                            <span>Xem chi tiết</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>

                <tfoot className="bg-slate-200/90 dark:bg-slate-800 font-extrabold text-slate-900 dark:text-white border-t-2 border-slate-300 dark:border-slate-700">
                  <tr className="bg-rose-50/60 dark:bg-rose-950/40">
                    <td className="py-2.5 px-3 border-r border-slate-200 dark:border-slate-700 uppercase text-rose-700 dark:text-rose-300 font-black">TỔNG CỘNG</td>
                    <td className={`py-2.5 px-3 text-center border-r border-slate-200 dark:border-slate-700 font-bold text-sm ${isDiffMac ? 'bg-amber-200 dark:bg-amber-900/90 text-amber-950 dark:text-amber-100 border-2 border-amber-500 font-black' : 'text-rose-600 dark:text-rose-400'}`}>
                      <div>{annexMacSum}</div>
                      {isDiffMac && <div className="text-[10px] font-black text-rose-700 dark:text-rose-300 mt-0.5">⚠️ Báo cáo: {mainMac}</div>}
                    </td>
                    <td className="py-2.5 px-3 text-center border-r border-slate-200 dark:border-slate-700 font-bold text-sm">
                      {CANCER_TYPES.reduce((acc, type) => acc + (Number(reportData.cancerDetails?.[type]?.macTichLuy) || 0), 0)}
                    </td>
                    <td className={`py-2.5 px-3 text-center border-r border-slate-200 dark:border-slate-700 font-bold text-sm ${isDiffChet ? 'bg-amber-200 dark:bg-amber-900/90 text-amber-950 dark:text-amber-100 border-2 border-amber-500 font-black' : 'text-slate-700 dark:text-slate-300'}`}>
                      <div>{annexChetSum}</div>
                      {isDiffChet && <div className="text-[10px] font-black text-rose-700 dark:text-rose-300 mt-0.5">⚠️ Báo cáo: {mainChet}</div>}
                    </td>
                    <td className="py-2.5 px-3 text-center border-r border-slate-200 dark:border-slate-700 font-bold text-sm text-slate-700 dark:text-slate-300">
                      {CANCER_TYPES.reduce((acc, type) => acc + (Number(reportData.cancerDetails?.[type]?.chetTichLuy) || 0), 0)}
                    </td>
                    <td className={`py-2.5 px-3 text-center border-r border-slate-200 dark:border-slate-700 font-bold text-sm ${isDiffNgung ? 'bg-amber-200 dark:bg-amber-900/90 text-amber-950 dark:text-amber-100 border-2 border-amber-500 font-black' : ''}`}>
                      <div>{annexNgungSum}</div>
                      {isDiffNgung && <div className="text-[10px] font-black text-rose-700 dark:text-rose-300 mt-0.5">⚠️ Báo cáo: {mainNgung}</div>}
                    </td>
                    <td className={`py-2.5 px-3 text-center border-r border-slate-200 dark:border-slate-700 font-black text-sm ${isDiffQuanLy ? 'bg-amber-200 dark:bg-amber-900/90 text-amber-950 dark:text-amber-100 border-2 border-amber-500 font-black' : 'text-rose-600 dark:text-rose-400'}`}>
                      <div>{annexQuanLySum}</div>
                      {isDiffQuanLy && <div className="text-[10px] font-black text-rose-700 dark:text-rose-300 mt-0.5">⚠️ Báo cáo: {mainQuanLy}</div>}
                    </td>
                    <td className="py-2.5 px-3 text-center text-slate-400 dark:text-slate-500 text-[11px] font-normal">
                      (Tự động tính)
                    </td>
                  </tr>
                </tfoot>
            </table>
          </div>
        </div>
      )}
  </div>

      {/* --- SECTION 9: RỐI LOẠN DO THIẾU I-ỐT --- */}
      <div className={`bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden ${
        activeReportTab === 'all' || activeReportTab === 'iod' || activeReportTab === 'tt23' ? 'block' : 'hidden print:block'
      }`}>
        <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
            9. PHÒNG, CHỐNG RỐI LOẠN DO THIẾU I-ỐT (IOD)
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[800px]">
            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-2.5 px-3 text-center w-12 border-r border-slate-200 dark:border-slate-700">TT</th>
                <th className="py-2.5 px-3 min-w-[260px] border-r border-slate-200 dark:border-slate-700">Nội dung báo cáo</th>
                <th className="py-2.5 px-3 text-right w-28 border-r border-slate-200 dark:border-slate-700">
                  {viewMode === 'MONTHLY' ? `Tháng ${month}/${year}` : `Trong Quý (${quarterChoice})`}
                </th>
                <th className="py-2.5 px-3 text-right min-w-[110px] border-r border-slate-200 dark:border-slate-700">
                  <div>Cộng dồn</div>
                  {viewMode === 'QUARTERLY' && (
                    <div className="text-[10px] font-normal text-amber-700 dark:text-amber-300">
                      (Đến T{quarterChoice === 'Q1' ? '03' : quarterChoice === 'Q2' ? '06' : quarterChoice === 'Q3' ? '09' : '12'}/{year})
                    </div>
                  )}
                  {viewMode === 'CUSTOM_RANGE' && (
                    <div className="text-[10px] font-normal text-amber-700 dark:text-amber-300">
                      (Đến T{toMonth.toString().padStart(2, '0')}/{toYear})
                    </div>
                  )}
                </th>
                <th className="py-2.5 px-3 text-right w-28 border-r border-slate-200 dark:border-slate-700">
                  {viewMode === 'MONTHLY' ? `Tháng ${month}/${year - 1}` : `Cùng kỳ năm trước`}
                </th>
                <th className="py-2.5 px-3 text-center w-32">So sánh cùng kỳ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {/* 1 */}
              <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <td className="py-2 px-3 text-center font-bold border-r border-slate-200 dark:border-slate-800">1</td>
                <td className="py-2 px-3 font-bold border-r border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white">Số mẫu muối Iốt kiểm tra</td>
                <td className="py-1 px-2 border-r border-slate-200 dark:border-slate-800">
                  <NumInput value={reportData.iod.m1_saltTested} onChange={val => handleNestedChange('iod', 'm1_saltTested', val)} highlight />
                </td>
                <td className="py-1 px-2 border-r border-slate-200 dark:border-slate-800">
                  <NumInput value={reportData.iod.m1_saltTested_cum} onChange={val => handleNestedChange('iod', 'm1_saltTested_cum', val)} />
                </td>
                <td className="py-1 px-2 border-r border-slate-200 dark:border-slate-800">
                  <NumInput value={reportData.iod.m1_saltTested_prevYear} onChange={val => handleNestedChange('iod', 'm1_saltTested_prevYear', val)} />
                </td>
                <td className="py-1 px-2 text-center">
                  <CompSelect value={reportData.iod.m1_saltTested_comp} onChange={val => handleCompChange('iod', 'm1_saltTested_comp', val)} />
                </td>
              </tr>

              {/* 1.1 */}
              <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <td className="py-2 px-3 text-center italic border-r border-slate-200 dark:border-slate-800">1,1</td>
                <td className="py-2 px-3 pl-6 italic border-r border-slate-200 dark:border-slate-800">Số mẫu kiểm tra đạt chất lượng</td>
                <td className="py-1 px-2 border-r border-slate-200 dark:border-slate-800">
                  <NumInput value={reportData.iod.m1_1_saltPass} onChange={val => handleNestedChange('iod', 'm1_1_saltPass', val)} />
                </td>
                <td className="py-1 px-2 border-r border-slate-200 dark:border-slate-800">
                  <NumInput value={reportData.iod.m1_1_saltPass_cum} onChange={val => handleNestedChange('iod', 'm1_1_saltPass_cum', val)} />
                </td>
                <td className="py-1 px-2 border-r border-slate-200 dark:border-slate-800">
                  <NumInput value={reportData.iod.m1_1_saltPass_prevYear} onChange={val => handleNestedChange('iod', 'm1_1_saltPass_prevYear', val)} />
                </td>
                <td className="py-1 px-2 text-center">
                  <CompSelect value={reportData.iod.m1_1_saltPass_comp} onChange={val => handleCompChange('iod', 'm1_1_saltPass_comp', val)} />
                </td>
              </tr>

              {/* 1.2 */}
              <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <td className="py-2 px-3 text-center italic border-r border-slate-200 dark:border-slate-800">1,2</td>
                <td className="py-2 px-3 pl-6 italic border-r border-slate-200 dark:border-slate-800">Số mẫu kiểm tra không đạt chất lượng</td>
                <td className="py-1 px-2 border-r border-slate-200 dark:border-slate-800">
                  <NumInput value={reportData.iod.m1_2_saltFail} onChange={val => handleNestedChange('iod', 'm1_2_saltFail', val)} />
                </td>
                <td className="py-1 px-2 border-r border-slate-200 dark:border-slate-800">
                  <NumInput value={reportData.iod.m1_2_saltFail_cum} onChange={val => handleNestedChange('iod', 'm1_2_saltFail_cum', val)} />
                </td>
                <td className="py-1 px-2 border-r border-slate-200 dark:border-slate-800">
                  <NumInput value={reportData.iod.m1_2_saltFail_prevYear} onChange={val => handleNestedChange('iod', 'm1_2_saltFail_prevYear', val)} />
                </td>
                <td className="py-1 px-2 text-center">
                  <CompSelect value={reportData.iod.m1_2_saltFail_comp} onChange={val => handleCompChange('iod', 'm1_2_saltFail_comp', val)} />
                </td>
              </tr>

              {/* 2 */}
              <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <td className="py-2 px-3 text-center font-bold border-r border-slate-200 dark:border-slate-800">2</td>
                <td className="py-2 px-3 font-bold border-r border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white">Tỷ lệ % hộ gia đình sử dụng muối I ốt đạt chất lượng</td>
                <td className="py-1 px-2 border-r border-slate-200 dark:border-slate-800">
                  <NumInput value={reportData.iod.m2_householdRatio} onChange={val => handleNestedChange('iod', 'm2_householdRatio', val)} highlight />
                </td>
                <td className="py-1 px-2 border-r border-slate-200 dark:border-slate-800">
                  <NumInput value={reportData.iod.m2_householdRatio_cum} onChange={val => handleNestedChange('iod', 'm2_householdRatio_cum', val)} />
                </td>
                <td className="py-1 px-2 border-r border-slate-200 dark:border-slate-800">
                  <NumInput value={reportData.iod.m2_householdRatio_prevYear} onChange={val => handleNestedChange('iod', 'm2_householdRatio_prevYear', val)} />
                </td>
                <td className="py-1 px-2 text-center">
                  <CompSelect value={reportData.iod.m2_householdRatio_comp} onChange={val => handleCompChange('iod', 'm2_householdRatio_comp', val)} />
                </td>
              </tr>

              {/* 3 */}
              <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <td className="py-2 px-3 text-center font-bold border-r border-slate-200 dark:border-slate-800">3</td>
                <td className="py-2 px-3 font-bold border-r border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white">Tỷ lệ % trẻ 8 - 12 tuổi mắc bệnh Bướu cổ</td>
                <td className="py-1 px-2 border-r border-slate-200 dark:border-slate-800">
                  <NumInput value={reportData.iod.m3_goiterChildRatio} onChange={val => handleNestedChange('iod', 'm3_goiterChildRatio', val)} highlight />
                </td>
                <td className="py-1 px-2 border-r border-slate-200 dark:border-slate-800">
                  <NumInput value={reportData.iod.m3_goiterChildRatio_cum} onChange={val => handleNestedChange('iod', 'm3_goiterChildRatio_cum', val)} />
                </td>
                <td className="py-1 px-2 border-r border-slate-200 dark:border-slate-800">
                  <NumInput value={reportData.iod.m3_goiterChildRatio_prevYear} onChange={val => handleNestedChange('iod', 'm3_goiterChildRatio_prevYear', val)} />
                </td>
                <td className="py-1 px-2 text-center">
                  <CompSelect value={reportData.iod.m3_goiterChildRatio_comp} onChange={val => handleCompChange('iod', 'm3_goiterChildRatio_comp', val)} />
                </td>
              </tr>

              {/* 4 */}
              <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <td className="py-2 px-3 text-center font-bold border-r border-slate-200 dark:border-slate-800">4</td>
                <td className="py-2 px-3 font-bold border-r border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white">Tổng số lượt khám phát hiện bệnh Bướu cổ</td>
                <td className="py-1 px-2 border-r border-slate-200 dark:border-slate-800">
                  <NumInput value={reportData.iod.m4_goiterExamTotal} onChange={val => handleNestedChange('iod', 'm4_goiterExamTotal', val)} highlight />
                </td>
                <td className="py-1 px-2 border-r border-slate-200 dark:border-slate-800">
                  <NumInput value={reportData.iod.m4_goiterExamTotal_cum} onChange={val => handleNestedChange('iod', 'm4_goiterExamTotal_cum', val)} />
                </td>
                <td className="py-1 px-2 border-r border-slate-200 dark:border-slate-800">
                  <NumInput value={reportData.iod.m4_goiterExamTotal_prevYear} onChange={val => handleNestedChange('iod', 'm4_goiterExamTotal_prevYear', val)} />
                </td>
                <td className="py-1 px-2 text-center">
                  <CompSelect value={reportData.iod.m4_goiterExamTotal_comp} onChange={val => handleCompChange('iod', 'm4_goiterExamTotal_comp', val)} />
                </td>
              </tr>

              {/* 5 */}
              <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <td className="py-2 px-3 text-center font-bold border-r border-slate-200 dark:border-slate-800">5</td>
                <td className="py-2 px-3 font-bold border-r border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white">Tổng số bệnh nhân Bướu cổ đơn thuần</td>
                <td className="py-1 px-2 border-r border-slate-200 dark:border-slate-800">
                  <NumInput value={reportData.iod.m5_goiterSimpleTotal} onChange={val => handleNestedChange('iod', 'm5_goiterSimpleTotal', val)} highlight />
                </td>
                <td className="py-1 px-2 border-r border-slate-200 dark:border-slate-800">
                  <NumInput value={reportData.iod.m5_goiterSimpleTotal_cum} onChange={val => handleNestedChange('iod', 'm5_goiterSimpleTotal_cum', val)} />
                </td>
                <td className="py-1 px-2 border-r border-slate-200 dark:border-slate-800">
                  <NumInput value={reportData.iod.m5_goiterSimpleTotal_prevYear} onChange={val => handleNestedChange('iod', 'm5_goiterSimpleTotal_prevYear', val)} />
                </td>
                <td className="py-1 px-2 text-center">
                  <CompSelect value={reportData.iod.m5_goiterSimpleTotal_comp} onChange={val => handleCompChange('iod', 'm5_goiterSimpleTotal_comp', val)} />
                </td>
              </tr>

              {/* 5.1 */}
              <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <td className="py-2 px-3 text-center italic border-r border-slate-200 dark:border-slate-800">5,1</td>
                <td className="py-2 px-3 pl-6 italic border-r border-slate-200 dark:border-slate-800">Trẻ em 8 - 12 tuổi</td>
                <td className="py-1 px-2 border-r border-slate-200 dark:border-slate-800">
                  <NumInput value={reportData.iod.m5_1_goiterChild} onChange={val => handleNestedChange('iod', 'm5_1_goiterChild', val)} />
                </td>
                <td className="py-1 px-2 border-r border-slate-200 dark:border-slate-800">
                  <NumInput value={reportData.iod.m5_1_goiterChild_cum} onChange={val => handleNestedChange('iod', 'm5_1_goiterChild_cum', val)} />
                </td>
                <td className="py-1 px-2 border-r border-slate-200 dark:border-slate-800">
                  <NumInput value={reportData.iod.m5_1_goiterChild_prevYear} onChange={val => handleNestedChange('iod', 'm5_1_goiterChild_prevYear', val)} />
                </td>
                <td className="py-1 px-2 text-center">
                  <CompSelect value={reportData.iod.m5_1_goiterChild_comp} onChange={val => handleCompChange('iod', 'm5_1_goiterChild_comp', val)} />
                </td>
              </tr>

              {/* 5.2 */}
              <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <td className="py-2 px-3 text-center italic border-r border-slate-200 dark:border-slate-800">5,2</td>
                <td className="py-2 px-3 pl-6 italic font-semibold border-r border-slate-200 dark:border-slate-800">Tổng số bệnh nhân được điều trị</td>
                <td className="py-1 px-2 border-r border-slate-200 dark:border-slate-800">
                  <NumInput value={reportData.iod.m5_2_goiterTreated} onChange={val => handleNestedChange('iod', 'm5_2_goiterTreated', val)} highlight />
                </td>
                <td className="py-1 px-2 border-r border-slate-200 dark:border-slate-800">
                  <NumInput value={reportData.iod.m5_2_goiterTreated_cum} onChange={val => handleNestedChange('iod', 'm5_2_goiterTreated_cum', val)} />
                </td>
                <td className="py-1 px-2 border-r border-slate-200 dark:border-slate-800">
                  <NumInput value={reportData.iod.m5_2_goiterTreated_prevYear} onChange={val => handleNestedChange('iod', 'm5_2_goiterTreated_prevYear', val)} />
                </td>
                <td className="py-1 px-2 text-center">
                  <CompSelect value={reportData.iod.m5_2_goiterTreated_comp} onChange={val => handleCompChange('iod', 'm5_2_goiterTreated_comp', val)} />
                </td>
              </tr>

              {/* 6 */}
              <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <td className="py-2 px-3 text-center font-bold border-r border-slate-200 dark:border-slate-800">6</td>
                <td className="py-2 px-3 font-bold border-r border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white">Tổng số bệnh nhân suy giáp</td>
                <td className="py-1 px-2 border-r border-slate-200 dark:border-slate-800">
                  <NumInput value={reportData.iod.m6_hypothyroidism} onChange={val => handleNestedChange('iod', 'm6_hypothyroidism', val)} highlight />
                </td>
                <td className="py-1 px-2 border-r border-slate-200 dark:border-slate-800">
                  <NumInput value={reportData.iod.m6_hypothyroidism_cum} onChange={val => handleNestedChange('iod', 'm6_hypothyroidism_cum', val)} />
                </td>
                <td className="py-1 px-2 border-r border-slate-200 dark:border-slate-800">
                  <NumInput value={reportData.iod.m6_hypothyroidism_prevYear} onChange={val => handleNestedChange('iod', 'm6_hypothyroidism_prevYear', val)} />
                </td>
                <td className="py-1 px-2 text-center">
                  <CompSelect value={reportData.iod.m6_hypothyroidism_comp} onChange={val => handleCompChange('iod', 'm6_hypothyroidism_comp', val)} />
                </td>
              </tr>

              {/* 7 */}
              <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <td className="py-2 px-3 text-center font-bold border-r border-slate-200 dark:border-slate-800">7</td>
                <td className="py-2 px-3 font-bold border-r border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white">Tổng số bệnh nhân viêm giáp</td>
                <td className="py-1 px-2 border-r border-slate-200 dark:border-slate-800">
                  <NumInput value={reportData.iod.m7_thyroiditis} onChange={val => handleNestedChange('iod', 'm7_thyroiditis', val)} highlight />
                </td>
                <td className="py-1 px-2 border-r border-slate-200 dark:border-slate-800">
                  <NumInput value={reportData.iod.m7_thyroiditis_cum} onChange={val => handleNestedChange('iod', 'm7_thyroiditis_cum', val)} />
                </td>
                <td className="py-1 px-2 border-r border-slate-200 dark:border-slate-800">
                  <NumInput value={reportData.iod.m7_thyroiditis_prevYear} onChange={val => handleNestedChange('iod', 'm7_thyroiditis_prevYear', val)} />
                </td>
                <td className="py-1 px-2 text-center">
                  <CompSelect value={reportData.iod.m7_thyroiditis_comp} onChange={val => handleCompChange('iod', 'm7_thyroiditis_comp', val)} />
                </td>
              </tr>

              {/* 8 */}
              <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <td className="py-2 px-3 text-center font-bold border-r border-slate-200 dark:border-slate-800">8</td>
                <td className="py-2 px-3 font-bold border-r border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white">Tổng số bệnh nhân Basedow</td>
                <td className="py-1 px-2 border-r border-slate-200 dark:border-slate-800">
                  <NumInput value={reportData.iod.m8_basedow} onChange={val => handleNestedChange('iod', 'm8_basedow', val)} highlight />
                </td>
                <td className="py-1 px-2 border-r border-slate-200 dark:border-slate-800">
                  <NumInput value={reportData.iod.m8_basedow_cum} onChange={val => handleNestedChange('iod', 'm8_basedow_cum', val)} />
                </td>
                <td className="py-1 px-2 border-r border-slate-200 dark:border-slate-800">
                  <NumInput value={reportData.iod.m8_basedow_prevYear} onChange={val => handleNestedChange('iod', 'm8_basedow_prevYear', val)} />
                </td>
                <td className="py-1 px-2 text-center">
                  <CompSelect value={reportData.iod.m8_basedow_comp} onChange={val => handleCompChange('iod', 'm8_basedow_comp', val)} />
                </td>
              </tr>

              {/* 9 */}
              <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <td className="py-2 px-3 text-center font-bold border-r border-slate-200 dark:border-slate-800">9</td>
                <td className="py-2 px-3 font-bold border-r border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white">Tỷ lệ % phủ muối I ốt các huyện thị báo cáo</td>
                <td className="py-1 px-2 border-r border-slate-200 dark:border-slate-800">
                  <NumInput value={reportData.iod.m9_saltCoverageRatio} onChange={val => handleNestedChange('iod', 'm9_saltCoverageRatio', val)} highlight />
                </td>
                <td className="py-1 px-2 border-r border-slate-200 dark:border-slate-800">
                  <NumInput value={reportData.iod.m9_saltCoverageRatio_cum} onChange={val => handleNestedChange('iod', 'm9_saltCoverageRatio_cum', val)} />
                </td>
                <td className="py-1 px-2 border-r border-slate-200 dark:border-slate-800">
                  <NumInput value={reportData.iod.m9_saltCoverageRatio_prevYear} onChange={val => handleNestedChange('iod', 'm9_saltCoverageRatio_prevYear', val)} />
                </td>
                <td className="py-1 px-2 text-center">
                  <CompSelect value={reportData.iod.m9_saltCoverageRatio_comp} onChange={val => handleCompChange('iod', 'm9_saltCoverageRatio_comp', val)} />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Action status & Buttons (Hidden on Print) */}
      <div className="print:hidden bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 mt-6">
        <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
          <Save className="w-5 h-5 animate-pulse" />
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Xác nhận thông tin & Lưu trữ báo cáo:
          </span>
        </div>
        <div className="flex items-center flex-wrap gap-2.5">
          {loadingFirebase ? (
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold border border-slate-200 dark:border-slate-700">
              <Loader2 className="w-4 h-4 animate-spin text-rose-500" />
              <span>Đang tải số liệu...</span>
            </span>
          ) : reportData.lastSavedAt ? (
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800">
              <Clock className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>Lần lưu gần nhất: {new Date(reportData.lastSavedAt).toLocaleTimeString('vi-VN')} ({new Date(reportData.lastSavedAt).toLocaleDateString('vi-VN')})</span>
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-xs font-bold border border-amber-200 dark:border-amber-800">
              <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>Tự động tổng hợp</span>
            </span>
          )}



          {/* Export Excel Button */}
          <button
            onClick={handleExportExcel}
            className="px-3.5 py-2 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Tải Excel</span>
          </button>

          {/* Print Button */}
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-all"
          >
            <Printer className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            <span>In Báo cáo</span>
          </button>

          {/* Explicit Save Button */}
          <button
            onClick={handleSave}
            disabled={user?.role === 'VIEWER' || autoSaveStatus === 'saving'}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-rose-600/30 transition-all disabled:opacity-50"
          >
            {autoSaveStatus === 'saving' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>Lưu Báo Cáo</span>
          </button>
        </div>
      </div>
      {showCancerImportModal && (
        <CancerImportModal
          onClose={() => setShowCancerImportModal(false)}
          onImport={(data) => {
            setReportData(prev => ({
              ...prev,
              cancerDetails: {
                ...prev.cancerDetails,
                ...data
              }
            }));
            showToast('Đã import dữ liệu Ung thư', 'success');
          }}
        />
      )}

      {/* Note Detail Modal */}
      {selectedNoteType && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Ghi chú chi tiết Loại Ung thư
                  </h3>
                  <p className="text-xs text-rose-600 dark:text-rose-400 font-bold mt-0.5">
                    {selectedNoteType} (Báo cáo Tháng {month}/{year})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedNoteType(null)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Metrics Summary Badge */}
            {reportData.cancerDetails?.[selectedNoteType] && (
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl text-center text-xs border border-slate-200/80 dark:border-slate-700/80">
                <div>
                  <div className="text-[10px] text-slate-500 font-medium">Số Mắc</div>
                  <div className="font-bold text-slate-800 dark:text-slate-200">{reportData.cancerDetails[selectedNoteType].mac || 0}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 font-medium">Mắc t.lũy</div>
                  <div className="font-bold text-slate-800 dark:text-slate-200">{reportData.cancerDetails[selectedNoteType].macTichLuy || 0}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 font-medium">Số Chết</div>
                  <div className="font-bold text-slate-800 dark:text-slate-200">{reportData.cancerDetails[selectedNoteType].chet || 0}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 font-medium">Chết t.lũy</div>
                  <div className="font-bold text-slate-800 dark:text-slate-200">{reportData.cancerDetails[selectedNoteType].chetTichLuy || 0}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 font-medium">Ngừng ĐT</div>
                  <div className="font-bold text-slate-800 dark:text-slate-200">{reportData.cancerDetails[selectedNoteType].ngungDieuTri || 0}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 font-medium">Q.Lý h.tại</div>
                  <div className="font-bold text-rose-600 dark:text-rose-400">{reportData.cancerDetails[selectedNoteType].quanLyHienTai || 0}</div>
                </div>
              </div>
            )}

            {/* Textarea for full note */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Nội dung ghi chú đầy đủ:
              </label>
              <textarea
                rows={6}
                value={reportData.cancerDetails?.[selectedNoteType]?.note || ''}
                onChange={e => {
                  const newDetails = { ...reportData.cancerDetails };
                  if (!newDetails[selectedNoteType]) {
                    newDetails[selectedNoteType] = { mac: 0, macTichLuy: 0, chet: 0, chetTichLuy: 0, ngungDieuTri: 0, quanLyHienTai: 0, note: '' };
                  }
                  newDetails[selectedNoteType].note = e.target.value;
                  setReportData(prev => ({ ...prev, cancerDetails: newDetails }));
                }}
                placeholder="Nhập ghi chú chi tiết thông tin lâm sàng, chẩn đoán, chuyển viện hoặc diễn biến bệnh nhân..."
                className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 outline-none leading-relaxed resize-y"
              />
              <p className="text-[11px] text-slate-400 text-right">
                {(reportData.cancerDetails?.[selectedNoteType]?.note || '').length} ký tự
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setSelectedNoteType(null)}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-rose-600 text-white hover:bg-rose-500 transition-colors shadow-md shadow-rose-600/20"
              >
                Xác nhận & Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
