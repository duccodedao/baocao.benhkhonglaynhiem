export type TabType =
  | 'dashboard'
  | 'official_monthly_report'
  | 'report_quarter'
  | 'report_copd_asthma'
  | 'report_buou_co'
  | 'report_ruou_bia'
  | 'report_thuoc_la'
  | 'report_cancer'
  | 'screening_tha_dtd'
  | 'screening_copd_asthma'
  | 'screening_cancer'
  | '2.1_hypertension'
  | '2.2_diabetes'
  | '2.3_cancer'
  | '2.4_copd'
  | '2.5_asthma'
  | '2.6_iod'
  | 'list_ruou_bia'
  | 'list_thuoc_la'
  | 'account_settings'
  | 'system_settings'
  | 'notifications'
  | 'documents'
  | 'audit_logs'
  | 'admin_panel'
  | 'preview_passcode'
  | 'admin_notifications'
  | 'admin_github'
  // Legacy or sub-admin aliases
  | 'users'
  | 'backup'
  | 'program_config'
  | 'report_iod'
  | 'report_tt23'
  | 'old_report_template';

export const TAB_TO_HASH_MAP: Record<string, string> = {
  dashboard: 'dashboard',
  official_monthly_report: 'bao_cao_thang',
  report_quarter: 'bao_cao_quy',
  report_copd_asthma: 'copd_va_hen',
  report_buou_co: 'buou_co',
  report_ruou_bia: 'ruou_bia',
  report_thuoc_la: 'thuoc_la',
  report_cancer: 'phu_luc_ung_thu',
  screening_tha_dtd: 'kham_sang_loc_tha_dtd',
  screening_copd_asthma: 'kham_sang_loc_copd_hen',
  screening_cancer: 'kham_sang_loc_ung_thu',
  '2.1_hypertension': 'tang_huyet_ap',
  '2.2_diabetes': 'dai_thao_duong',
  '2.3_cancer': 'danh_sach_ung_thu',
  '2.4_copd': 'danh_sach_copd',
  '2.5_asthma': 'danh_sach_hen',
  '2.6_iod': 'danh_sach_iod',
  list_ruou_bia: 'co_so_ruou_bia',
  list_thuoc_la: 'co_so_thuoc_la',
  account_settings: 'cai_dat_tai_khoan',
  system_settings: 'he_thong',
  notifications: 'thong_bao',
  documents: 'quan_ly_van_ban',
  audit_logs: 'nhat_ky_hoat_dong',
  admin_panel: 'admin_panel',
  preview_passcode: 'preview_passcode',
  admin_notifications: 'quan_ly_thong_bao',
  admin_github: 'cau_hinh_github',
  users: 'quan_ly_tai_khoan',
  backup: 'sao_luu_khoi_phuc',
  program_config: 'cau_hinh_don_vi',
  report_iod: 'bao_cao_iod',
  report_tt23: 'bao_cao_tt23',
  old_report_template: 'mau_bao_cao_cu'
};

// Reverse map from hash -> tab key
export const HASH_TO_TAB_MAP: Record<string, string> = Object.entries(TAB_TO_HASH_MAP).reduce(
  (acc, [tabKey, hashValue]) => {
    acc[hashValue] = tabKey;
    // Also support raw tab key as fallback for backward compatibility
    acc[tabKey] = tabKey;
    return acc;
  },
  {} as Record<string, string>
);

export function getHashByTab(tabKey: string): string {
  return TAB_TO_HASH_MAP[tabKey] || tabKey;
}

export function getTabByHash(hashString: string): string {
  const cleanHash = hashString.replace('#', '').trim();
  return HASH_TO_TAB_MAP[cleanHash] || 'official_monthly_report';
}
